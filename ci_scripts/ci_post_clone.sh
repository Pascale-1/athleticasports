#!/bin/bash
set -euo pipefail
export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/../"  # repo root
echo "Post-clone: Installing Node/Yarn/Cocoapods"
brew install node yarn cocoapods || true
rm -rf node_modules .yarn/cache
yarn install --frozen-lockfile --network-timeout 300000
cd ios/App
rm -rf Pods Podfile.lock
pod repo update
pod install --repo-update
echo "Post-clone complete"
