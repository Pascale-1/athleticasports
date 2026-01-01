#!/bin/sh

# Xcode Cloud Pre-Build Script
# This script runs before Xcode builds your project
# It builds the web app, syncs Capacitor, and installs CocoaPods

set -e

echo "🔧 Running pre-build script for Xcode Cloud..."

# Step 1: Install npm dependencies
echo "📦 Installing npm dependencies..."
npm ci

# Step 2: Build the web app
echo "🏗️  Building web app..."
npm run build

# Step 3: Sync Capacitor (copies dist to iOS)
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# Step 4: Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
cd ios/App
pod install
cd ../..

echo "✅ Pre-build script completed successfully"

