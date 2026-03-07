import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Base64URL utilities ──────────────────────────────────────────────
function b64urlDecode(s: string): Uint8Array {
  const p = "=".repeat((4 - (s.length % 4)) % 4);
  const b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── HKDF-Expand (single block, L ≤ 32) ──────────────────────────────
async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const input = new Uint8Array(info.length + 1);
  input.set(info);
  input[info.length] = 0x01;
  const result = new Uint8Array(await crypto.subtle.sign("HMAC", key, input));
  return result.slice(0, length);
}

// ── HKDF-Extract ─────────────────────────────────────────────────────
async function hkdfExtract(
  salt: Uint8Array,
  ikm: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

// ── Generate VAPID key pair ──────────────────────────────────────────
async function generateVapidKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const pubJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const x = b64urlDecode(pubJwk.x!);
  const y = b64urlDecode(pubJwk.y!);
  const raw = new Uint8Array(65);
  raw[0] = 0x04;
  raw.set(x, 1);
  raw.set(y, 33);

  return {
    publicKey: b64urlEncode(raw),
    privateKeyJwk: JSON.stringify(privJwk),
  };
}

// ── Create VAPID Authorization header ────────────────────────────────
async function createVapidAuth(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKeyJwk: JsonWebKey
) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: "mailto:contact@athleticasports.app",
  };

  const hB64 = b64urlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const pB64 = b64urlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const unsignedToken = `${hB64}.${pB64}`;

  const key = await crypto.subtle.importKey(
    "jwk",
    { ...vapidPrivateKeyJwk, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const jwt = `${unsignedToken}.${b64urlEncode(sig)}`;
  return `vapid t=${jwt}, k=${vapidPublicKey}`;
}

// ── Encrypt payload (RFC 8291 aes128gcm) ─────────────────────────────
async function encryptPayload(
  payloadStr: string,
  p256dh: string,
  authSecret: string
): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payloadStr);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Server ECDH key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const serverPubRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeys.publicKey)
  );

  // Import subscriber public key
  const subPubBytes = b64urlDecode(p256dh);
  const subPubKey = await crypto.subtle.importKey(
    "raw",
    subPubBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: subPubKey },
      serverKeys.privateKey,
      256
    )
  );

  const authBytes = b64urlDecode(authSecret);

  // Step 1: PRK_key = HKDF-Extract(salt=auth_secret, IKM=ecdh_secret)
  const prkKey = await hkdfExtract(authBytes, sharedSecret);

  // key_info = "WebPush: info\0" || ua_public || as_public
  const infoPrefix = new TextEncoder().encode("WebPush: info\0");
  const keyInfo = new Uint8Array(
    infoPrefix.length + subPubBytes.length + serverPubRaw.length
  );
  keyInfo.set(infoPrefix);
  keyInfo.set(subPubBytes, infoPrefix.length);
  keyInfo.set(serverPubRaw, infoPrefix.length + subPubBytes.length);

  // IKM = HKDF-Expand(PRK_key, key_info, 32)
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  // Step 2: PRK = HKDF-Extract(salt=random_salt, IKM=ikm)
  const prk = await hkdfExtract(salt, ikm);

  // CEK = HKDF-Expand(PRK, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const cek = await hkdfExpand(prk, cekInfo, 16);

  // Nonce = HKDF-Expand(PRK, "Content-Encoding: nonce\0", 12)
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const nonce = await hkdfExpand(prk, nonceInfo, 12);

  // Pad payload + delimiter 0x02 (final record)
  const padded = new Uint8Array(payloadBytes.length + 1);
  padded.set(payloadBytes);
  padded[payloadBytes.length] = 0x02;

  // AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded)
  );

  // Build aes128gcm body: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const rs = 4096;
  const headerLen = 16 + 4 + 1 + serverPubRaw.length;
  const body = new Uint8Array(headerLen + encrypted.length);
  body.set(salt, 0);
  body[16] = (rs >> 24) & 0xff;
  body[17] = (rs >> 16) & 0xff;
  body[18] = (rs >> 8) & 0xff;
  body[19] = rs & 0xff;
  body[20] = serverPubRaw.length;
  body.set(serverPubRaw, 21);
  body.set(encrypted, headerLen);

  return body;
}

// ── Send Web Push to a single subscription ───────────────────────────
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKeyJwk: JsonWebKey
): Promise<{ success: boolean; status: number }> {
  const body = await encryptPayload(
    payload,
    subscription.p256dh,
    subscription.auth
  );

  const authorization = await createVapidAuth(
    subscription.endpoint,
    vapidPublicKey,
    vapidPrivateKeyJwk
  );

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "normal",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      `Push failed: ${response.status} ${response.statusText} - ${text}`
    );
  }

  return { success: response.ok, status: response.status };
}

// ── Main handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Action: generate VAPID keys (one-time setup)
    if (body.action === "generate-keys") {
      const keys = await generateVapidKeys();
      return new Response(JSON.stringify(keys), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normal flow: send push notification
    const { user_id, title, message, link, type } = body;

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or title" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKeyStr = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKeyStr) {
      console.warn("VAPID keys not configured, skipping push");
      return new Response(JSON.stringify({ sent: 0, reason: "no_vapid_keys" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPrivateKeyJwk = JSON.parse(vapidPrivateKeyStr) as JsonWebKey;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch push subscriptions for user
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (error || !subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: link || "/",
      type: type || "general",
    });

    // Send push to each subscription
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKeyJwk
        )
      )
    );

    // Clean up expired/unsubscribed subscriptions (410 Gone)
    const goneIds = results
      .map((r, i) => {
        if (r.status === "fulfilled" && r.value.status === 410) {
          return subscriptions[i].id;
        }
        if (r.status === "rejected") {
          return subscriptions[i].id;
        }
        return null;
      })
      .filter(Boolean);

    if (goneIds.length) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", goneIds);
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
