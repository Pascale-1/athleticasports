

## Fix Deep Link Placeholders and Security Issues

### 1. Deep Link Configuration

**`public/.well-known/apple-app-site-association`**: Replace `TEAM_ID` with `KDZ4HYGYSX`.

**`public/.well-known/assetlinks.json`**: Replace `YOUR_SIGNING_KEY_FINGERPRINT` with `E1:82:82:FD:88:A9:BD:E6:46:EA:1A:94:36:46:9E:B9:A0:AF:B9:23:09:B8:51:81:1F:BC:6B:17:E8:41:3B:B4`.

### 2. Security Fixes (Database Migration)

**a. Profiles email exposure**: Drop the current open SELECT policy. Create two policies:
- One allowing users to see their own full profile (`auth.uid() = user_id`)
- One allowing authenticated users to see non-sensitive fields via a restricted view or by keeping the open policy but creating a secure view that excludes email. Simplest approach: restrict SELECT to authenticated users only (change from `public` to `authenticated` role) — email is still visible to logged-in users but not to anonymous requests.

**b. User roles public access**: Drop the open `SELECT true` policy. Replace with an authenticated-only policy so only logged-in users can query roles (needed for the `has_role` function to work).

**c. Player availability public access**: Alter the SELECT policy to target `authenticated` role instead of `public`.

**d. Event attendance public access**: Alter the SELECT policy to target `authenticated` role instead of `public`.

**e. Views without RLS**: Enable RLS on `user_feedback_view` and `team_messages_with_profiles`, add SELECT policies (admin-only for feedback view, team-member check for messages view).

### 3. Leaked Password Protection

Use the auth configuration tool to enable leaked password protection.

### Summary of Files Changed
- `public/.well-known/apple-app-site-association` — update Team ID
- `public/.well-known/assetlinks.json` — update SHA-256 fingerprint
- 1 database migration for all RLS fixes
- Auth config update for leaked password protection

