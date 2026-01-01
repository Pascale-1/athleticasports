#!/bin/sh

# Xcode Cloud Post-Clone Script
# Runs after repository is cloned, before pre-build
# This runs EARLY, so we install Pods here to ensure they exist before Xcode reads project config

set -e

echo "🔧 Running post-clone script..."
echo "📁 Working directory: $(pwd)"

# Install CocoaPods if not available
if ! command -v pod &> /dev/null; then
  echo "📦 Installing CocoaPods gem..."
  gem install cocoapods
fi
echo "✅ CocoaPods available: $(which pod)"

# Install npm dependencies first (needed for Capacitor Pods)
echo "📦 Installing npm dependencies..."
if [ -f "package.json" ]; then
  npm ci || npm install
  echo "✅ npm dependencies installed"
else
  echo "⚠️  package.json not found, skipping npm install"
fi

# Install CocoaPods dependencies EARLY
# This ensures Pods exist before Xcode tries to read project configuration
echo "📦 Installing CocoaPods dependencies (early install)..."
if [ -f "ios/App/Podfile" ]; then
  cd ios/App
  echo "📁 Changed to: $(pwd)"
  echo "📁 Podfile location: $(pwd)/Podfile"
  
  echo "📦 Running pod install..."
  pod install --verbose || {
    echo "⚠️  pod install failed, will retry in pre-build script"
    cd ../..
  }
  
  # Verify Pods were installed
  if [ -d "Pods" ]; then
    echo "✅ Pods directory exists"
    if [ -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
      echo "✅ Pods-App.release.xcconfig exists"
    else
      echo "⚠️  Pods xcconfig files not found yet (will be created in pre-build)"
    fi
  else
    echo "⚠️  Pods directory not found (will be created in pre-build)"
  fi
  
  cd ../..
else
  echo "⚠️  Podfile not found at ios/App/Podfile"
fi

echo "✅ Post-clone script completed"
