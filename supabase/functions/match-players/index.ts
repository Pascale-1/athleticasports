import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchResult {
  proposals_created: number;
  notifications_sent: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { event_id, availability_id } = body;

    let result: MatchResult = { proposals_created: 0, notifications_sent: 0 };

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

    // Get all matches looking for players
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

    if (!availabilities?.length || !events?.length) {
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing proposals to avoid duplicates
    const { data: existingProposals, error: proposalsError } = await supabase
      .from("match_proposals")
      .select("event_id, player_user_id");

    if (proposalsError) {
      console.error("[match-players] Error fetching existing proposals:", proposalsError);
    }

    const existingProposalSet = new Set(
      (existingProposals || []).map((p) => `${p.event_id}-${p.player_user_id}`)
    );

    // Get existing attendees to avoid matching players already in events
    const { data: existingAttendees, error: attendeesError } = await supabase
      .from("event_attendance")
      .select("event_id, user_id");

    if (attendeesError) {
      console.error("[match-players] Error fetching attendees:", attendeesError);
    }

    const existingAttendeeSet = new Set(
      (existingAttendees || []).map((a) => `${a.event_id}-${a.user_id}`)
    );

    // Match each availability with compatible events
    for (const avail of availabilities) {
      for (const event of events) {
        // Skip if same user created the event
        if (event.created_by === avail.user_id) {
          continue;
        }

        // Skip if proposal already exists
        const proposalKey = `${event.id}-${avail.user_id}`;
        if (existingProposalSet.has(proposalKey)) {
          continue;
        }

        // Skip if already attending
        if (existingAttendeeSet.has(proposalKey)) {
          continue;
        }

        // Check date overlap
        const eventDate = new Date(event.start_time);
        const availFrom = new Date(avail.available_from);
        const availUntil = new Date(avail.available_until);

        if (eventDate < availFrom || eventDate > availUntil) {
          continue;
        }

        // Basic location matching (if both have location, do simple contains check)
        if (avail.location && event.location) {
          const availLoc = avail.location.toLowerCase();
          const eventLoc = event.location.toLowerCase();
          // Simple partial match - more sophisticated geo matching could be added later
          if (!availLoc.includes(eventLoc) && !eventLoc.includes(availLoc)) {
            // Don't skip - location matching is optional for MVP
          }
        }

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

        // Create notification
        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: avail.user_id,
            type: "match_proposal",
            title: "Match Found!",
            message: `We found a match for you: "${event.title}"`,
            link: `/events/${event.id}`,
            metadata: {
              event_id: event.id,
              event_title: event.title,
            },
          });

        if (notifError) {
          console.error("[match-players] Error creating notification:", notifError);
        } else {
          result.notifications_sent++;
        }
      }
    }

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
