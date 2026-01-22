import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  sport: string | null;
  invite_code: string | null;
  allow_link_joining: boolean | null;
  created_invite_code_at: string | null;
  // Default venue settings
  default_venue: string | null;
  default_venue_url: string | null;
  default_training_time: string | null;
  default_training_day: number | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
  status: string;
}

export interface TeamMemberWithProfile extends TeamMember {
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  role: string;
}

export const createTeam = async (data: {
  name: string;
  description?: string;
  is_private: boolean;
  avatar_url?: string;
  sport: string;
}): Promise<Team> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: data.name,
      description: data.description || null,
      is_private: data.is_private,
      avatar_url: data.avatar_url || null,
      sport: data.sport,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return team;
};

export const updateTeam = async (
  teamId: string,
  data: Partial<Pick<Team, "name" | "description" | "is_private" | "avatar_url" | "default_venue" | "default_venue_url" | "default_training_time" | "default_training_day">>
) => {
  const { data: team, error } = await supabase
    .from("teams")
    .update(data)
    .eq("id", teamId)
    .select()
    .single();

  if (error) throw error;
  return team;
};

export const deleteTeam = async (teamId: string) => {
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw error;
};

export const getUserTeamRole = async (userId: string, teamId: string) => {
  const { data, error } = await supabase.rpc("get_user_team_role", {
    _user_id: userId,
    _team_id: teamId,
  });

  if (error) throw error;
  return data as string | null;
};

export const isTeamMember = async (userId: string, teamId: string) => {
  const { data, error } = await supabase.rpc("is_team_member", {
    _user_id: userId,
    _team_id: teamId,
  });

  if (error) throw error;
  return data as boolean;
};

export const canManageTeam = async (userId: string, teamId: string) => {
  const { data, error } = await supabase.rpc("can_manage_team", {
    _user_id: userId,
    _team_id: teamId,
  });

  if (error) throw error;
  return data as boolean;
};

export const leaveTeam = async (teamId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) throw error;
};

export const transferTeamOwnership = async (
  teamId: string,
  newOwnerId: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get current owner's team_member record
  const { data: currentOwnerMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!currentOwnerMember) throw new Error("Current owner not found");

  // Get new owner's team_member record
  const { data: newOwnerMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", newOwnerId)
    .single();

  if (!newOwnerMember) throw new Error("New owner not found");

  // Update current owner to admin
  const { error: updateCurrentError } = await supabase
    .from("team_member_roles")
    .update({ role: "admin" })
    .eq("team_member_id", currentOwnerMember.id)
    .eq("role", "owner");

  if (updateCurrentError) throw updateCurrentError;

  // Update new owner to owner
  const { error: updateNewError } = await supabase
    .from("team_member_roles")
    .update({ role: "owner", assigned_by: user.id })
    .eq("team_member_id", newOwnerMember.id);

  if (updateNewError) throw updateNewError;
};

export const joinTeamByCode = async (inviteCode: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Find team by invite code
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, allow_link_joining, created_by")
    .eq("invite_code", inviteCode.toUpperCase())
    .single();

  if (teamError || !team) throw new Error("Invalid invite code");
  if (!team.allow_link_joining) throw new Error("Team is not accepting new members");

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    return { teamId: team.id, alreadyMember: true };
  }

  // Add user to team
  const { data: newMember, error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      status: "active",
    })
    .select()
    .single();

  if (memberError) throw memberError;

  // Assign default role (member)
  const { error: roleError } = await supabase
    .from("team_member_roles")
    .insert({
      team_member_id: newMember.id,
      role: "member",
      assigned_by: team.created_by,
    });

  if (roleError) throw roleError;

  return { teamId: team.id, alreadyMember: false };
};
