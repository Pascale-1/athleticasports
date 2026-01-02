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

# DIAGNOSTIC: Log environment for debugging
echo "🔍 Diagnostic Information:"
echo "   PATH: $PATH"
echo "   PWD: $(pwd)"
echo "   node_modules exists: $([ -d "node_modules" ] && echo "YES" || echo "NO")"
if [ -d "node_modules" ]; then
    echo "   node_modules/.bin exists: $([ -d "node_modules/.bin" ] && echo "YES" || echo "NO")"
    if [ -d "node_modules/.bin" ]; then
        echo "   node_modules/.bin/vite exists: $([ -f "node_modules/.bin/vite" ] && echo "YES" || echo "NO")"
    fi
fi

# Find node - try multiple strategies with extensive logging
NODE_CMD=""
NPM_CMD=""

# Strategy 1: Check PATH
echo "🔍 Strategy 1: Checking PATH..."
if command -v node &> /dev/null; then
    NODE_CMD="node"
    NPM_CMD="npm"
    echo "✅ Found node in PATH: $(which node)"
fi

# Strategy 2: Check common locations
if [ -z "$NODE_CMD" ]; then
    echo "🔍 Strategy 2: Checking common installation paths..."
    for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin" "/Users/local/Homebrew/bin" "/Library/Apple/usr/bin"; do
        echo "   Checking: $NODE_PATH/node"
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

# Strategy 3: If node_modules exists, try to infer node location from npm
if [ -z "$NODE_CMD" ] && [ -d "node_modules" ]; then
    echo "🔍 Strategy 3: node_modules exists, trying to infer node location..."
    # Check if we can use node from node_modules/.bin directly
    if [ -f "node_modules/.bin/node" ]; then
        NODE_CMD="node_modules/.bin/node"
        echo "✅ Found node in node_modules/.bin/node"
    # Try to find node via npm's location
    elif command -v npm &> /dev/null; then
        NPM_LOCATION=$(which npm 2>/dev/null || command -v npm 2>/dev/null)
        if [ -n "$NPM_LOCATION" ]; then
            NPM_DIR="$(dirname "$NPM_LOCATION")"
            echo "   npm found at: $NPM_LOCATION"
            echo "   Checking for node in: $NPM_DIR"
            if [ -f "$NPM_DIR/node" ] && [ -x "$NPM_DIR/node" ]; then
                export PATH="$NPM_DIR:$PATH"
                NODE_CMD="node"
                echo "✅ Found node via npm location: $NPM_DIR/node"
            fi
        fi
    fi
fi

# Strategy 4: Try to use node from Xcode Cloud's Node.js installation
if [ -z "$NODE_CMD" ] && [ "${CI}" = "true" ]; then
    echo "🔍 Strategy 4: Checking Xcode Cloud Node.js locations..."
    # Xcode Cloud may have Node.js in specific locations
    for NODE_PATH in "/opt/pmk/env/global/bin" "/usr/local/node/bin" "/opt/nodejs/bin" "/var/folders"; do
        if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
            export PATH="$NODE_PATH:$PATH"
            NODE_CMD="node"
            echo "✅ Found node at: $NODE_PATH/node"
            break
        fi
    done
fi

# Strategy 5: If node_modules exists but we still can't find node, try to use vite directly
# This is a fallback - vite might be a standalone binary or we can try to execute it
if [ -z "$NODE_CMD" ] && [ -d "node_modules" ] && [ -f "node_modules/.bin/vite" ]; then
    echo "🔍 Strategy 5: node_modules exists, checking if we can skip node requirement..."
    # Check if vite is a standalone executable or needs node
    if head -1 "node_modules/.bin/vite" | grep -q "#!/usr/bin/env node"; then
        echo "   vite requires node, but node not found"
    else
        echo "   vite might be standalone, but this is unlikely"
    fi
fi

# If we have node but not npm, try to find npm
if [ -n "$NODE_CMD" ] && [ -z "$NPM_CMD" ]; then
    echo "🔍 Finding npm..."
    if [ -f "node_modules/npm/bin/npm-cli.js" ]; then
        NPM_CMD="$NODE_CMD node_modules/npm/bin/npm-cli.js"
        echo "✅ Using npm from node_modules"
    elif command -v npm &> /dev/null; then
        NPM_CMD="npm"
        echo "✅ Found npm in PATH"
    fi
fi

# Final diagnostic
echo "🔍 Final node detection result:"
echo "   NODE_CMD: ${NODE_CMD:-NOT FOUND}"
echo "   NPM_CMD: ${NPM_CMD:-NOT FOUND}"

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
# CRITICAL: If node_modules exists but node is not found, we might be able to skip the build
# if dist already exists from a previous run
if [ ! -d "dist" ] || [ "${CI}" = "true" ]; then
    if [ -z "$NODE_CMD" ]; then
        # If dist already exists, we can skip the build
        if [ -d "dist" ]; then
            echo "⚠️  WARNING: node not found, but dist exists - skipping build" >&2
            echo "   Using existing dist directory" >&2
        else
            echo "error: Cannot build web app - node not found" >&2
            echo "   PATH: $PATH" >&2
            echo "   node_modules exists: $([ -d "node_modules" ] && echo "YES" || echo "NO")" >&2
            echo "   dist exists: $([ -d "dist" ] && echo "YES" || echo "NO")" >&2
            echo "   This suggests CI scripts ran but node is not available in build phase." >&2
            exit 1
        fi
    else
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
    fi
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

