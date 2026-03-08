const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const APP_BUNDLE_ID = 'com.athletica.sports';

async function getIOSVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${APP_BUNDLE_ID}&country=fr`
    );
    const data = await res.json();
    if (data.resultCount > 0) {
      return data.results[0].version;
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch iOS version:', e);
    return null;
  }
}

async function getAndroidVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://play.google.com/store/apps/details?id=${APP_BUNDLE_ID}&hl=en`
    );
    const html = await res.text();
    // Google Play embeds the version in a specific pattern
    const match = html.match(/\[\[\["(\d+\.\d+\.?\d*)"\]\]/);
    if (match) {
      return match[1];
    }
    // Fallback pattern
    const altMatch = html.match(/Current Version.*?>([\d.]+)</);
    if (altMatch) {
      return altMatch[1];
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch Android version:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const [ios, android] = await Promise.all([
      getIOSVersion(),
      getAndroidVersion(),
    ]);

    return new Response(
      JSON.stringify({ ios, android }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('check-app-version error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check versions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
