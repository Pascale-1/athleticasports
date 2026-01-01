#!/bin/sh

# Xcode Cloud Pre-Build Script
# This script runs before Xcode builds your project
# It builds the web app, syncs Capacitor, and installs CocoaPods

# Don't exit on error immediately - we want to see what's happening
set -e

echo "🔧 Running pre-build script for Xcode Cloud..."
echo "📁 Current directory: $(pwd)"

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
  echo "📁 Listing current directory:"
  ls -la
  exit 1
fi

# Step 2: Build the web app
echo "🏗️  Step 2: Building web app..."
npm run build || {
  echo "❌ Build failed!"
  exit 1
}
echo "✅ Web app built"

# Step 3: Sync Capacitor (copies dist to iOS)
echo "🔄 Step 3: Syncing Capacitor..."
npx cap sync ios || {
  echo "❌ Capacitor sync failed!"
  exit 1
}
echo "✅ Capacitor synced"

# Step 4: Install CocoaPods dependencies
echo "📦 Step 4: Installing CocoaPods dependencies..."
if [ -f "ios/App/Podfile" ]; then
  cd ios/App
  echo "📁 Changed to: $(pwd)"
  
  # Ensure CocoaPods is available
  echo "🔍 Checking for CocoaPods..."
  if ! command -v pod &> /dev/null; then
    echo "📦 Installing CocoaPods gem..."
    gem install cocoapods
  fi
  echo "✅ CocoaPods found: $(which pod)"
  
  # Install Pods
  echo "📦 Running pod install..."
  echo "📁 Current directory before pod install: $(pwd)"
  echo "📁 Podfile location: $(pwd)/Podfile"
  
  # Try pod install with verbose output
  pod install --repo-update --verbose || {
    echo "⚠️  pod install with --repo-update failed, trying without..."
    pod install --verbose || {
      echo "❌ pod install failed!"
      echo "📁 Listing directory contents:"
      ls -la
      echo "📁 Checking Podfile:"
      cat Podfile || echo "Cannot read Podfile"
      exit 1
    }
  }
  
  cd ../..
  echo "✅ CocoaPods installed"
  
  # Verify Pods were installed
  if [ -d "ios/App/Pods" ]; then
    echo "✅ Pods directory exists"
  else
    echo "❌ Pods directory not found after installation!"
    exit 1
  fi
  
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

