#!/bin/sh

# Xcode Cloud Post-Clone Script
# This MUST run BEFORE Xcode opens the project
# Install Node, dependencies, and Pods immediately

set -e

echo "🔧 Xcode Cloud Post-Clone: Installing dependencies..."
echo "📁 Current working directory: $(pwd)"
echo "📁 CI_PRIMARY_REPOSITORY_PATH: ${CI_PRIMARY_REPOSITORY_PATH:-$(pwd)}"

# Navigate to repository root
if [ -n "${CI_PRIMARY_REPOSITORY_PATH}" ]; then
  cd "${CI_PRIMARY_REPOSITORY_PATH}"
elif [ -f "package.json" ]; then
  REPO_ROOT="$(pwd)"
elif [ -f "ios/App/Podfile" ]; then
  REPO_ROOT="$(pwd)"
  cd "$REPO_ROOT"
else
  echo "❌ Cannot find repository root"
  exit 1
fi

REPO_ROOT="$(pwd)"
echo "📁 Repository root: $REPO_ROOT"

# Install Homebrew dependencies
export HOMEBREW_NO_INSTALL_CLEANUP=1

echo "📦 Installing Node.js via Homebrew..."
if ! command -v node &> /dev/null; then
  brew install node || {
    echo "⚠️  brew install node failed, trying alternative..."
    # Try to use existing node if available
    if ! command -v node &> /dev/null; then
      echo "❌ Cannot install or find node"
      exit 1
    fi
  }
fi

echo "📦 Installing Yarn via Homebrew..."
if ! command -v yarn &> /dev/null; then
  brew install yarn || {
    echo "⚠️  brew install yarn failed, trying npm alternative..."
    if command -v npm &> /dev/null; then
      npm install -g yarn || echo "⚠️  Could not install yarn, continuing..."
    fi
  }
fi

echo "📦 Installing CocoaPods via Homebrew..."
if ! command -v pod &> /dev/null; then
  brew install cocoapods || {
    echo "⚠️  brew install cocoapods failed, trying gem..."
    gem install cocoapods || {
      echo "❌ Cannot install CocoaPods"
      exit 1
    }
  }
fi

# Verify node is available
if ! command -v node &> /dev/null; then
  echo "❌ node not found after installation"
  echo "PATH: $PATH"
  exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version || echo 'not found')"
echo "✅ yarn version: $(yarn --version || echo 'not found')"

# Install npm dependencies using yarn (faster and more reliable)
echo "📦 Installing npm dependencies with yarn..."
if [ -f "package.json" ]; then
  yarn install --frozen-lockfile || yarn install || {
    echo "⚠️  yarn install failed, trying npm..."
    npm ci || npm install || {
      echo "❌ Cannot install npm dependencies"
      exit 1
    }
  }
  echo "✅ npm dependencies installed"
else
  echo "❌ package.json not found at $REPO_ROOT/package.json"
  exit 1
fi

# Verify node_modules/.bin exists
if [ ! -d "node_modules/.bin" ]; then
  echo "⚠️  node_modules/.bin missing, trying to fix..."
  yarn install --frozen-lockfile || npm install || {
    echo "❌ Cannot fix node_modules/.bin"
    exit 1
  }
fi

# Install Pods - CRITICAL: Must happen before Xcode reads project
if [ -f "ios/App/Podfile" ]; then
  echo "📦 Installing CocoaPods dependencies..."
  cd ios/App
  pod install --repo-update || {
    echo "❌ pod install failed"
    exit 1
  }
  
  # Verify xcconfig files exist
  if [ ! -f "Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "❌ xcconfig file not created!"
    exit 1
  fi
  
  echo "✅ Pods installed successfully"
  cd "$REPO_ROOT"
else
  echo "❌ Podfile not found at ios/App/Podfile"
  exit 1
fi

echo "✅ Post-clone script completed successfully"
