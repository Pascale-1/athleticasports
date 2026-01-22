import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find events starting in 3 days
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, type, start_time, team_id, created_by")
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());

    if (eventsError) throw eventsError;

    let notificationsSent = 0;
    const processedUsers = new Set<string>();

    for (const event of upcomingEvents || []) {
      // For team events, notify team members
      if (event.team_id) {
        const { data: members } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", event.team_id)
          .eq("status", "active");

        // Get users who already declined this event
        const { data: declined } = await supabase
          .from("event_attendance")
          .select("user_id")
          .eq("event_id", event.id)
          .eq("status", "not_attending");

        const declinedIds = new Set((declined || []).map((d) => d.user_id));

        for (const member of members || []) {
          // Skip if user declined or is the creator
          if (declinedIds.has(member.user_id) || member.user_id === event.created_by) continue;
          
          // Prevent duplicate notifications for same user/event
          const key = `${member.user_id}-${event.id}`;
          if (processedUsers.has(key)) continue;
          processedUsers.add(key);

          const eventIcon = event.type === "training" ? "🏋️" : event.type === "match" ? "⚽" : "👥";
          const eventTime = new Date(event.start_time).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          await supabase.from("notifications").insert({
            user_id: member.user_id,
            type: "event_reminder",
            title: "Event Reminder ⏰",
            message: `${eventIcon} "${event.title}" is in 3 days - ${eventTime}`,
            link: `/events/${event.id}`,
            metadata: { 
              event_id: event.id, 
              event_type: event.type, 
              reminder_days: 3 
            },
          });

          notificationsSent++;
        }
      } else if (event.created_by) {
        // For public events without a team, just remind the creator
        const eventIcon = event.type === "training" ? "🏋️" : event.type === "match" ? "⚽" : "👥";
        const eventTime = new Date(event.start_time).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        await supabase.from("notifications").insert({
          user_id: event.created_by,
          type: "event_reminder",
          title: "Event Reminder ⏰",
          message: `${eventIcon} Your event "${event.title}" is in 3 days - ${eventTime}`,
          link: `/events/${event.id}`,
          metadata: { 
            event_id: event.id, 
            event_type: event.type, 
            reminder_days: 3 
          },
        });

        notificationsSent++;
      }
    }

    console.log(`Processed ${upcomingEvents?.length || 0} events, sent ${notificationsSent} reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: upcomingEvents?.length || 0, 
        notificationsSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending reminders:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
