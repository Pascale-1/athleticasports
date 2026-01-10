import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Player {
  userId: string;
  username: string;
  displayName: string | null;
  level: number;
}

interface Team {
  teamName: string;
  teamNumber: number;
  averageLevel: number;
  members: Player[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { sessionId, numTeams } = await req.json();

    if (!sessionId || !numTeams || numTeams < 2 || numTeams > 6) {
      throw new Error('Invalid request: sessionId required and numTeams must be between 2-6');
    }

    // Fetch training session
    const { data: session, error: sessionError } = await supabaseClient
      .from('training_sessions')
      .select('team_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Training session not found');
    }

    // Verify user is coach or admin
    const { data: roleData, error: roleError } = await supabaseClient.rpc('get_user_team_role', {
      _user_id: user.id,
      _team_id: session.team_id,
    });

    const canManage = await supabaseClient.rpc('can_manage_team', {
      _user_id: user.id,
      _team_id: session.team_id,
    });

    if (roleError || (!canManage.data && roleData !== 'coach')) {
      throw new Error('Only coaches and admins can generate teams');
    }

    // Fetch all active team members
    const { data: members, error: membersError } = await supabaseClient
      .from('team_members')
      .select('user_id')
      .eq('team_id', session.team_id)
      .eq('status', 'active');

    if (membersError || !members || members.length === 0) {
      throw new Error('No active team members found');
    }

    // Fetch profiles for these members
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('user_id, username, display_name')
      .in('user_id', members.map(m => m.user_id));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Fetch performance levels for these members
    const { data: levels, error: levelsError } = await supabaseClient
      .from('player_performance_levels')
      .select('user_id, level')
      .eq('team_id', session.team_id);

    if (levelsError) {
      console.error('Error fetching levels:', levelsError);
    }

    const levelMap = new Map(levels?.map(l => [l.user_id, l.level]) || []);

    // Build player list with levels (default to 3 if not set)
    const players: Player[] = members.map(m => {
      const profile = profileMap.get(m.user_id);
      return {
        userId: m.user_id,
        username: profile?.username || 'Unknown',
        displayName: profile?.display_name || null,
        level: levelMap.get(m.user_id) || 3,
      };
    });

    // Sort players by level (strongest first)
    players.sort((a, b) => a.level - b.level);

    // Initialize teams
    const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      teamName: `Team ${String.fromCharCode(65 + i)}`,
      teamNumber: i + 1,
      averageLevel: 0,
      members: [],
    }));

    // Balanced distribution algorithm
    for (const player of players) {
      // Find team with lowest current average
      let minAvg = Infinity;
      let targetTeam = 0;
      
      teams.forEach((team, idx) => {
        const currentAvg = team.members.length === 0 
          ? 0 
          : team.members.reduce((sum, p) => sum + p.level, 0) / team.members.length;
        
        if (currentAvg < minAvg) {
          minAvg = currentAvg;
          targetTeam = idx;
        }
      });

      teams[targetTeam].members.push(player);
    }

    // Calculate final averages
    teams.forEach(team => {
      team.averageLevel = team.members.length === 0
        ? 0
        : team.members.reduce((sum, p) => sum + p.level, 0) / team.members.length;
    });

    // Delete existing teams for this session
    const { error: deleteError } = await supabaseServiceRole
      .from('training_session_teams')
      .delete()
      .eq('training_session_id', sessionId);

    if (deleteError) {
      console.error('Error deleting old teams:', deleteError);
    }

    // Insert new teams
    for (const team of teams) {
      const { data: teamRecord, error: teamError } = await supabaseServiceRole
        .from('training_session_teams')
        .insert({
          training_session_id: sessionId,
          team_name: team.teamName,
          team_number: team.teamNumber,
          average_level: team.averageLevel,
        })
        .select()
        .single();

      if (teamError || !teamRecord) {
        console.error('Error creating team:', teamError);
        continue;
      }

      // Insert team members
      const memberInserts = team.members.map(member => ({
        session_team_id: teamRecord.id,
        user_id: member.userId,
        performance_level: member.level,
      }));

      const { error: membersInsertError } = await supabaseServiceRole
        .from('training_session_team_members')
        .insert(memberInserts);

      if (membersInsertError) {
        console.error('Error inserting team members:', membersInsertError);
      }
    }

    return new Response(JSON.stringify({ teams }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating teams:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
