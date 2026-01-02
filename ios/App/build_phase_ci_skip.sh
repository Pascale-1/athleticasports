#!/bin/bash
if [[ "${CI:-false}" == "TRUE" ]]; then
  echo "CI: Dependencies handled by post-clone"
  exit 0
fi

# Local development logic
echo "🔧 Local development: Verifying dependencies..."

# Navigate to repo root
REPO_ROOT="${SRCROOT}/../../.."
if [ ! -f "$REPO_ROOT/package.json" ]; then
    REPO_ROOT="${SRCROOT}/../.."
fi

if [ ! -f "$REPO_ROOT/package.json" ]; then
    echo "error: Cannot find package.json" >&2
    exit 1
fi

cd "$REPO_ROOT" || exit 1

# Check if dependencies exist
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@capacitor" ]; then
    echo "📦 Installing npm dependencies..."
    if command -v yarn &> /dev/null; then
        yarn install || npm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo "error: Neither yarn nor npm found" >&2
        exit 1
    fi
fi

# Build web app if needed
if [ ! -d "dist" ]; then
    echo "🏗️  Building web app..."
    if command -v yarn &> /dev/null; then
        yarn build || npm run build
    else
        npm run build
    fi
fi

# Sync Capacitor
if [ -d "dist" ]; then
    echo "🔄 Syncing Capacitor..."
    npx cap sync ios || true
fi

# Install Pods
cd "${SRCROOT}" || exit 1
if [ ! -d "Pods" ] || [ ! -f "Pods/Manifest.lock" ]; then
    echo "📦 Installing Pods..."
    if command -v pod &> /dev/null; then
        pod install || exit 1
    else
        echo "error: CocoaPods not found" >&2
        exit 1
    fi
fi

echo "✅ Local dependencies ready"

