

# Improvements: Username Display & Email Privacy in Invite Search

## Issue 1: Usernames showing as "user_" prefix
The auto-generated usernames from `generate_random_username()` actually produce names like "SwiftTiger1234" — but anywhere a user hasn't set a `display_name`, the fallback shows the raw `username` field which may look generic. The real issue is likely that the `@{user.username}` display in search results and profiles creates noise. Modern apps (like Strava, TeamSnap, Heja) use **display names** as the primary identifier and hide technical usernames entirely, or use a simpler handle system.

**Suggestion**: Stop showing `@username` in search results and member lists. Show `display_name` as the primary label, and only fall back to username when display_name is null. For the invite dialog specifically, remove the `@{user.username}` subtitle line when a display_name exists.

## Issue 2: Emails visible in invite search — confirmed, should not be shown
Yes, confirmed: the search query in `InviteMemberDialog.tsx` line 66 includes `email.ilike.%...%`, meaning typing a partial email will match users. The `email` column is selected implicitly through the search but not displayed in the UI — however, the fact that you can **search by email** and find users is itself a privacy concern. Other apps typically let you invite by exact email (sending an email invitation) but don't let you **search/discover** users by partial email.

**Proposed changes:**

| File | Change |
|------|--------|
| `src/components/teams/InviteMemberDialog.tsx` | Remove `email.ilike.%...%` from the `.or()` search filter. Only search by `username` and `display_name`. Remove the `@{user.username}` subtitle when `display_name` exists — show username only as fallback. |

This is a one-file, two-line change:
1. Line 66: Remove `,email.ilike.%${sanitizedQuery}%` from the `.or()` clause
2. Lines 158-160: Only show `@{user.username}` subtitle when it differs from display_name or when display_name is null

No database changes needed.

