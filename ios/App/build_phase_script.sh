# Xcode Cloud: Install all dependencies and Pods
# This runs BEFORE Pods check to ensure everything is ready
# Don't use set -e - handle errors manually for better debugging

# Skip if running locally and everything already exists
if [ "${CI}" != "true" ] && [ -d "${SRCROOT}/Pods" ] && [ -f "${SRCROOT}/Pods/Manifest.lock" ] && [ -d "${SRCROOT}/../../node_modules" ]; then
    echo "✅ Dependencies already installed, skipping..."
    exit 0
fi

echo "🔧 Starting dependency installation..."
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

# CRITICAL: Find node first, then npm - use aggressive search
# Since node_modules exists, node MUST be available somewhere
NODE_CMD=""
NPM_CMD=""

# Strategy 0: Check if post-clone script saved node path
if [ -z "$NODE_CMD" ] && [ -f "/tmp/xcode_cloud_node_path.txt" ]; then
    SAVED_NODE_PATH="$(cat /tmp/xcode_cloud_node_path.txt)"
    if [ -n "$SAVED_NODE_PATH" ] && [ -f "$SAVED_NODE_PATH/node" ] && [ -x "$SAVED_NODE_PATH/node" ]; then
        export PATH="$SAVED_NODE_PATH:$PATH"
        NODE_CMD="node"
        echo "✅ Found node from post-clone script at: $SAVED_NODE_PATH/node"
        if [ -f "$SAVED_NODE_PATH/npm" ]; then
            NPM_CMD="npm"
            echo "✅ Found npm at: $SAVED_NODE_PATH/npm"
        fi
    fi
fi

# Strategy 1: Check PATH first
if [ -z "$NODE_CMD" ] && command -v node &> /dev/null; then
    NODE_CMD="node"
    echo "✅ Found node in PATH: $(which node)"
elif [ -z "$NODE_CMD" ] && command -v npm &> /dev/null; then
    # If npm is found, node should be nearby
    NPM_DIR="$(dirname $(which npm))"
    if [ -f "$NPM_DIR/node" ]; then
        export PATH="$NPM_DIR:$PATH"
        NODE_CMD="node"
        NPM_CMD="npm"
        echo "✅ Found node via npm at: $NPM_DIR/node"
    fi
fi

# Strategy 2: Search common installation paths AND version manager locations
if [ -z "$NODE_CMD" ]; then
    echo "🔍 Searching for node in common locations..."
    # Check standard paths
    for NODE_PATH in "/usr/local/bin" "/opt/homebrew/bin" "/usr/bin" "/opt/pmk/env/global/bin" "/Users/local/Homebrew/bin" "/Library/Apple/usr/bin"; do
        if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
            export PATH="$NODE_PATH:$PATH"
            NODE_CMD="node"
            echo "✅ Found node at: $NODE_PATH/node"
            # Check for npm in same directory
            if [ -f "$NODE_PATH/npm" ]; then
                NPM_CMD="npm"
                echo "✅ Found npm at: $NODE_PATH/npm"
            fi
            break
        fi
    done
    
    # If still not found, check version manager locations
    if [ -z "$NODE_CMD" ] && [ "${CI}" = "true" ]; then
        echo "🔍 Checking version manager locations..."
        # Check nvm locations
        if [ -d "$HOME/.nvm" ]; then
            # Try to find node in nvm
            for NVM_NODE in "$HOME/.nvm/versions/node"/*/bin/node; do
                if [ -f "$NVM_NODE" ] && [ -x "$NVM_NODE" ]; then
                    NVM_DIR="$(dirname "$NVM_NODE")"
                    export PATH="$NVM_DIR:$PATH"
                    NODE_CMD="node"
                    echo "✅ Found node via nvm at: $NVM_NODE"
                    if [ -f "$NVM_DIR/npm" ]; then
                        NPM_CMD="npm"
                    fi
                    break
                fi
            done
        fi
        
        # Check asdf locations
        if [ -z "$NODE_CMD" ] && [ -d "$HOME/.asdf" ]; then
            ASDF_NODE="$HOME/.asdf/installs/nodejs/*/bin/node"
            if ls $ASDF_NODE 2>/dev/null | head -1 | read FOUND; then
                ASDF_DIR="$(dirname "$FOUND")"
                export PATH="$ASDF_DIR:$PATH"
                NODE_CMD="node"
                echo "✅ Found node via asdf at: $FOUND"
                if [ -f "$ASDF_DIR/npm" ]; then
                    NPM_CMD="npm"
                fi
            fi
        fi
        
        # Check fnm (Fast Node Manager)
        if [ -z "$NODE_CMD" ] && [ -d "$HOME/.fnm" ]; then
            FNM_NODE="$HOME/.fnm/node-versions/*/installation/bin/node"
            if ls $FNM_NODE 2>/dev/null | head -1 | read FOUND; then
                FNM_DIR="$(dirname "$FOUND")"
                export PATH="$FNM_DIR:$PATH"
                NODE_CMD="node"
                echo "✅ Found node via fnm at: $FOUND"
                if [ -f "$FNM_DIR/npm" ]; then
                    NPM_CMD="npm"
                fi
            fi
        fi
    fi
fi

# Strategy 3: Check additional specific paths (skip find - too slow in CI)
if [ -z "$NODE_CMD" ] && [ "${CI}" = "true" ]; then
    echo "🔍 Checking additional specific paths..."
    # Check more specific paths without using find (faster)
    for NODE_PATH in "/usr/local/node/bin" "/opt/nodejs/bin" "/usr/local/nodejs/bin" "/var/folders" "/tmp" "/Users/local/bin"; do
        if [ -f "$NODE_PATH/node" ] && [ -x "$NODE_PATH/node" ]; then
            export PATH="$NODE_PATH:$PATH"
            NODE_CMD="node"
            echo "✅ Found node at: $NODE_PATH/node"
            # Check for npm in same directory
            if [ -f "$NODE_PATH/npm" ]; then
                NPM_CMD="npm"
                echo "✅ Found npm at: $NODE_PATH/npm"
            fi
            break
        fi
    done
fi

# Strategy 4: Try to source common profile files that might set up PATH
if [ -z "$NODE_CMD" ] && [ "${CI}" = "true" ]; then
    echo "🔍 Checking for profile files..."
    for PROFILE in "$HOME/.bash_profile" "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile" "/etc/profile"; do
        if [ -f "$PROFILE" ]; then
            # Source it and check for node
            . "$PROFILE" 2>/dev/null || true
            if command -v node &> /dev/null; then
                NODE_CMD="node"
                echo "✅ Found node after sourcing $PROFILE"
                if command -v npm &> /dev/null; then
                    NPM_CMD="npm"
                fi
                break
            fi
        fi
    done
fi

# Strategy 5: If we have node but not npm, try npm from node_modules or use node directly
if [ -n "$NODE_CMD" ] && [ -z "$NPM_CMD" ]; then
    if [ -f "node_modules/npm/bin/npm-cli.js" ]; then
        # npm is installed as a package
        NPM_CMD="$NODE_CMD node_modules/npm/bin/npm-cli.js"
        echo "✅ Found npm package, using: $NPM_CMD"
    elif [ -d "node_modules/.bin" ]; then
        # We can use node to run scripts from node_modules/.bin
        echo "✅ Will use node to run scripts from node_modules/.bin"
        # NPM_CMD will be set when we need it
    fi
fi

# Final verification - we MUST have node
# CRITICAL: If node_modules exists, node MUST be available - try one more thing
if [ -z "$NODE_CMD" ] && [ -d "node_modules" ]; then
    echo "⚠️  node_modules exists but node not found - trying to infer node location..."
    # Check if we can find node by looking at package.json engines or checking npm config
    # Or try to use which/whereis if available
    if command -v which &> /dev/null; then
        # Try which with expanded PATH
        for EXTRA_PATH in "/usr/local/lib/node_modules/npm/bin" "/opt/homebrew/lib/node_modules/npm/bin"; do
            if [ -f "$EXTRA_PATH/node-gyp" ]; then
                # npm is here, node might be nearby
                PARENT_DIR="$(dirname "$EXTRA_PATH")"
                if [ -f "$PARENT_DIR/../bin/node" ]; then
                    NODE_DIR="$(cd "$PARENT_DIR/../bin" && pwd)"
                    export PATH="$NODE_DIR:$PATH"
                    NODE_CMD="node"
                    echo "✅ Found node via npm location at: $NODE_DIR/node"
                    break
                fi
            fi
        done
    fi
fi

# If still no node, this is a critical error
if [ -z "$NODE_CMD" ]; then
    echo "error: Cannot find node anywhere" >&2
    echo "PATH: $PATH" >&2
    echo "Searched in: /usr/local/bin, /opt/homebrew/bin, /usr/bin, /opt/pmk/env/global/bin, /Users/local/Homebrew/bin" >&2
    echo "node_modules exists: $([ -d "node_modules" ] && echo "YES" || echo "NO")" >&2
    if [ -d "node_modules" ]; then
        echo "node_modules/.bin exists: $([ -d "node_modules/.bin" ] && echo "YES" || echo "NO")" >&2
        echo "node_modules structure (first level):" >&2
        ls -la node_modules | head -20 >&2
    fi
    echo "" >&2
    echo "💡 Since node_modules exists, node WAS available during npm install." >&2
    echo "   The issue is that node is not in PATH during build phase." >&2
    echo "   Please check Xcode Cloud post-clone script to ensure node is in PATH." >&2
    exit 1
fi

echo "✅ Node found: $NODE_CMD"
if [ -n "$NPM_CMD" ]; then
    echo "✅ npm command: $NPM_CMD"
fi

# Install npm dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    if [ -n "$NPM_CMD" ]; then
        if ! $NPM_CMD ci; then
            echo "⚠️  npm ci failed, trying npm install..."
            if ! $NPM_CMD install; then
                echo "error: Both npm ci and npm install failed" >&2
                exit 1
            fi
        fi
    else
        echo "error: Cannot install dependencies - npm not available" >&2
        exit 1
    fi
    echo "✅ npm dependencies installed"
else
    echo "✅ node_modules already exists"
fi

# CRITICAL: Create .env file from Xcode Cloud environment variables
# Vite needs these at BUILD TIME, not runtime
if [ "${CI}" = "true" ]; then
    echo "🔧 Creating .env file from Xcode Cloud environment variables..."
    
    # Check if environment variables are set
    if [ -z "${VITE_SUPABASE_URL}" ] || [ -z "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]; then
        echo "⚠️  WARNING: Environment variables not set in Xcode Cloud!" >&2
        echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:+SET}" >&2
        echo "   VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY:+SET}" >&2
        echo "   Build may fail or app may not work correctly." >&2
    fi
    
    # Create .env file from environment variables
    cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY:-}
EOF
    
    echo "✅ .env file created"
    echo "📋 Verifying .env file contents (URL only, key hidden):"
    if [ -f ".env" ]; then
        grep "VITE_SUPABASE_URL" .env | sed 's/=.*/=***/' || true
        echo "   VITE_SUPABASE_PUBLISHABLE_KEY=***"
    fi
fi

# Build web app
if [ ! -d "dist" ] || [ "${CI}" = "true" ]; then
    echo "🏗️  Building web app..."
    
    # Export environment variables to ensure they're available
    export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}"
    export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"
    
    # Try build with error handling
    if [ -n "$NPM_CMD" ]; then
        echo "📦 Running: $NPM_CMD run build"
        if ! $NPM_CMD run build 2>&1; then
            echo "error: npm run build failed" >&2
            exit 1
        fi
    elif [ -f "node_modules/.bin/vite" ]; then
        # Fallback: run vite directly if npm is not available
        echo "📦 Running build directly with vite (npm not available)"
        # First run pre-build-check if it exists
        if [ -f "scripts/pre-build-check.js" ]; then
            echo "📋 Running pre-build check..."
            $NODE_CMD scripts/pre-build-check.js || {
                echo "⚠️  Pre-build check failed, continuing anyway..."
            }
        fi
        # Run vite build
        if ! $NODE_CMD node_modules/.bin/vite build 2>&1; then
            echo "error: vite build failed" >&2
            exit 1
        fi
    else
        echo "error: Cannot build - neither npm nor vite found" >&2
        exit 1
    fi
    echo "✅ Web app built"
else
    echo "✅ dist already exists"
fi

# Sync Capacitor - use npx from node_modules if needed
if [ -z "$NODE_CMD" ]; then
    echo "error: node not available for Capacitor sync" >&2
    exit 1
fi

if [ -f "node_modules/.bin/npx" ]; then
    NPX_CMD="$NODE_CMD node_modules/.bin/npx"
elif [ -f "node_modules/.bin/cap" ]; then
    # Use cap directly if available
    NPX_CMD="$NODE_CMD node_modules/.bin/cap"
elif command -v npx &> /dev/null; then
    NPX_CMD="npx"
else
    echo "error: npx not found and cap binary not available" >&2
    exit 1
fi

echo "🔄 Syncing Capacitor..."
if ! $NPX_CMD sync ios; then
    echo "error: Capacitor sync failed" >&2
    exit 1
fi
echo "✅ Capacitor synced"

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
