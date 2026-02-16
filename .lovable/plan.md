
# Remove Apple Sign-In

Simple cleanup: remove the Apple Sign-In button and all related code from the Auth page.

## Changes

### 1. `src/pages/Auth.tsx`
- Remove the `appleLoading` state variable (line 31)
- Remove the `handleAppleAuth` function (lines 244-263)
- Remove the Apple Sign-In button JSX (lines 312-325)
- Remove the `appleLoading` from the Google button's `disabled` check if present

### 2. No i18n changes needed
The Apple-related translation keys (`continueWithApple`, `appleSignInError`) can stay -- unused keys don't cause issues and keeping them avoids breaking anything if referenced elsewhere.

**Total**: 1 file changed, ~25 lines removed. No new code added.
