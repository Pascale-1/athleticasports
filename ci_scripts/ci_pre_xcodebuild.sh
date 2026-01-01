#!/bin/sh

# Xcode Cloud Pre-Build Script
# This script runs before Xcode builds your project
# It builds the web app, syncs Capacitor, and installs CocoaPods

set -e

echo "🔧 Running pre-build script for Xcode Cloud..."
echo "📁 Current directory: $(pwd)"

# Step 1: Install npm dependencies
echo "📦 Step 1: Installing npm dependencies..."
if [ -f "package.json" ]; then
  npm ci
  echo "✅ npm dependencies installed"
else
  echo "❌ package.json not found!"
  exit 1
fi

# Step 2: Build the web app
echo "🏗️  Step 2: Building web app..."
npm run build
echo "✅ Web app built"

# Step 3: Sync Capacitor (copies dist to iOS)
echo "🔄 Step 3: Syncing Capacitor..."
npx cap sync ios
echo "✅ Capacitor synced"

# Step 4: Install CocoaPods dependencies
echo "📦 Step 4: Installing CocoaPods dependencies..."
if [ -f "ios/App/Podfile" ]; then
  cd ios/App
  echo "📁 Changed to: $(pwd)"
  echo "🔍 Checking for CocoaPods..."
  which pod || gem install cocoapods
  pod install --repo-update
  cd ../..
  echo "✅ CocoaPods installed"
  
  # Verify Pods were installed
  if [ -d "ios/App/Pods" ]; then
    echo "✅ Pods directory exists"
  else
    echo "❌ Pods directory not found after installation!"
    exit 1
  fi
else
  echo "❌ Podfile not found at ios/App/Podfile!"
  exit 1
fi

echo "✅ Pre-build script completed successfully"

