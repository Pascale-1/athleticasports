#!/bin/bash
set -e
export HOMEBREW_NO_INSTALL_CLEANUP=1
export PATH="/opt/homebrew/bin:$PATH"
cd "$CI_PRIMARY_REPOSITORY_PATH"
brew install node yarn cocoapods
yarn install --network-timeout 100000
cd ios/App
pod install
