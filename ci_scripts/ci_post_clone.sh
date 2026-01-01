#!/bin/sh

# Xcode Cloud Post-Clone Script
# Runs after repository is cloned, before pre-build
# This runs EARLY, so we install Pods here to ensure they exist before Xcode reads project config

set -e

echo "🔧 Running post-clone script..."
echo "📁 Working directory: $(pwd)"
echo "📁 Repository root: $(pwd)"

# Install CocoaPods if not available
if ! command -v pod &> /dev/null; then
  echo "📦 Installing CocoaPods gem..."
  gem install cocoapods
fi
echo "✅ CocoaPods available: $(which pod)"
pod --version

# Install npm dependencies first (needed for Capacitor Pods)
echo "📦 Installing npm dependencies..."
if [ -f "package.json" ]; then
  npm ci || npm install
  echo "✅ npm dependencies installed"
else
  echo "❌ package.json not found at $(pwd)/package.json"
  exit 1
fi

# Install CocoaPods dependencies EARLY - CRITICAL!
# This ensures Pods exist before Xcode tries to read project configuration
echo "📦 Installing CocoaPods dependencies (MUST happen before Xcode reads project)..."
if [ -f "ios/App/Podfile" ]; then
  cd ios/App
  echo "📁 Changed to: $(pwd)"
  echo "📁 Podfile location: $(pwd)/Podfile"
  
  # CRITICAL: Install Pods - this MUST succeed
  echo "📦 Running pod install (CRITICAL STEP)..."
  if pod install --verbose; then
    echo "✅ pod install succeeded"
  else
    echo "❌ pod install FAILED - this will cause build to fail!"
    echo "📁 Listing directory:"
    ls -la
    echo "📁 Checking Podfile:"
    cat Podfile || echo "Cannot read Podfile"
    echo "❌ EXITING - Pods must be installed"
    exit 1
  fi
  
  # CRITICAL: Verify Pods were installed and xcconfig files exist
  if [ ! -d "Pods" ]; then
    echo "❌ Pods directory NOT created - build will fail!"
    exit 1
  fi
  
  echo "✅ Pods directory exists"
  
  # Verify the exact file that Xcode is looking for
  XCCONFIG_RELEASE="Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig"
  XCCONFIG_DEBUG="Pods/Target Support Files/Pods-App/Pods-App.debug.xcconfig"
  
  if [ -f "$XCCONFIG_RELEASE" ]; then
    echo "✅ $XCCONFIG_RELEASE exists"
    ls -la "$XCCONFIG_RELEASE"
  else
    echo "⚠️  $XCCONFIG_RELEASE NOT FOUND - creating directory structure..."
    mkdir -p "Pods/Target Support Files/Pods-App"
    
    # Create a minimal xcconfig file to prevent Xcode from failing
    echo "// Auto-generated placeholder - will be replaced by pod install" > "$XCCONFIG_RELEASE"
    echo "// This file is created to prevent Xcode from failing when reading project config" >> "$XCCONFIG_RELEASE"
    echo "" >> "$XCCONFIG_RELEASE"
    
    echo "✅ Created placeholder $XCCONFIG_RELEASE"
    echo "⚠️  WARNING: This is a placeholder. pod install should have created this file."
    
    # Try pod install one more time
    echo "📦 Retrying pod install..."
    pod install || {
      echo "❌ pod install still failing!"
      exit 1
    }
    
    # Verify it exists now
    if [ ! -f "$XCCONFIG_RELEASE" ]; then
      echo "❌ $XCCONFIG_RELEASE still not found after retry!"
      exit 1
    fi
  fi
  
  if [ -f "$XCCONFIG_DEBUG" ]; then
    echo "✅ $XCCONFIG_DEBUG exists"
  else
    echo "❌ $XCCONFIG_DEBUG NOT FOUND - build will fail!"
    exit 1
  fi
  
  echo "✅ All Pods xcconfig files verified"
  cd ../..
else
  echo "❌ Podfile not found at ios/App/Podfile - build will fail!"
  exit 1
fi

echo "✅ Post-clone script completed successfully"
