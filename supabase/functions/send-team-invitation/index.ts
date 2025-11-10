import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { Resend } from 'npm:resend@4.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  invitationId: string
  teamId: string
  recipientEmail: string
  role: string
}

function generateEmailHTML(teamName: string, inviterName: string, role: string, acceptUrl: string, appUrl: string): string {
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
    const { invitationId, teamId, recipientEmail, role }: InvitationRequest = await req.json()

    console.log('Sending invitation email:', { invitationId, teamId, recipientEmail, role })

    // Create Supabase client with service role
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

    const appUrl = 'https://athleticasports.app'
    const acceptUrl = `${appUrl}/teams/invitations/accept?id=${invitationId}`

    // Generate HTML email
    const html = generateEmailHTML(
      team.name,
      inviter.display_name || inviter.username,
      role.charAt(0).toUpperCase() + role.slice(1),
      acceptUrl,
      appUrl
    )

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Athletica Sports <noreply@athleticasports.app>',
      to: [recipientEmail],
      subject: `You've been invited to join ${team.name}`,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-team-invitation function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send invitation email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
