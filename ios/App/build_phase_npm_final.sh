#!/bin/bash
set -euo pipefail

# Fixed paths for Xcode Cloud Archive (Release)
REPO_ROOT="/Volumes/workspace/repository"
IOS_DIR="$REPO_ROOT/ios/App"

echo "=== FINAL CI FIX: $REPO_ROOT -> $IOS_DIR ==="

export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH:/Users/local/bin"

# Tools (quiet)
brew install node yarn cocoapods >/dev/null 2>&1 || true

cd "$REPO_ROOT"
rm -rf node_modules yarn.lock package-lock.json

# NPM install (generates lock file, avoids yarn/npx conflict)
npm install --network-timeout=600000 --no-audit --no-fund
npm install @capacitor/ios @capacitor/core @capacitor/cli --save-dev --no-audit

# Manual Capacitor sync (no npx)
if [ -f "./node_modules/.bin/cap" ]; then
    ./node_modules/.bin/cap sync ios || ./node_modules/.bin/cap ios prepare
else
    echo "error: Capacitor CLI not found" >&2
    exit 1
fi

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

