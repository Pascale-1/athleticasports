import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { token }: RequestBody = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required", error_code: "missing_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the deletion request
    const { data: deletionRequest, error: findError } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("*")
      .eq("confirmation_token", token)
      .is("confirmed_at", null)
      .single();

    if (findError || !deletionRequest) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired token", 
          error_code: "invalid_token" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(deletionRequest.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: "Token has expired", 
          error_code: "expired_token",
          language: deletionRequest.language 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = deletionRequest.user_id;
    const language = deletionRequest.language;

    console.log(`Starting account deletion for user: ${userId}`);

    // Delete user data from all tables in correct order (respecting foreign keys)
    // Order matters to avoid foreign key constraint violations
    
    // 1. Delete event team members (depends on event_teams)
    await supabaseAdmin
      .from("event_team_members")
      .delete()
      .eq("user_id", userId);

    // 2. Delete training session attendance
    await supabaseAdmin
      .from("training_session_attendance")
      .delete()
      .eq("user_id", userId);

    // 3. Delete event attendance
    await supabaseAdmin
      .from("event_attendance")
      .delete()
      .eq("user_id", userId);

    // 4. Delete match proposals
    await supabaseAdmin
      .from("match_proposals")
      .delete()
      .eq("player_user_id", userId);

    // 5. Delete player availability
    await supabaseAdmin
      .from("player_availability")
      .delete()
      .eq("user_id", userId);

    // 6. Delete player performance levels
    await supabaseAdmin
      .from("player_performance_levels")
      .delete()
      .eq("user_id", userId);

    // 7. Delete team messages
    await supabaseAdmin
      .from("team_messages")
      .delete()
      .eq("user_id", userId);

    // 8. Delete team announcements posted by user
    await supabaseAdmin
      .from("team_announcements")
      .delete()
      .eq("posted_by", userId);

    // 9. Delete team member roles (for members the user is part of)
    const { data: userTeamMembers } = await supabaseAdmin
      .from("team_members")
      .select("id")
      .eq("user_id", userId);

    if (userTeamMembers && userTeamMembers.length > 0) {
      const memberIds = userTeamMembers.map(m => m.id);
      await supabaseAdmin
        .from("team_member_roles")
        .delete()
        .in("team_member_id", memberIds);
    }

    // 10. Delete team members
    await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("user_id", userId);

    // 11. Delete team invitations (sent by or to user)
    await supabaseAdmin
      .from("team_invitations")
      .delete()
      .or(`invited_by.eq.${userId},invited_user_id.eq.${userId}`);

    // 12. Delete followers relationships
    await supabaseAdmin
      .from("followers")
      .delete()
      .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    // 13. Delete notifications
    await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    // 14. Delete user activity log
    await supabaseAdmin
      .from("user_activity_log")
      .delete()
      .eq("user_id", userId);

    // 15. Delete user goals
    await supabaseAdmin
      .from("user_goals")
      .delete()
      .eq("user_id", userId);

    // 16. Delete activities
    await supabaseAdmin
      .from("activities")
      .delete()
      .eq("user_id", userId);

    // 17. Delete feedback
    await supabaseAdmin
      .from("feedback")
      .delete()
      .eq("user_id", userId);

    // 18. Delete events created by user (first update team events to null creator)
    // For team events, we just remove the reference, for personal events, delete
    const { data: userEvents } = await supabaseAdmin
      .from("events")
      .select("id, team_id")
      .eq("created_by", userId);

    if (userEvents) {
      // Delete personal events (no team)
      const personalEventIds = userEvents.filter(e => !e.team_id).map(e => e.id);
      if (personalEventIds.length > 0) {
        // First delete related data
        await supabaseAdmin
          .from("event_attendance")
          .delete()
          .in("event_id", personalEventIds);
        
        await supabaseAdmin
          .from("events")
          .delete()
          .in("id", personalEventIds);
      }
    }

    // 19. Delete teams owned by user
    const { data: userTeams } = await supabaseAdmin
      .from("teams")
      .select("id")
      .eq("created_by", userId);

    if (userTeams && userTeams.length > 0) {
      const teamIds = userTeams.map(t => t.id);
      
      // Delete all team-related data first
      await supabaseAdmin
        .from("team_announcements")
        .delete()
        .in("team_id", teamIds);
      
      await supabaseAdmin
        .from("team_messages")
        .delete()
        .in("team_id", teamIds);
      
      // Get all team members to delete their roles
      const { data: allTeamMembers } = await supabaseAdmin
        .from("team_members")
        .select("id")
        .in("team_id", teamIds);
      
      if (allTeamMembers && allTeamMembers.length > 0) {
        await supabaseAdmin
          .from("team_member_roles")
          .delete()
          .in("team_member_id", allTeamMembers.map(m => m.id));
      }
      
      await supabaseAdmin
        .from("team_members")
        .delete()
        .in("team_id", teamIds);
      
      await supabaseAdmin
        .from("team_invitations")
        .delete()
        .in("team_id", teamIds);
      
      await supabaseAdmin
        .from("player_performance_levels")
        .delete()
        .in("team_id", teamIds);
      
      // Delete team events
      const { data: teamEvents } = await supabaseAdmin
        .from("events")
        .select("id")
        .in("team_id", teamIds);
      
      if (teamEvents && teamEvents.length > 0) {
        const eventIds = teamEvents.map(e => e.id);
        await supabaseAdmin.from("event_attendance").delete().in("event_id", eventIds);
        await supabaseAdmin.from("event_teams").delete().in("event_id", eventIds);
        await supabaseAdmin.from("match_proposals").delete().in("event_id", eventIds);
        await supabaseAdmin.from("events").delete().in("id", eventIds);
      }
      
      // Finally delete the teams
      await supabaseAdmin
        .from("teams")
        .delete()
        .in("id", teamIds);
    }

    // 20. Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // 21. Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    // 22. Delete all deletion requests for this user
    await supabaseAdmin
      .from("account_deletion_requests")
      .delete()
      .eq("user_id", userId);

    // 23. Finally, delete the auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to delete user account", 
          error_code: "auth_deletion_failed",
          language 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: language === "fr" 
          ? "Votre compte a été supprimé définitivement" 
          : "Your account has been permanently deleted",
        language
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in confirm-account-deletion:", error);
    return new Response(
      JSON.stringify({ error: error.message, error_code: "server_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
