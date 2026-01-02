#!/bin/bash
set -e

REPO_ROOT="/Volumes/workspace/repository"
IOS_DIR="$REPO_ROOT/ios/App"
echo "NODE CI BUILD - COMPLETE"

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
mkdir -p "$IOS_DIR/App/public"
cp -r dist/* "$IOS_DIR/App/public/"

# Run cap sync to generate config.xml and capacitor.config.json
# This ensures Xcode Copy Bundle Resources phase finds all required files
"$NODE_BIN" "$REPO_ROOT/node_modules/.bin/cap" sync ios || {
    echo "Cap sync failed, trying cap ios prepare..."
    "$NODE_BIN" "$REPO_ROOT/node_modules/.bin/cap" ios prepare || {
        echo "Warning: cap sync/prepare failed, but continuing..."
    }
}

# Verify required files exist
if [[ ! -f "$IOS_DIR/App/config.xml" ]]; then
    echo "ERROR: config.xml not found after cap sync"
    exit 1
fi

if [[ ! -f "$IOS_DIR/App/capacitor.config.json" ]]; then
    echo "ERROR: capacitor.config.json not found after cap sync"
    exit 1
fi

# Pods only
cd "$IOS_DIR"
pod install --repo-update

echo "SUCCESS - All files ready for Xcode Copy Bundle Resources"

