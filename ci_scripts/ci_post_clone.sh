#!/bin/sh

# Xcode Cloud Post-Clone Script
# This MUST run BEFORE Xcode opens the project
# Install Pods immediately so xcconfig files exist when Xcode reads project

set -e

echo "🔧 Xcode Cloud Post-Clone: Installing dependencies..."

# Find repository root
if [ -f "package.json" ]; then
  REPO_ROOT="$(pwd)"
elif [ -f "ios/App/Podfile" ]; then
  REPO_ROOT="$(pwd)"
else
  echo "❌ Cannot find repository root"
  exit 1
fi

cd "$REPO_ROOT"

# CRITICAL: Find and export node/npm location for build phases
# This ensures node is available in build phases
echo "🔍 Locating node and npm..."
NODE_PATH=""
if command -v node &> /dev/null; then
  NODE_PATH="$(dirname $(which node))"
  echo "✅ Found node at: $(which node)"
  echo "📦 Node directory: $NODE_PATH"
  # Export to a file that build phases can read
  echo "$NODE_PATH" > /tmp/xcode_cloud_node_path.txt
  echo "export PATH=\"$NODE_PATH:\$PATH\"" > /tmp/xcode_cloud_node_env.sh
  chmod +x /tmp/xcode_cloud_node_env.sh
elif command -v npm &> /dev/null; then
  NPM_DIR="$(dirname $(which npm))"
  if [ -f "$NPM_DIR/node" ]; then
    NODE_PATH="$NPM_DIR"
    echo "✅ Found node via npm at: $NPM_DIR/node"
    echo "$NODE_PATH" > /tmp/xcode_cloud_node_path.txt
    echo "export PATH=\"$NODE_PATH:\$PATH\"" > /tmp/xcode_cloud_node_env.sh
    chmod +x /tmp/xcode_cloud_node_env.sh
  fi
fi

# Install CocoaPods if needed
if ! command -v pod &> /dev/null; then
  echo "📦 Installing CocoaPods..."
  gem install cocoapods
fi

# Install npm dependencies (required for Capacitor Pods)
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm ci || npm install
fi

# Install Pods - CRITICAL: Must happen before Xcode reads project
if [ -f "ios/App/Podfile" ]; then
  echo "📦 Installing CocoaPods dependencies..."
  cd ios/App
  pod install --repo-update
  
  # Verify xcconfig files exist
  if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "❌ xcconfig file not created!"
    exit 1
  fi
  
  echo "✅ Pods installed successfully"
else
  echo "❌ Podfile not found"
  exit 1
fi

echo "✅ Post-clone script completed"
