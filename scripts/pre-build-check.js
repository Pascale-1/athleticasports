#!/usr/bin/env node

/**
 * Pre-Build Check Script
 * Runs before build to ensure everything is configured correctly
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function checkEnvVars() {
  // In CI environments, skip validation entirely - just warn
  const isCI = process.env.CI === 'true' || process.env.XCODE_CLOUD === '1' || process.env.CI === '1';
  
  if (isCI) {
    console.log('🔧 CI environment detected - skipping .env validation');
    console.log('⚠️  NOTE: App will need VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at runtime');
    console.log('   Set these as environment variables in Xcode Cloud if needed.\n');
    return; // Skip all validation in CI
  }

  // Local development: check .env file
  const envPath = join(projectRoot, '.env');
  
  if (!existsSync(envPath)) {
    console.error('\n❌ ERROR: .env file not found!');
    console.error('   Run: npm run setup:env');
    console.error('   Or create .env manually with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY\n');
    process.exit(1);
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
  const missing = [];

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    if (!match || !match[1] || match[1].trim() === '' || match[1].includes('your_')) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error(`\n❌ ERROR: Missing or invalid environment variables: ${missing.join(', ')}`);
    console.error('   Please set valid values in .env file\n');
    process.exit(1);
  }

  console.log('✅ Environment variables configured');
}

// Run check
checkEnvVars();
console.log('✅ Pre-build checks passed. Starting build...\n');

