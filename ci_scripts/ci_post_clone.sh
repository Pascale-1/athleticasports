#!/bin/bash
set -euo pipefail
export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/../"  # repo root
echo "Post-clone: Installing Node/npm/Cocoapods"
brew install node cocoapods || true
rm -rf node_modules
npm ci --legacy-peer-deps || npm install --legacy-peer-deps
cd ios/App
rm -rf Pods Podfile.lock
pod repo update
pod install --repo-update
echo "Post-clone complete"
