import { createClient } from '@supabase/supabase-js'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  invitationId: string
  teamId: string
  recipientEmail: string
  role: string
  appOrigin?: string // Client's origin for building invite links
}

function generateEmailHTML(teamName: string, inviterName: string, role: string, acceptUrl: string, authFallbackUrl: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; padding: 20px 0 48px;">
    <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0;">Team Invitation</h1>
    
    <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">
      <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong>.
    </p>
    
    <div style="padding: 27px 0;">
      <a href="${acceptUrl}" target="_blank" style="background-color: #8B5CF6; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 100%; padding: 12px;">
        Accept Invitation
      </a>
    </div>
    
    <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">
      Or copy and paste this URL into your browser:
    </p>
    
    <div style="display: inline-block; padding: 16px 4.5%; width: 90.5%; background-color: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-size: 12px; word-break: break-all;">
      ${acceptUrl}
    </div>
    
    <p style="color: #898989; font-size: 12px; line-height: 22px; margin-top: 20px; margin-bottom: 12px;">
      Not logged in? <a href="${authFallbackUrl}" target="_blank" style="color: #8B5CF6; text-decoration: underline;">Sign in first</a>, then accept your invitation.
    </p>
    
    <p style="color: #898989; font-size: 12px; line-height: 22px; margin-top: 12px; margin-bottom: 24px;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
    
    <p style="color: #898989; font-size: 12px; line-height: 22px; margin-top: 12px; margin-bottom: 24px;">
      <a href="${appUrl}" target="_blank" style="color: #8B5CF6; text-decoration: underline;">Athletica Sports</a>
    </p>
  </div>
</body>
</html>
  `
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { invitationId, teamId, recipientEmail, role, appOrigin }: InvitationRequest = await req.json()

    console.log('Sending invitation email:', { invitationId, teamId, recipientEmail, role, appOrigin })

    // Create authenticated Supabase client to verify user
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user can manage the team
    const { data: canManage, error: authzError } = await supabaseAuth.rpc('can_manage_team', {
      _user_id: user.id,
      _team_id: teamId
    })

    if (authzError || !canManage) {
      console.error('Authorization error:', authzError)
      return new Response(
        JSON.stringify({ error: 'Forbidden - You do not have permission to send invitations for this team' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for privileged operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Fetch team details
    const { data: team, error: teamError } = await supabaseClient
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single()

    if (teamError) {
      console.error('Error fetching team:', teamError)
      throw new Error('Team not found')
    }

    // Fetch inviter details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('team_invitations')
      .select('invited_by')
      .eq('id', invitationId)
      .single()

    if (invitationError) {
      console.error('Error fetching invitation:', invitationError)
      throw new Error('Invitation not found')
    }

    const { data: inviter, error: inviterError } = await supabaseClient
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', invitation.invited_by)
      .single()

    if (inviterError) {
      console.error('Error fetching inviter:', inviterError)
      throw new Error('Inviter profile not found')
    }

    // Construct invitation URL using APP_URL secret, client origin, or fallback
    const appUrl = Deno.env.get('APP_URL') || appOrigin || 'https://vbnetwodxboajlsytolr.lovableproject.com'
    const acceptUrl = `${appUrl}/teams/invitations/accept?id=${invitationId}`
    const authFallbackUrl = `${appUrl}/auth?invitationId=${invitationId}`
    
    console.log('Invitation URLs generated:', { acceptUrl, authFallbackUrl, appUrl })

    // Generate HTML email
    const html = generateEmailHTML(
      team.name,
      inviter.display_name || inviter.username,
      role.charAt(0).toUpperCase() + role.slice(1),
      acceptUrl,
      authFallbackUrl,
      appUrl
    )

    // Send email via Resend HTTP API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Athletica Sports <noreply@athleticasports.app>',
        to: [recipientEmail],
        subject: `You've been invited to join ${team.name}`,
        html,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Error sending email:', resendData)
      throw resendData
    }

    console.log('Email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ success: true, messageId: resendData?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in send-team-invitation function:', error)
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to send invitation email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
