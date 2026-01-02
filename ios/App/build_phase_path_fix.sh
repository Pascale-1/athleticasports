#!/bin/bash
set -e

REPO_ROOT="/Volumes/workspace/repository"
echo "NODE CI BUILD"

# FORCE Node PATH first
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
NODE_BIN=$(which node || echo "/usr/local/bin/node")
NPM_BIN=$(which npm || echo "/usr/local/bin/npm")

if [[ ! -x "$NODE_BIN" ]] || [[ ! -x "$NPM_BIN" ]]; then
    echo "Installing Node via Homebrew..."
    export HOMEBREW_NO_INSTALL_CLEANUP=1
    brew install node >/dev/null 2>&1 || true
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
    NODE_BIN=$(which node || echo "/opt/homebrew/bin/node")
    NPM_BIN=$(which npm || echo "/opt/homebrew/bin/npm")
fi

echo "Using Node: $NODE_BIN"
echo "Using NPM: $NPM_BIN"

cd "$REPO_ROOT"

# Install dependencies
"$NPM_BIN" ci --legacy-peer-deps || "$NPM_BIN" install --legacy-peer-deps

# BUILD WEB (VITE)
"$NPM_BIN" run build || { echo "Build failed - check package.json scripts.build"; exit 1; }

# Check dist
ls -la dist/index.html || { echo "NO dist/index.html"; exit 1; }

# Capacitor COPY webDir to native
mkdir -p ios/App/public
cp -r dist/* ios/App/public/

# Pods only (skip cap sync - manual copy works)
cd ios/App
pod install --repo-update

echo "SUCCESS"

