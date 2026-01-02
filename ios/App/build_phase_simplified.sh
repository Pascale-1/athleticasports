# Xcode Cloud: Install Dependencies and Pods
# This script runs AFTER ci_post_clone.sh has installed everything
# It only verifies and builds the web app if needed

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
    exit 1
fi

cd "$REPO_ROOT" || {
    echo "error: Cannot cd to repository root: $REPO_ROOT" >&2
    exit 1
}

echo "📁 Repository root: $(pwd)"

# In CI, post-clone script should have installed everything
# Just verify and build if needed
if [ "${CI}" = "true" ]; then
    echo "🔍 Verifying post-clone script results..."
    
    # Check if node_modules/.bin exists (post-clone should have created it)
    if [ ! -d "node_modules/.bin" ]; then
        echo "⚠️  WARNING: node_modules/.bin missing - post-clone may have failed" >&2
        echo "   Attempting to fix..." >&2
        
        # Try to find node and fix it
        NODE_CMD=""
        if command -v node &> /dev/null; then
            NODE_CMD="node"
        elif [ -f "/opt/homebrew/bin/node" ]; then
            export PATH="/opt/homebrew/bin:$PATH"
            NODE_CMD="node"
        elif [ -f "/usr/local/bin/node" ]; then
            export PATH="/usr/local/bin:$PATH"
            NODE_CMD="node"
        fi
        
        if [ -n "$NODE_CMD" ]; then
            echo "📦 Fixing node_modules/.bin..."
            if command -v yarn &> /dev/null; then
                yarn install --frozen-lockfile || yarn install || true
            elif command -v npm &> /dev/null; then
                npm ci || npm install || true
            fi
        else
            echo "error: Cannot fix node_modules/.bin - node not found" >&2
            exit 1
        fi
    fi
    
    # Find node (should be available after post-clone)
    NODE_CMD=""
    if command -v node &> /dev/null; then
        NODE_CMD="node"
    elif [ -f "/opt/homebrew/bin/node" ]; then
        export PATH="/opt/homebrew/bin:$PATH"
        NODE_CMD="node"
    elif [ -f "/usr/local/bin/node" ]; then
        export PATH="/usr/local/bin:$PATH"
        NODE_CMD="node"
    fi
    
    if [ -z "$NODE_CMD" ]; then
        echo "error: node not found - post-clone script should have installed it" >&2
        echo "PATH: $PATH" >&2
        exit 1
    fi
    
    echo "✅ Node.js found: $(which node)"
    
    # Create .env file from environment variables if needed
    if [ ! -f ".env" ]; then
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
    if [ ! -d "dist" ]; then
        echo "🏗️  Building web app..."
        export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}"
        export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
        
        if command -v yarn &> /dev/null; then
            yarn build || {
                echo "error: yarn build failed" >&2
                exit 1
            }
        elif [ -f "node_modules/.bin/vite" ]; then
            $NODE_CMD node_modules/.bin/vite build || {
                echo "error: vite build failed" >&2
                exit 1
            }
        elif command -v npm &> /dev/null; then
            npm run build || {
                echo "error: npm run build failed" >&2
                exit 1
            }
        else
            echo "error: Cannot build - no build tool found" >&2
            exit 1
        fi
        echo "✅ Web app built"
    else
        echo "✅ dist already exists"
    fi
    
    # Sync Capacitor if needed
    if [ -d "dist" ]; then
        echo "🔄 Syncing Capacitor..."
        if [ -f "node_modules/.bin/cap" ]; then
            $NODE_CMD node_modules/.bin/cap sync ios || {
                echo "⚠️  Capacitor sync failed, but continuing..." >&2
            }
        elif command -v npx &> /dev/null; then
            npx cap sync ios || {
                echo "⚠️  Capacitor sync failed, but continuing..." >&2
            }
        fi
        echo "✅ Capacitor sync attempted"
    fi
fi

# Install Pods (should already be done by post-clone, but verify)
cd "${SRCROOT}" || {
    echo "error: Cannot cd to ${SRCROOT}" >&2
    exit 1
}

if [ ! -f "Podfile" ]; then
    echo "error: Podfile not found at ${SRCROOT}/Podfile" >&2
    exit 1
fi

# Only install Pods if they don't exist (post-clone should have done this)
if [ ! -d "Pods" ] || [ ! -f "Pods/Manifest.lock" ]; then
    echo "📦 Installing Pods (post-clone may have missed this)..."
    if ! command -v pod &> /dev/null; then
        echo "error: CocoaPods (pod) not found in PATH" >&2
        exit 1
    fi
    
    if ! pod install 2>&1; then
        echo "error: pod install failed" >&2
        exit 1
    fi
    echo "✅ Pods installed"
else
    echo "✅ Pods already installed (from post-clone script)"
fi

echo "✅ All dependencies verified and ready"

