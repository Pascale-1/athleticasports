import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  language: "fr" | "en";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to get their info
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { language = "fr" }: RequestBody = await req.json();

    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing pending request
    const { data: existingRequest } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .is("confirmed_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          error: language === "fr" 
            ? "Une demande de suppression est déjà en cours. Vérifiez votre email." 
            : "A deletion request is already pending. Check your email."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new deletion request
    const { data: deletionRequest, error: insertError } = await supabaseAdmin
      .from("account_deletion_requests")
      .insert({
        user_id: user.id,
        email: user.email,
        language,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create deletion request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build confirmation URL
    const baseUrl = req.headers.get("origin") || "https://athletica.app";
    const confirmUrl = `${baseUrl}/account/confirm-deletion/${deletionRequest.confirmation_token}`;

    // Send confirmation email using Resend API
    const emailContent = language === "fr" ? {
      subject: "Confirmez la suppression de votre compte Athletica Sports",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #FF3B30; font-size: 24px; margin-bottom: 20px;">⚠️ Confirmation de suppression de compte</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Vous avez demandé la suppression définitive de votre compte Athletica Sports.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; background: #FFF3F3; padding: 15px; border-radius: 8px; border-left: 4px solid #FF3B30;">
            <strong>Attention :</strong> Cette action est irréversible. Toutes vos données seront supprimées définitivement.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background: #FF3B30; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Confirmer la suppression
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px;">
            Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette suppression, ignorez cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Athletica Sports - La communauté sportive féminine
          </p>
        </div>
      `,
    } : {
      subject: "Confirm deletion of your Athletica Sports account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #FF3B30; font-size: 24px; margin-bottom: 20px;">⚠️ Account Deletion Confirmation</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            You have requested the permanent deletion of your Athletica Sports account.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; background: #FFF3F3; padding: 15px; border-radius: 8px; border-left: 4px solid #FF3B30;">
            <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background: #FF3B30; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Confirm Deletion
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px;">
            This link expires in 24 hours. If you did not request this deletion, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Athletica Sports - The women's sports community
          </p>
        </div>
      `,
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Athletica Sports <noreply@resend.dev>",
        to: [user.email],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email error:", errorText);
      throw new Error("Failed to send confirmation email");
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: language === "fr" 
          ? "Email de confirmation envoyé" 
          : "Confirmation email sent"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in request-account-deletion:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
