import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create authenticated client to get current user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Create service role client for privileged operations
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Parse request body
    const { invitationId } = await req.json();
    if (!invitationId) {
      throw new Error("Missing invitationId");
    }

    // Fetch invitation using service role
    const { data: invitation, error: fetchError } = await supabaseServiceRole
      .from("team_invitations")
      .select(
        "id, team_id, status, invited_user_id, email, role, invited_by, expires_at"
      )
      .eq("id", invitationId)
      .single();

    if (fetchError || !invitation) {
      console.error("Invitation fetch error:", fetchError);
      throw new Error("Invitation not found or has expired");
    }

    // Check if invitation is pending
    if (invitation.status !== "pending") {
      // If already accepted, just return the team_id for redirect
      if (invitation.status === "accepted") {
        return new Response(
          JSON.stringify({ teamId: invitation.team_id, alreadyAccepted: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("This invitation has expired or been cancelled");
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      throw new Error("This invitation has expired");
    }

    // Verify caller identity
    let isAuthorized = false;
    let reason = "";

    // Check 1: invited_user_id matches
    if (invitation.invited_user_id && invitation.invited_user_id === user.id) {
      isAuthorized = true;
      reason = "invited_user_id match";
    }
    // Check 2: email matches (case-insensitive)
    else if (
      invitation.email &&
      user.email &&
      invitation.email.toLowerCase() === user.email.toLowerCase()
    ) {
      isAuthorized = true;
      reason = "email match";
    }
    // Check 3: already a team member
    else {
      const { data: existingMember } = await supabaseServiceRole
        .from("team_members")
        .select("id")
        .eq("team_id", invitation.team_id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (existingMember) {
        isAuthorized = true;
        reason = "already a member";
      }
    }

    if (!isAuthorized) {
      console.log("Unauthorized acceptance attempt:", {
        userId: user.id,
        email: user.email,
      });
      throw new Error("You are not authorized to accept this invitation");
    }

    // Check if user is already a member (to avoid duplicate insertion)
    const { data: existingMember } = await supabaseServiceRole
      .from("team_members")
      .select("id")
      .eq("team_id", invitation.team_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    let memberId: string;

    if (existingMember) {
      memberId = existingMember.id;
    } else {
      // Add user to team
      const { data: newMember, error: memberError } = await supabaseServiceRole
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          status: "active",
        })
        .select("id")
        .single();

      if (memberError) {
        console.error("Error inserting team member:", memberError);
        throw new Error("Failed to add you to the team");
      }

      memberId = newMember.id;
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseServiceRole
      .from("team_member_roles")
      .select("id")
      .eq("team_member_id", memberId)
      .maybeSingle();

    if (!existingRole) {
      // Assign role
      const { error: roleError } = await supabaseServiceRole
        .from("team_member_roles")
        .insert({
          team_member_id: memberId,
          role: invitation.role || "member",
          assigned_by: invitation.invited_by,
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
        throw new Error("Failed to assign role");
      }
    } else {
      console.log("Role already exists for member:", memberId);
    }

    // Update invitation status
    const { error: updateError } = await supabaseServiceRole
      .from("team_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      throw new Error("Failed to update invitation status");
    }

    return new Response(JSON.stringify({ teamId: invitation.team_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in accept-team-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to accept invitation" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
