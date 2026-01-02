# Xcode Cloud: Install Dependencies and Pods
# This script runs AFTER ci_post_clone.sh should have installed everything
# If CI=TRUE, we assume post-clone handled everything and skip

# Skip if running in CI - post-clone script handles everything
if [ "${CI}" = "TRUE" ] || [ "${CI}" = "true" ]; then
    echo "✅ Dependencies from post-clone - skipping build phase"
    exit 0
fi

# Local development: verify and install if needed
echo "🔧 Starting dependency verification (local development)..."
echo "📁 SRCROOT: ${SRCROOT}"

# Navigate to repo root
REPO_ROOT="${SRCROOT}/../../.."
if [ ! -f "$REPO_ROOT/package.json" ]; then
    REPO_ROOT="${SRCROOT}/../.."
fi

if [ ! -f "$REPO_ROOT/package.json" ]; then
    echo "error: Cannot find package.json at $REPO_ROOT/package.json" >&2
    exit 1
fi

cd "$REPO_ROOT" || {
    echo "error: Cannot cd to repository root: $REPO_ROOT" >&2
    exit 1
}

echo "📁 Repository root: $(pwd)"

# Local: check if dependencies exist, install if needed
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
    elif command -v npm &> /dev/null; then
        npm run build
    fi
fi

# Sync Capacitor if needed
if [ -d "dist" ]; then
    echo "🔄 Syncing Capacitor..."
    if command -v npx &> /dev/null; then
        npx cap sync ios || true
    fi
fi

# Install Pods
cd "${SRCROOT}" || {
    echo "error: Cannot cd to ${SRCROOT}" >&2
    exit 1
}

if [ ! -f "Podfile" ]; then
    echo "error: Podfile not found at ${SRCROOT}/Podfile" >&2
    exit 1
fi

if [ ! -d "Pods" ] || [ ! -f "Pods/Manifest.lock" ]; then
    echo "📦 Installing Pods..."
    if ! command -v pod &> /dev/null; then
        echo "error: CocoaPods (pod) not found in PATH" >&2
        exit 1
    fi
    
    if ! pod install 2>&1; then
        echo "error: pod install failed" >&2
        exit 1
    fi
fi

echo "✅ All dependencies ready"

