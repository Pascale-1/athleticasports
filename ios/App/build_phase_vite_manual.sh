#!/bin/bash
set -e

REPO_ROOT="/Volumes/workspace/repository"
IOS_DIR="$REPO_ROOT/ios/App"

echo "VITE + CAPACITOR FULL BUILD"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$REPO_ROOT"

# Install
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# BUILD WEB (VITE)
npm run build || echo "Build failed - check package.json scripts.build"

# Check dist
ls -la dist/index.html || { echo "NO dist/index.html"; exit 1; }

# Capacitor COPY webDir to native
cp -r dist/* ios/App/public/

# Pods only (skip cap sync - manual copy works)
cd "$IOS_DIR"
pod install --repo-update

echo "SUCCESS"

