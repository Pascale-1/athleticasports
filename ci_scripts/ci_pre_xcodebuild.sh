#!/bin/sh

# Xcode Cloud Pre-Build Script
# This script runs before Xcode builds your project

set -e

echo "🔧 Running pre-build script..."

# Install CocoaPods dependencies
if [ -f "ios/App/Podfile" ]; then
  echo "📦 Installing CocoaPods dependencies..."
  cd ios/App
  pod install
  cd ../..
  echo "✅ CocoaPods installed"
else
  echo "⚠️  No Podfile found, skipping pod install"
fi

echo "✅ Pre-build script completed"

