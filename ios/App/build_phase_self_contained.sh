# Xcode Cloud: Self-Contained Dependency Installation
# This script works even if CI scripts don't run
# It installs everything needed for the build

# Skip if running locally and everything already exists
if [ "${CI}" != "true" ] && [ -d "${SRCROOT}/Pods" ] && [ -f "${SRCROOT}/Pods/Manifest.lock" ] && [ -d "${SRCROOT}/../../node_modules" ]; then
    echo "✅ Dependencies already installed, skipping..."
    exit 0
fi

echo "🔧 Starting self-contained dependency installation..."
echo "📁 SRCROOT: ${SRCROOT}"
echo "📁 CI: ${CI}"

# Navigate to repo root
REPO_ROOT="${SRCROOT}/../../.."
if [ ! -f "$REPO_ROOT/package.json" ]; then
    REPO_ROOT="${SRCROOT}/../.."
fi

if [ ! -f "$REPO_ROOT/package.json" ]; then
    echo "error: Cannot find package.json at $REPO_ROOT/package.json" >&2
    echo "error: Tried: ${SRCROOT}/../../.. and ${SRCROOT}/../.." >&2
    exit 1
fi

cd "$REPO_ROOT" || {
    echo "error: Cannot cd to repository root: $REPO_ROOT" >&2
    exit 1
}

echo "📁 Repository root: $(pwd)"

# Find node - try multiple strategies
NODE_CMD=""
NPM_CMD=""

# Strategy 1: Check PATH
if command -v node &> /dev/null; then
    NODE_CMD="node"
    NPM_CMD="npm"
    echo "✅ Found node in PATH: $(which node)"
fi

# Strategy 2: Check common locations
if [ -z "$NODE_CMD" ]; then
    for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin" "/Users/local/Homebrew/bin"; do
        if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
            export PATH="$NODE_PATH:$PATH"
            NODE_CMD="node"
            if [ -f "$NODE_PATH/npm" ]; then
                NPM_CMD="npm"
            fi
            echo "✅ Found node at: $NODE_PATH/node"
            break
        fi
    done
fi

# If we have node but not npm, try to find npm
if [ -n "$NODE_CMD" ] && [ -z "$NPM_CMD" ]; then
    if [ -f "node_modules/npm/bin/npm-cli.js" ]; then
        NPM_CMD="$NODE_CMD node_modules/npm/bin/npm-cli.js"
        echo "✅ Using npm from node_modules"
    fi
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    if [ -z "$NODE_CMD" ] || [ -z "$NPM_CMD" ]; then
        echo "error: Cannot install npm dependencies - node/npm not found" >&2
        echo "   PATH: $PATH" >&2
        echo "   This is expected if CI scripts didn't run." >&2
        echo "   Please ensure Xcode Cloud workflow is configured correctly." >&2
        exit 1
    fi
    
    echo "📦 Installing npm dependencies..."
    if ! $NPM_CMD ci 2>&1; then
        echo "⚠️  npm ci failed, trying npm install..."
        if ! $NPM_CMD install 2>&1; then
            echo "error: Both npm ci and npm install failed" >&2
            exit 1
        fi
    fi
    echo "✅ npm dependencies installed"
else
    echo "✅ node_modules already exists"
fi

# Create .env file from environment variables if needed
if [ "${CI}" = "true" ] && [ ! -f ".env" ]; then
    echo "🔧 Creating .env file from Xcode Cloud environment variables..."
    if [ -n "${VITE_SUPABASE_URL}" ] && [ -n "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]; then
        cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
EOF
        echo "✅ .env file created"
    else
        echo "⚠️  WARNING: Environment variables not set!" >&2
    fi
fi

# Build web app if needed
if [ ! -d "dist" ] || [ "${CI}" = "true" ]; then
    if [ -z "$NODE_CMD" ]; then
        echo "error: Cannot build web app - node not found" >&2
        exit 1
    fi
    
    echo "🏗️  Building web app..."
    export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}"
    export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
    
    if [ -n "$NPM_CMD" ]; then
        if ! $NPM_CMD run build 2>&1; then
            echo "error: npm run build failed" >&2
            exit 1
        fi
    elif [ -f "node_modules/.bin/vite" ]; then
        if ! $NODE_CMD node_modules/.bin/vite build 2>&1; then
            echo "error: vite build failed" >&2
            exit 1
        fi
    else
        echo "error: Cannot build - no build tool found" >&2
        exit 1
    fi
    echo "✅ Web app built"
else
    echo "✅ dist already exists"
fi

# Sync Capacitor if needed
if [ -n "$NODE_CMD" ] && [ -d "dist" ]; then
    echo "🔄 Syncing Capacitor..."
    if [ -f "node_modules/.bin/cap" ]; then
        if ! $NODE_CMD node_modules/.bin/cap sync ios 2>&1; then
            echo "⚠️  Capacitor sync failed, but continuing..." >&2
        fi
    elif command -v npx &> /dev/null; then
        if ! npx cap sync ios 2>&1; then
            echo "⚠️  Capacitor sync failed, but continuing..." >&2
        fi
    else
        echo "⚠️  Cannot sync Capacitor - npx/cap not found" >&2
    fi
    echo "✅ Capacitor sync attempted"
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

echo "📦 Installing Pods..."
if ! command -v pod &> /dev/null; then
    echo "error: CocoaPods (pod) not found in PATH" >&2
    echo "PATH: $PATH" >&2
    exit 1
fi

if ! pod install 2>&1; then
    echo "error: pod install failed" >&2
    echo "📁 Current directory: $(pwd)"
    echo "📁 Podfile location: $(pwd)/Podfile"
    exit 1
fi

echo "✅ All dependencies installed successfully"

