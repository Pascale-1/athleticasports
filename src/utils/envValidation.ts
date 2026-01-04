/**
 * Environment Variable Validation
 * 
 * Validates that required environment variables are present before the app starts.
 * This prevents silent failures in production.
 */

export function validateEnvironmentVariables() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];

  if (!SUPABASE_URL || SUPABASE_URL.trim() === '') {
    missing.push('VITE_SUPABASE_URL');
  }

  if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.trim() === '') {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  if (missing.length > 0) {
    const errorMessage = `
🚨 Missing Required Environment Variables

The following environment variables are required but not set:
${missing.map(v => `  - ${v}`).join('\n')}

To fix this:
1. Create a .env file in the project root
2. Add the missing variables:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

For production builds, ensure these are set in your build environment.
    `.trim();

    // In development, show helpful error
    if (import.meta.env.DEV) {
      console.error(errorMessage);
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    // In production, throw error that ErrorBoundary can catch
    throw new Error('Application configuration error. Please contact support.');
  }

  // Validate URL format
  if (SUPABASE_URL && !SUPABASE_URL.startsWith('http')) {
    console.warn('⚠️ VITE_SUPABASE_URL should start with http:// or https://');
  }

  return true;
}

