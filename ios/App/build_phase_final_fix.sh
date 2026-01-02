#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
IOS_DIR="$REPO_ROOT/ios/App"
echo "CI Build: $REPO_ROOT -> $IOS_DIR"
export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$REPO_ROOT"
brew install node yarn cocoapods || true
rm -rf node_modules yarn.lock
yarn install --frozen-lockfile --network-timeout 600000
npx cap sync ios --verbose
cd "$IOS_DIR"
rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData
pod deintegrate
pod repo update
pod install --repo-update --clean-install
# Clean Swift caches
rm -rf ~/Library/Caches/org.swift.swiftpm /tmp/org.swift.swiftmodulecache
rm -rf $(getconf DARWIN_USER_CACHE_DIR)/org.swift.*
echo "Dependencies + Capacitor sync COMPLETE"

