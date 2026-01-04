#!/bin/bash

# Comprehensive Setup Script for Athletica App
# This script automates as much of the setup process as possible

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Athletica App - Automated Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm installed: $NPM_VERSION"

echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_info "Dependencies already installed, skipping..."
fi

echo ""

# Step 2: Check/Create .env file
echo "Step 2: Checking environment variables..."
if [ ! -f ".env" ]; then
    print_info ".env file not found"
    echo ""
    echo "You need to set up your Supabase credentials."
    echo "Get them from: https://supabase.com/dashboard"
    echo ""
    read -p "Do you want to set up .env now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run setup:env
    else
        print_info "Skipping .env setup. Run 'npm run setup:env' later."
    fi
else
    # Check if .env has valid values
    if grep -q "your_" .env 2>/dev/null || grep -q "VITE_SUPABASE_URL=$" .env 2>/dev/null; then
        print_error ".env file exists but has placeholder values"
        echo "Run 'npm run setup:env' to configure it properly"
    else
        print_success ".env file configured"
    fi
fi

echo ""

# Step 3: Verify privacy policy
echo "Step 3: Checking privacy policy..."
if [ -f "privacy.html" ]; then
    print_success "Privacy policy file exists (privacy.html)"
    print_info "To host it:"
    print_info "  - GitHub Pages: Push to GitHub and enable Pages"
    print_info "  - See PRIVACY_POLICY_HOSTING.md for details"
else
    print_error "privacy.html not found!"
fi

echo ""

# Step 4: Check iOS setup
echo "Step 4: Checking iOS configuration..."
if [ -d "ios/App/App/Assets.xcassets/AppIcon.appiconset" ]; then
    ICON_COUNT=$(find ios/App/App/Assets.xcassets/AppIcon.appiconset -name "*.png" | wc -l | tr -d ' ')
    if [ "$ICON_COUNT" -gt 0 ]; then
        print_success "iOS app icons found ($ICON_COUNT files)"
    else
        print_error "iOS app icons directory exists but no icons found"
    fi
else
    print_error "iOS app icons directory not found"
fi

echo ""

# Step 5: Run environment check
echo "Step 5: Verifying environment configuration..."
if npm run check:env 2>/dev/null; then
    print_success "Environment variables are configured"
else
    print_error "Environment variables need to be configured"
    print_info "Run: npm run setup:env"
fi

echo ""

# Step 6: Build check (optional)
echo "Step 6: Build verification..."
read -p "Do you want to verify the build? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npm run verify:build 2>/dev/null; then
        print_success "Build verification passed"
    else
        print_error "Build verification failed. Check the errors above."
    fi
fi

echo ""
echo "===================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. If .env is not configured: npm run setup:env"
echo "2. Start development: npm run dev"
echo "3. Build for production: npm run build"
echo "4. Sync to iOS: npm run sync:ios"
echo "5. Open in Xcode: npm run open:ios"
echo ""
print_info "For detailed guides, see:"
print_info "  - ENV_SETUP.md"
print_info "  - PRIVACY_POLICY_HOSTING.md"
print_info "  - BLOCKING_ISSUES_RESOLUTION_GUIDE.md"
echo ""

