# Xcode Cloud: Install Dependencies and Pods
# This script runs AFTER ci_post_clone.sh should have installed everything
# If post-clone didn't run, this script tries to handle it gracefully

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

# In CI, check if post-clone script ran successfully
if [ "${CI}" = "true" ]; then
    echo "🔍 Verifying post-clone script results..."
    
    # Check if node_modules exists and has content
    if [ ! -d "node_modules" ] || [ ! -d "node_modules/@capacitor" ]; then
        echo "⚠️  WARNING: node_modules missing or incomplete - post-clone may not have run" >&2
        echo "   Attempting to install dependencies..." >&2
        
        # Try to find node
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
            echo "error: node not found and node_modules incomplete" >&2
            echo "   Post-clone script should have installed node and dependencies." >&2
            echo "   Please check Xcode Cloud workflow configuration." >&2
            echo "   Expected ci_scripts/ci_post_clone.sh at repository root." >&2
            exit 1
        fi
        
        echo "✅ Found node: $(which node)"
        
        # Install dependencies
        if command -v yarn &> /dev/null; then
            echo "📦 Installing dependencies with yarn..."
            yarn install --frozen-lockfile || yarn install || {
                echo "error: yarn install failed" >&2
                exit 1
            }
        elif command -v npm &> /dev/null; then
            echo "📦 Installing dependencies with npm..."
            npm ci || npm install || {
                echo "error: npm install failed" >&2
                exit 1
            }
        else
            echo "error: Neither yarn nor npm found" >&2
            exit 1
        fi
        
        # Verify Capacitor is installed
        if [ ! -d "node_modules/@capacitor/ios" ]; then
            echo "error: Capacitor iOS not installed" >&2
            exit 1
        fi
        
        echo "✅ Dependencies installed"
    else
        echo "✅ node_modules exists and has Capacitor"
    fi
    
    # Verify node_modules/.bin exists
    if [ ! -d "node_modules/.bin" ]; then
        echo "⚠️  node_modules/.bin missing, fixing..."
        if command -v yarn &> /dev/null; then
            yarn install --frozen-lockfile || yarn install || true
        elif command -v npm &> /dev/null; then
            npm install || true
        fi
    fi
    
    # Find node (should be available after post-clone or our install)
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
        echo "error: node not found - cannot build web app" >&2
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

# CRITICAL: Verify node_modules/@capacitor/ios exists before installing Pods
# The Podfile requires it
if [ ! -d "${REPO_ROOT}/node_modules/@capacitor/ios" ]; then
    echo "error: Capacitor iOS not found in node_modules!" >&2
    echo "   Expected: ${REPO_ROOT}/node_modules/@capacitor/ios" >&2
    echo "   The Podfile requires Capacitor from node_modules." >&2
    echo "   Post-clone script should have installed dependencies." >&2
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

