#!/bin/bash
set -euo pipefail

# Fixed paths for Xcode Cloud Archive (Release)
WORKSPACE_DIR="/Volumes/workspace/repository"
REPO_ROOT="$WORKSPACE_DIR"
IOS_DIR="$REPO_ROOT/ios/App"

echo "=== FINAL CI FIX: $REPO_ROOT -> $IOS_DIR ==="

export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH:/Users/local/bin"

# Tools (quiet)
brew install node yarn cocoapods >/dev/null 2>&1 || true

cd "$REPO_ROOT"
rm -rf node_modules yarn.lock package-lock.json

# NPM install first (avoids yarn/npx conflict)
npm clean-install --no-audit --no-fund --network-timeout 600000
npm install @capacitor/ios @capacitor/core @capacitor/cli --save-dev --no-audit

# Manual Capacitor sync (no npx)
node_modules/.bin/cap sync ios

# Pods
cd "$IOS_DIR"
rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData
pod deintegrate >/dev/null 2>&1 || true
pod repo update >/dev/null 2>&1
pod install --repo-update --clean-install --no-integrate-services

# Clean everything
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf /tmp/org.swift.swiftmodulecache
rm -rf $(getconf DARWIN_USER_CACHE_DIR)/org.swift.*

echo "=== BUILD READY ==="

