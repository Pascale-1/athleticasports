#!/bin/sh

# Xcode Cloud Post-Clone Script
# Runs after repository is cloned, before pre-build

set -e

echo "🔧 Running post-clone script..."

# Ensure we're in the right directory
echo "📁 Working directory: $(pwd)"

# Install CocoaPods if not available
if ! command -v pod &> /dev/null; then
  echo "📦 Installing CocoaPods..."
  gem install cocoapods
fi

echo "✅ Post-clone script completed"
