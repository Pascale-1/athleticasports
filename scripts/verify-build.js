#!/usr/bin/env node

/**
 * Build Verification Script
 * Checks that the build is ready for production
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const checks = [];
let hasErrors = false;

function check(name, condition, errorMsg) {
  const passed = condition();
  checks.push({ name, passed, errorMsg });
  if (!passed) {
    console.error(`❌ ${name}: ${errorMsg}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${name}`);
  }
}

function verifyBuild() {
  console.log('🔍 Verifying Production Build Readiness...\n');

  // Check 1: Environment variables
  check(
    'Environment Variables',
    () => {
      const envPath = join(projectRoot, '.env');
      if (!existsSync(envPath)) return false;
      const envContent = readFileSync(envPath, 'utf-8');
      return envContent.includes('VITE_SUPABASE_URL=') && 
             envContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY=');
    },
    'Missing .env file or required variables. Run: npm run setup:env'
  );

  // Check 2: Build directory exists
  check(
    'Build Directory',
    () => {
      const distPath = join(projectRoot, 'dist');
      return existsSync(distPath) && statSync(distPath).isDirectory();
    },
    'Build directory not found. Run: npm run build'
  );

  // Check 3: Index.html exists in dist
  check(
    'Build Output',
    () => {
      const indexPath = join(projectRoot, 'dist', 'index.html');
      return existsSync(indexPath);
    },
    'Build output incomplete. Run: npm run build'
  );

  // Check 4: Privacy policy exists
  check(
    'Privacy Policy File',
    () => {
      const privacyPath = join(projectRoot, 'privacy.html');
      return existsSync(privacyPath);
    },
    'privacy.html not found. It should be in the project root.'
  );

  // Check 5: iOS icons
  check(
    'iOS App Icons',
    () => {
      const iconPath = join(projectRoot, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
      if (!existsSync(iconPath)) return false;
      const contentsPath = join(iconPath, 'Contents.json');
      return existsSync(contentsPath);
    },
    'iOS app icons not found. Check ios/App/App/Assets.xcassets/AppIcon.appiconset/'
  );

  // Check 6: Capacitor config
  check(
    'Capacitor Configuration',
    () => {
      const configPath = join(projectRoot, 'capacitor.config.ts');
      return existsSync(configPath);
    },
    'capacitor.config.ts not found'
  );

  // Check 7: Info.plist has privacy policy URL
  check(
    'Privacy Policy URL in Info.plist',
    () => {
      const plistPath = join(projectRoot, 'ios', 'App', 'App', 'Info.plist');
      if (!existsSync(plistPath)) return false;
      const plistContent = readFileSync(plistPath, 'utf-8');
      return plistContent.includes('NSPrivacyPolicyURL');
    },
    'Privacy policy URL not configured in Info.plist'
  );

  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Build verification failed!');
    console.log('\nPlease fix the issues above before proceeding.');
    process.exit(1);
  } else {
    console.log('✅ All checks passed! Build is ready for production.');
    console.log('\nNext steps:');
    console.log('1. Test on physical device: npm run test:device');
    console.log('2. Sync Capacitor: npx cap sync ios');
    console.log('3. Open in Xcode: npx cap open ios');
    console.log('4. Archive and upload to App Store Connect');
  }
}

verifyBuild();

