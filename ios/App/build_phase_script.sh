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

# Strategy 1: Check PATH first
if command -v node &> /dev/null; then
    NODE_CMD="node"
    echo "✅ Found node in PATH: $(which node)"
elif command -v npm &> /dev/null; then
    # If npm is found, node should be nearby
    NPM_DIR="$(dirname $(which npm))"
    if [ -f "$NPM_DIR/node" ]; then
        export PATH="$NPM_DIR:$PATH"
        NODE_CMD="node"
        NPM_CMD="npm"
        echo "✅ Found node via npm at: $NPM_DIR/node"
    fi
fi

# Strategy 2: Search common installation paths
if [ -z "$NODE_CMD" ]; then
    echo "🔍 Searching for node in common locations..."
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
if [ -z "$NODE_CMD" ]; then
    echo "error: Cannot find node anywhere" >&2
    echo "PATH: $PATH" >&2
    echo "Searched in: /usr/local/bin, /opt/homebrew/bin, /usr/bin, /opt/pmk/env/global/bin, /Users/local/Homebrew/bin" >&2
    echo "node_modules exists: $([ -d "node_modules" ] && echo "YES" || echo "NO")" >&2
    if [ -d "node_modules" ]; then
        echo "node_modules/.bin exists: $([ -d "node_modules/.bin" ] && echo "YES" || echo "NO")" >&2
        if [ -d "node_modules/.bin" ]; then
            echo "Contents of node_modules/.bin (first 10):" >&2
            ls -la node_modules/.bin | head -10 >&2
        fi
    fi
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
