import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Base64URL encode ─────────────────────────────────────────────────
function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── Import RSA private key from PEM ──────────────────────────────────
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// ── Create signed JWT for Google OAuth2 ──────────────────────────────
async function createSignedJwt(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();

  const headerB64 = b64urlEncode(
    encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  );
  const payloadB64 = b64urlEncode(
    encoder.encode(
      JSON.stringify({
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    )
  );

  const unsignedToken = `${headerB64}.${payloadB64}`;
  const key = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(unsignedToken)
  );

  return `${unsignedToken}.${b64urlEncode(signature)}`;
}

// ── Get OAuth2 access token from Google ──────────────────────────────
async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwt = await createSignedJwt(serviceAccount);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth2 token error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ── Send FCM v1 notification ─────────────────────────────────────────
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
  accessToken: string,
  projectId: string
): Promise<{ success: boolean; status: number }> {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data,
          android: {
            priority: "high",
            notification: { sound: "default", channel_id: "default" },
          },
          apns: {
            payload: {
              aps: { sound: "default", badge: 1, "content-available": 1 },
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`FCM failed: ${response.status} - ${text}`);
  }

  return { success: response.ok, status: response.status };
}

// ── Main handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, link, type } = await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or title" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const fcmServiceAccountStr = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!fcmServiceAccountStr) {
      console.warn("FCM_SERVICE_ACCOUNT not configured, skipping push");
      return new Response(
        JSON.stringify({ sent: 0, reason: "no_fcm_config" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceAccount = JSON.parse(fcmServiceAccountStr);
    const projectId = serviceAccount.project_id;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch device tokens for user
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (error || !subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get FCM access token
    const accessToken = await getAccessToken(serviceAccount);

    const data: Record<string, string> = {
      url: link || "/",
      type: type || "general",
    };

    // Send to each device
    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        sendFCMNotification(
          sub.device_token,
          title,
          message || "",
          data,
          accessToken,
          projectId
        )
      )
    );

    // Clean up unregistered tokens (404 or 410)
    const invalidIds = results
      .map((r, i) => {
        if (
          r.status === "fulfilled" &&
          (r.value.status === 404 || r.value.status === 410)
        ) {
          return subscriptions[i].id;
        }
        return null;
      })
      .filter(Boolean);

    if (invalidIds.length) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", invalidIds);
    }

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
