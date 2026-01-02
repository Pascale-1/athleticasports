#!/bin/sh

# Xcode Cloud Pre-Build Script
# This script runs before Xcode builds your project
# It builds the web app, syncs Capacitor, and installs CocoaPods
# CRITICAL: This script has access to node/npm, build phases don't

set -e

echo "🔧 Running pre-build script for Xcode Cloud..."
echo "📁 Current directory: $(pwd)"
echo "📁 Script location: $0"
echo "📁 Repository structure:"
ls -la . 2>/dev/null | head -10 || echo "Cannot list directory"

# Find repository root
if [ -f "package.json" ]; then
  REPO_ROOT="$(pwd)"
elif [ -f "ios/App/Podfile" ]; then
  REPO_ROOT="$(pwd)"
else
  echo "❌ Cannot find repository root"
  exit 1
fi

cd "$REPO_ROOT"
echo "📁 Repository root: $(pwd)"

# Step 1: Install npm dependencies
echo "📦 Step 1: Installing npm dependencies..."
if [ -f "package.json" ]; then
  npm ci || {
    echo "⚠️  npm ci failed, trying npm install..."
    npm install
  }
  echo "✅ npm dependencies installed"
else
  echo "❌ package.json not found at $(pwd)/package.json!"
  exit 1
fi

# Step 2: Create .env file from Xcode Cloud environment variables
# Vite needs these at BUILD TIME, not runtime
echo "🔧 Creating .env file from Xcode Cloud environment variables..."
if [ -n "${VITE_SUPABASE_URL}" ] && [ -n "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]; then
  cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
EOF
  echo "✅ .env file created"
else
  echo "⚠️  WARNING: Environment variables not set in Xcode Cloud!"
  echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:+SET}"
  echo "   VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY:+SET}"
  echo "   Build may fail or app may not work correctly."
fi

# Step 3: Build the web app
echo "🏗️  Step 3: Building web app..."
npm run build || {
  echo "❌ Build failed!"
  exit 1
}
echo "✅ Web app built"

# Step 4: Sync Capacitor (copies dist to iOS)
echo "🔄 Step 4: Syncing Capacitor..."
npx cap sync ios || {
  echo "❌ Capacitor sync failed!"
  exit 1
}
echo "✅ Capacitor synced"

# Step 4: Verify/Reinstall CocoaPods dependencies (should already be installed in post-clone)
echo "📦 Step 4: Verifying CocoaPods dependencies..."
if [ -f "ios/App/Podfile" ]; then
  cd ios/App
  echo "📁 Changed to: $(pwd)"
  
  # Check if Pods already exist (installed in post-clone)
  if [ -d "Pods" ] && [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "✅ Pods already installed (from post-clone script)"
  else
    echo "⚠️  Pods not found, installing now..."
    # Ensure CocoaPods is available
    if ! command -v pod &> /dev/null; then
      echo "📦 Installing CocoaPods gem..."
      gem install cocoapods
    fi
    
    # Install Pods
    echo "📦 Running pod install..."
    pod install --verbose || {
      echo "❌ pod install failed!"
      echo "📁 Listing directory contents:"
      ls -la
      exit 1
    }
  fi
  
  cd ../..
  
  # Verify critical xcconfig files exist
  echo "🔍 Verifying Pods configuration files..."
  if [ -f "ios/App/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "✅ Pods-App.release.xcconfig exists"
  else
    echo "❌ Pods-App.release.xcconfig NOT found!"
    echo "📁 Listing Pods directory:"
    ls -la ios/App/Pods/Target\ Support\ Files/ 2>/dev/null || echo "Target Support Files directory not found"
    exit 1
  fi
  
  if [ -f "ios/App/Pods/Target Support Files/Pods-App/Pods-App.debug.xcconfig" ]; then
    echo "✅ Pods-App.debug.xcconfig exists"
  else
    echo "❌ Pods-App.debug.xcconfig NOT found!"
    exit 1
  fi
else
  echo "❌ Podfile not found at ios/App/Podfile!"
  exit 1
fi

echo "✅ Pre-build script completed successfully"

# Final verification: Check if workspace exists (required for CocoaPods)
echo "🔍 Final verification..."
if [ -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
  echo "✅ Workspace file exists - Xcode Cloud MUST build App.xcworkspace (not App.xcodeproj)"
else
  echo "⚠️  Warning: Workspace file not found!"
fi

echo ""
echo "⚠️  IMPORTANT: Xcode Cloud workflow must be configured to build:"
echo "   ✅ ios/App/App.xcworkspace (correct - includes Pods)"
echo "   ❌ ios/App/App.xcodeproj (wrong - will fail)"
echo ""

