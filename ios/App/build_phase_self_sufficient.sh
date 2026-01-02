#!/bin/bash
# Xcode Cloud: Self-Sufficient Build Phase
# This script handles EVERYTHING - doesn't rely on CI scripts
# Works even if CI scripts don't run

set -e

echo "🔧 Self-sufficient dependency installation..."
echo "📁 SRCROOT: ${SRCROOT}"
echo "📁 CI: ${CI}"

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
echo "📁 Repository root: $(pwd)"

# Install Homebrew tools if needed (CI environment)
if [ "${CI}" = "TRUE" ] || [ "${CI}" = "true" ]; then
    echo "📦 Installing build tools..."
    export HOMEBREW_NO_INSTALL_CLEANUP=1
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
    
    # Install node if not found
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js..."
        brew install node || {
            # Try alternative paths
            if [ -f "/opt/homebrew/bin/node" ]; then
                export PATH="/opt/homebrew/bin:$PATH"
            elif [ -f "/usr/local/bin/node" ]; then
                export PATH="/usr/local/bin:$PATH"
            else
                echo "error: Cannot install or find node" >&2
                exit 1
            fi
        }
    fi
    
    # Install yarn if not found
    if ! command -v yarn &> /dev/null; then
        echo "📦 Installing Yarn..."
        brew install yarn || {
            if command -v npm &> /dev/null; then
                npm install -g yarn || true
            fi
        }
    fi
    
    # Install CocoaPods if not found
    if ! command -v pod &> /dev/null; then
        echo "📦 Installing CocoaPods..."
        brew install cocoapods || {
            gem install cocoapods || {
                echo "error: Cannot install CocoaPods" >&2
                exit 1
            }
        }
    fi
    
    echo "✅ Build tools installed"
    echo "   Node: $(node --version || echo 'not found')"
    echo "   Yarn: $(yarn --version || echo 'not found')"
    echo "   Pod: $(pod --version || echo 'not found')"
fi

# Install npm dependencies
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@capacitor" ]; then
    echo "📦 Installing npm dependencies..."
    
    # Find node
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
        echo "error: node not found" >&2
        exit 1
    fi
    
    # Install dependencies
    if command -v yarn &> /dev/null; then
        yarn install --frozen-lockfile --network-timeout 300000 || yarn install || {
            echo "⚠️  yarn failed, trying npm..."
            npm ci || npm install || {
                echo "error: Cannot install dependencies" >&2
                exit 1
            }
        }
    elif command -v npm &> /dev/null; then
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
    echo "✅ node_modules exists"
fi

# Create .env file from environment variables
if [ "${CI}" = "TRUE" ] || [ "${CI}" = "true" ]; then
    if [ ! -f ".env" ]; then
        echo "🔧 Creating .env file..."
        if [ -n "${VITE_SUPABASE_URL}" ] && [ -n "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]; then
            cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
EOF
            echo "✅ .env file created"
        fi
    fi
fi

# Build web app
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

# Sync Capacitor
if [ -d "dist" ]; then
    echo "🔄 Syncing Capacitor..."
    if [ -f "node_modules/.bin/cap" ]; then
        $NODE_CMD node_modules/.bin/cap sync ios || true
    elif command -v npx &> /dev/null; then
        npx cap sync ios || true
    fi
    echo "✅ Capacitor synced"
fi

# Install Pods
cd "${SRCROOT}" || exit 1

if [ ! -f "Podfile" ]; then
    echo "error: Podfile not found" >&2
    exit 1
fi

# CRITICAL: Verify Capacitor exists before Pods
if [ ! -d "${REPO_ROOT}/node_modules/@capacitor/ios" ]; then
    echo "error: Capacitor iOS not found!" >&2
    echo "   Expected: ${REPO_ROOT}/node_modules/@capacitor/ios" >&2
    exit 1
fi

echo "📦 Installing Pods..."
if ! command -v pod &> /dev/null; then
    echo "error: CocoaPods not found" >&2
    exit 1
fi

# Clean Pods if needed
if [ "${CI}" = "TRUE" ] || [ "${CI}" = "true" ]; then
    rm -rf Pods Podfile.lock
    pod repo update || true
fi

pod install --repo-update || {
    echo "error: pod install failed" >&2
    exit 1
}

echo "✅ All dependencies installed successfully"

