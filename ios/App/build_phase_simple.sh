# Xcode Cloud: Install Dependencies and Pods
# This runs BEFORE Pods check to ensure everything is ready
# NOTE: Web app build should happen in ci_pre_xcodebuild.sh (which has node/npm access)
# This script only verifies prerequisites and installs Pods

# Skip if running locally and everything already exists
if [ "${CI}" != "true" ] && [ -d "${SRCROOT}/Pods" ] && [ -f "${SRCROOT}/Pods/Manifest.lock" ] && [ -d "${SRCROOT}/../../node_modules" ]; then
    echo "✅ Dependencies already installed, skipping..."
    exit 0
fi

echo "🔧 Starting dependency verification..."
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

# In CI, the pre-build script should have built the web app
# Just verify dist exists - if not, that's a problem
if [ "${CI}" = "true" ]; then
    if [ ! -d "dist" ]; then
        echo "⚠️  WARNING: dist directory not found!" >&2
        echo "   Expected ci_pre_xcodebuild.sh to build the web app." >&2
        echo "   If this script is running, the pre-build script may have failed or not run." >&2
        echo "   Checking if we can build now..." >&2
        
        # Try to find node one more time (simplified check)
        NODE_CMD=""
        for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin"; do
            if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
                export PATH="$NODE_PATH:$PATH"
                NODE_CMD="node"
                break
            fi
        done
        
        if [ -n "$NODE_CMD" ] && [ -f "node_modules/.bin/vite" ]; then
            echo "📦 Building web app now (fallback)..."
            export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}"
            export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
            $NODE_CMD node_modules/.bin/vite build || {
                echo "error: Fallback build failed" >&2
                exit 1
            }
        else
            echo "error: Cannot build - dist not found and node not available" >&2
            echo "   Please ensure ci_pre_xcodebuild.sh runs and builds the web app." >&2
            exit 1
        fi
    else
        echo "✅ dist directory exists (built by pre-build script)"
    fi
fi

# Sync Capacitor if dist was just built or if needed
if [ "${CI}" = "true" ] && [ -d "dist" ]; then
    # Try to sync Capacitor - find npx or cap
    NPX_CMD=""
    if command -v npx &> /dev/null; then
        NPX_CMD="npx"
    elif [ -f "node_modules/.bin/npx" ]; then
        # Try to find node for npx
        for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin"; do
            if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
                export PATH="$NODE_PATH:$PATH"
                NPX_CMD="npx"
                break
            fi
        done
        if [ -z "$NPX_CMD" ] && [ -f "node_modules/.bin/cap" ]; then
            # Use cap directly
            for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin"; do
                if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
                    export PATH="$NODE_PATH:$PATH"
                    NPX_CMD="$NODE_PATH/node node_modules/.bin/cap"
                    break
                fi
            done
        fi
    fi
    
    if [ -n "$NPX_CMD" ]; then
        echo "🔄 Syncing Capacitor..."
        $NPX_CMD sync ios || {
            echo "⚠️  Capacitor sync failed, but continuing..." >&2
        }
        echo "✅ Capacitor sync attempted"
    else
        echo "⚠️  Cannot sync Capacitor - npx/node not found" >&2
        echo "   Expected ci_pre_xcodebuild.sh to sync Capacitor." >&2
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

echo "📦 Installing Pods..."
if ! command -v pod &> /dev/null; then
    echo "error: CocoaPods (pod) not found in PATH" >&2
    echo "PATH: $PATH" >&2
    exit 1
fi

if ! pod install; then
    echo "error: pod install failed" >&2
    echo "📁 Current directory: $(pwd)"
    echo "📁 Podfile location: $(pwd)/Podfile"
    exit 1
fi

echo "✅ All dependencies installed successfully"

