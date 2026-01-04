#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY'
];

function checkEnvFile() {
  const envPath = join(projectRoot, '.env');
  const envExamplePath = join(projectRoot, '.env.example');
  
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('\n📝 To fix this:');
    console.log('1. Copy .env.example to .env:');
    console.log('   cp .env.example .env');
    console.log('2. Edit .env and add your Supabase credentials');
    console.log('3. Get credentials from: https://supabase.com/dashboard');
    return false;
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const missing = [];
  const empty = [];

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (!match) {
      missing.push(varName);
    } else if (!match[1] || match[1].trim() === '') {
      empty.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    return false;
  }

  if (empty.length > 0) {
    console.error(`❌ Empty environment variables: ${empty.join(', ')}`);
    console.log('\n💡 Make sure to set actual values, not placeholders');
    return false;
  }

  // Validate URL format
  const urlMatch = envContent.match(/^VITE_SUPABASE_URL=(.+)$/m);
  if (urlMatch && !urlMatch[1].startsWith('http')) {
    console.warn('⚠️  VITE_SUPABASE_URL should start with http:// or https://');
  }

  console.log('✅ All required environment variables are set!');
  return true;
}

// Run check
const isValid = checkEnvFile();
process.exit(isValid ? 0 : 1);

