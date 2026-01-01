# Xcode Cloud CI Scripts

This directory contains CI scripts for Xcode Cloud:

- `ci_post_clone.sh` - Runs after repository is cloned, installs npm dependencies and CocoaPods
- `ci_pre_xcodebuild.sh` - Runs before Xcode build, builds web app and syncs Capacitor

These scripts must be at the repository root in the `ci_scripts/` directory for Xcode Cloud to find them.
