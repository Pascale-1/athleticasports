import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, message, userEmail, pageUrl } = await req.json();

    if (!category || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const categoryEmoji: Record<string, string> = {
      bug: "🐛 Bug Report",
      suggestion: "💡 Suggestion",
      question: "❓ Question",
      praise: "⭐ Praise",
    };

    const categoryLabel = categoryEmoji[category] || category;
    const timestamp = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    const { error: emailError } = await resend.emails.send({
      from: "Athletica Feedback <noreply@athleticasports.app>",
      to: ["athletica.sports.app@gmail.com"],
      subject: `[Feedback] ${categoryLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9361E0;">${categoryLabel}</h2>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <table style="width: 100%; font-size: 14px; color: #666;">
            <tr><td style="padding: 4px 0;"><strong>From:</strong></td><td>${userEmail || "Unknown"}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Page:</strong></td><td>${pageUrl || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Date:</strong></td><td>${timestamp}</td></tr>
          </table>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
