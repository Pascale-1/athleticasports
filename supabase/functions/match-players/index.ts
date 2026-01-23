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

// District adjacency map for location scoring
const DISTRICT_ADJACENCY: Record<string, string[]> = {
  '75001': ['75002', '75003', '75004', '75006', '75007', '75008', '75009'],
  '75002': ['75001', '75003', '75009', '75010'],
  '75003': ['75001', '75002', '75004', '75010', '75011'],
  '75004': ['75001', '75003', '75005', '75011', '75012'],
  '75005': ['75004', '75006', '75013', '75014'],
  '75006': ['75001', '75005', '75007', '75014', '75015'],
  '75007': ['75001', '75006', '75008', '75015', '75016'],
  '75008': ['75001', '75007', '75009', '75016', '75017'],
  '75009': ['75001', '75002', '75008', '75010', '75017', '75018'],
  '75010': ['75002', '75003', '75009', '75011', '75018', '75019'],
  '75011': ['75003', '75004', '75010', '75012', '75019', '75020'],
  '75012': ['75004', '75011', '75013', '75020', 'vincennes', 'saint-mande'],
  '75013': ['75005', '75012', '75014'],
  '75014': ['75005', '75006', '75013', '75015'],
  '75015': ['75006', '75007', '75014', '75016', 'issy', 'boulogne'],
  '75016': ['75007', '75008', '75015', '75017', 'boulogne', 'neuilly'],
  '75017': ['75008', '75009', '75016', '75018', 'levallois', 'clichy', 'neuilly'],
  '75018': ['75009', '75010', '75017', '75019', 'saint-denis', 'clichy'],
  '75019': ['75010', '75011', '75018', '75020', 'pantin'],
  '75020': ['75011', '75012', '75019', 'montreuil'],
  'boulogne': ['75015', '75016', 'issy'],
  'levallois': ['75017', 'neuilly', 'clichy'],
  'neuilly': ['75016', '75017', 'levallois'],
  'issy': ['75015', 'boulogne'],
  'vincennes': ['75012', 'saint-mande', 'montreuil'],
  'saint-mande': ['75012', 'vincennes'],
  'montreuil': ['75020', 'vincennes'],
  'saint-denis': ['75018', 'pantin'],
  'pantin': ['75019', 'saint-denis'],
  'clichy': ['75017', '75018', 'levallois'],
};

// Calculate match score (0-100)
function calculateMatchScore(avail: any, event: any): number {
  let score = 0;
  
  // Sport score (0-30) - Required match
  if (avail.sport && event.sport) {
    if (avail.sport.toLowerCase() === event.sport.toLowerCase()) {
      score += 30;
    } else {
      return 0; // No match if sport doesn't match
    }
  } else {
    return 0;
  }
  
  // Location score (0-25)
  const playerDistrict = avail.location_district;
  const eventDistrict = event.location_district;
  
  if (playerDistrict && eventDistrict) {
    if (playerDistrict === eventDistrict) {
      score += 25;
    } else if (DISTRICT_ADJACENCY[playerDistrict]?.includes(eventDistrict)) {
      score += 18;
    } else {
      score += 5;
    }
  } else {
    score += 15; // Neutral if no location preference
  }
  
  // Time score (0-25)
  const eventDate = new Date(event.start_time).getTime();
  const availFrom = new Date(avail.available_from).getTime();
  const availUntil = new Date(avail.available_until).getTime();
  
  if (eventDate >= availFrom && eventDate <= availUntil) {
    const availWindow = availUntil - availFrom;
    const eventMidpoint = eventDate;
    const availMidpoint = (availFrom + availUntil) / 2;
    const distanceFromCenter = Math.abs(eventMidpoint - availMidpoint);
    const maxDistance = availWindow / 2;
    
    const centerScore = maxDistance > 0 
      ? Math.round(25 - (distanceFromCenter / maxDistance) * 10)
      : 25;
    score += Math.max(15, Math.min(25, centerScore));
  } else {
    return 0; // Event outside availability window
  }
  
  // Skill score (0-20)
  const playerSkill = avail.skill_level;
  const minLevel = event.skill_level_min || 1;
  const maxLevel = event.skill_level_max || 5;
  
  if (playerSkill) {
    if (playerSkill >= minLevel && playerSkill <= maxLevel) {
      score += 20;
    } else {
      const distance = playerSkill < minLevel 
        ? minLevel - playerSkill 
        : playerSkill - maxLevel;
      if (distance === 1) score += 10;
      else if (distance === 2) score += 5;
      // else no points for skill
    }
  } else {
    score += 15; // Neutral if no skill specified
  }
  
  return score;
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

    // Get events looking for players
    // If event_id is provided, fetch only that specific event (for immediate matching after creation)
    // Otherwise, fetch all events looking for players
    let eventsQuery = supabase
      .from("events")
      .select("*")
      .eq("type", "match")
      .eq("looking_for_players", true)
      .gte("start_time", new Date().toISOString());

    if (event_id) {
      eventsQuery = supabase
        .from("events")
        .select("*")
        .eq("id", event_id);
      console.log(`[match-players] Targeting specific event: ${event_id}`);
    }

    const { data: events, error: eventsError } = await eventsQuery;

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
    const matches: Array<{ avail: any; event: any; score: number }> = [];
    
    for (const avail of availabilities) {
      for (const event of events) {
        // Skip if same user created the event
        if (event.created_by === avail.user_id) continue;

        // Skip if proposal already exists
        const proposalKey = `${event.id}-${avail.user_id}`;
        if (existingProposalSet.has(proposalKey)) continue;

        // Skip if already attending
        if (existingAttendeeSet.has(proposalKey)) continue;

        // Calculate match score
        const score = calculateMatchScore(avail, event);
        
        if (score > 0) {
          matches.push({ avail, event, score });
        }
      }
    }
    
    // Sort by score (best matches first)
    matches.sort((a, b) => b.score - a.score);
    
    console.log(`[match-players] Found ${matches.length} potential matches`);

    // Create proposals for matches
    for (const { avail, event, score } of matches) {
      const proposalKey = `${event.id}-${avail.user_id}`;
      
      console.log(`[match-players] Creating proposal for player ${avail.user_id} and event ${event.id} (score: ${score})`);

      // Create proposal with score
      const { error: insertError } = await supabase
        .from("match_proposals")
        .insert({
          event_id: event.id,
          player_user_id: avail.user_id,
          status: "pending",
          match_score: score,
          interest_level: "pending",
        });

      if (insertError) {
        console.error("[match-players] Error creating proposal:", insertError);
        continue;
      }

      result.proposals_created++;
      existingProposalSet.add(proposalKey);

      // Get match label for notification
      const matchLabel = score >= 85 ? "Perfect" : score >= 70 ? "Great" : score >= 50 ? "Good" : "";

      // NOTIFICATION 1: Notify the available player about the event
      const { error: playerNotifError } = await supabase
        .from("notifications")
        .insert({
          user_id: avail.user_id,
          type: "match_proposal",
          title: matchLabel ? `${matchLabel} Match Found!` : "Match Found!",
          message: `A game matches your availability: "${event.title}"`,
          link: `/events/${event.id}`,
          metadata: {
            event_id: event.id,
            event_title: event.title,
            sport: event.sport,
            match_score: score,
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
            match_score: score,
          },
        });

      if (organizerNotifError) {
        console.error("[match-players] Error creating organizer notification:", organizerNotifError);
      } else {
        result.organizer_notifications_sent++;
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
