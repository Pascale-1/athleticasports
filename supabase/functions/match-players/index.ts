import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchResult {
  proposals_created: number;
  player_notifications_sent: number;
  organizer_notifications_sent: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { event_id, availability_id } = body;

    let result: MatchResult = { 
      proposals_created: 0, 
      player_notifications_sent: 0,
      organizer_notifications_sent: 0 
    };

    // Get all active player availabilities
    const { data: availabilities, error: availError } = await supabase
      .from("player_availability")
      .select("*")
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString());

    if (availError) {
      console.error("[match-players] Error fetching availabilities:", availError);
      throw availError;
    }

    // Get all matches looking for players (with sport column)
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("type", "match")
      .eq("looking_for_players", true)
      .gte("start_time", new Date().toISOString());

    if (eventsError) {
      console.error("[match-players] Error fetching events:", eventsError);
      throw eventsError;
    }

    console.log(`[match-players] Found ${availabilities?.length || 0} availabilities and ${events?.length || 0} events`);

    if (!availabilities?.length || !events?.length) {
      return new Response(
        JSON.stringify({ success: true, result, message: "No availabilities or events to match" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing proposals to avoid duplicates
    const { data: existingProposals } = await supabase
      .from("match_proposals")
      .select("event_id, player_user_id");

    const existingProposalSet = new Set(
      (existingProposals || []).map((p) => `${p.event_id}-${p.player_user_id}`)
    );

    // Get existing attendees
    const { data: existingAttendees } = await supabase
      .from("event_attendance")
      .select("event_id, user_id");

    const existingAttendeeSet = new Set(
      (existingAttendees || []).map((a) => `${a.event_id}-${a.user_id}`)
    );

    // Get player profiles for notifications
    const playerIds = availabilities.map(a => a.user_id);
    const { data: playerProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username")
      .in("user_id", playerIds);

    const profileMap = new Map(
      (playerProfiles || []).map(p => [p.user_id, p.display_name || p.username || "A player"])
    );

    // Match each availability with compatible events
    for (const avail of availabilities) {
      for (const event of events) {
        // Skip if same user created the event
        if (event.created_by === avail.user_id) {
          console.log(`[match-players] Skipping - same user for event ${event.id}`);
          continue;
        }

        // Skip if proposal already exists
        const proposalKey = `${event.id}-${avail.user_id}`;
        if (existingProposalSet.has(proposalKey)) {
          console.log(`[match-players] Skipping - proposal already exists for ${proposalKey}`);
          continue;
        }

        // Skip if already attending
        if (existingAttendeeSet.has(proposalKey)) {
          console.log(`[match-players] Skipping - already attending for ${proposalKey}`);
          continue;
        }

        // SPORT MATCHING - Critical check
        if (avail.sport && event.sport) {
          if (avail.sport.toLowerCase() !== event.sport.toLowerCase()) {
            console.log(`[match-players] Skipping - sport mismatch: ${avail.sport} vs ${event.sport}`);
            continue;
          }
        }

        // Check date overlap
        const eventDate = new Date(event.start_time);
        const availFrom = new Date(avail.available_from);
        const availUntil = new Date(avail.available_until);

        if (eventDate < availFrom || eventDate > availUntil) {
          console.log(`[match-players] Skipping - date out of range for event ${event.id}`);
          continue;
        }

        console.log(`[match-players] Creating proposal for player ${avail.user_id} and event ${event.id}`);

        // Create proposal
        const { error: insertError } = await supabase
          .from("match_proposals")
          .insert({
            event_id: event.id,
            player_user_id: avail.user_id,
            status: "pending",
          });

        if (insertError) {
          console.error("[match-players] Error creating proposal:", insertError);
          continue;
        }

        result.proposals_created++;
        existingProposalSet.add(proposalKey);

        // NOTIFICATION 1: Notify the available player about the event
        const { error: playerNotifError } = await supabase
          .from("notifications")
          .insert({
            user_id: avail.user_id,
            type: "match_proposal",
            title: "Match Found!",
            message: `A game matches your availability: "${event.title}"`,
            link: `/events/${event.id}`,
            metadata: {
              event_id: event.id,
              event_title: event.title,
              sport: event.sport,
            },
          });

        if (playerNotifError) {
          console.error("[match-players] Error creating player notification:", playerNotifError);
        } else {
          result.player_notifications_sent++;
        }

        // NOTIFICATION 2: Notify the event organizer about the available player
        const playerName = profileMap.get(avail.user_id) || "A player";
        const { error: organizerNotifError } = await supabase
          .from("notifications")
          .insert({
            user_id: event.created_by,
            type: "player_available",
            title: "Player Available!",
            message: `${playerName} is available for your game "${event.title}"`,
            link: `/events/${event.id}`,
            metadata: {
              event_id: event.id,
              player_user_id: avail.user_id,
              player_name: playerName,
            },
          });

        if (organizerNotifError) {
          console.error("[match-players] Error creating organizer notification:", organizerNotifError);
        } else {
          result.organizer_notifications_sent++;
        }
      }
    }

    console.log(`[match-players] Complete. Result:`, result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[match-players] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
