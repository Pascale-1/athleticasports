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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find active availabilities expiring within 24 hours that haven't been reminded
    const { data: expiring, error } = await supabase
      .from("player_availability")
      .select("id, user_id, sport, expires_at")
      .eq("is_active", true)
      .eq("reminder_sent", false)
      .lte("expires_at", in24h.toISOString())
      .gte("expires_at", now.toISOString());

    if (error) throw error;

    console.log(`[expiry-reminder] Found ${expiring?.length || 0} expiring availabilities`);

    let notificationsSent = 0;

    for (const avail of expiring || []) {
      // Send notification
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: avail.user_id,
          type: "availability_expiring",
          title: "Availability Expiring Soon",
          message: `Your ${avail.sport} availability expires tomorrow. Extend it to keep finding matches!`,
          link: "/events?tab=matching",
          metadata: {
            availability_id: avail.id,
            sport: avail.sport,
            expires_at: avail.expires_at,
          },
        });

      if (notifError) {
        console.error("[expiry-reminder] Notification error:", notifError);
        continue;
      }

      // Mark as reminded
      await supabase
        .from("player_availability")
        .update({ reminder_sent: true })
        .eq("id", avail.id);

      notificationsSent++;
    }

    console.log(`[expiry-reminder] Sent ${notificationsSent} reminders`);

    return new Response(
      JSON.stringify({ success: true, notificationsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[expiry-reminder] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
