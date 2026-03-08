

## Fix: "Unknown" Users Everywhere

### Root Cause

The `useTeamMembers.ts` and `useEventAttendance.ts` hooks use PostgREST's embedded join syntax to fetch profile data:

```typescript
.select(`*, profiles_public:user_id (username, display_name, avatar_url)`)
```

This requires PostgREST to detect a foreign key relationship between `team_members.user_id` and `profiles_public.user_id`. However, `profiles_public` is a **view** (not a table), and there is no direct FK between these tables — they both independently reference `auth.users.id`. PostgREST cannot resolve this join, so it silently returns `null` for the profile data, triggering the `"Unknown"` / `"unknown"` fallback.

Other hooks (e.g. `useTeamGeneration`, `useActivityFeed`, `useAvailableGames`) already work correctly because they fetch profiles **separately** using `.in("user_id", userIds)`.

### Fix

**1. `src/hooks/useTeamMembers.ts`** — Remove the embedded join. Fetch team members first, then fetch profiles separately using `.in("user_id", userIds)` on `profiles_public`. Merge the data in JS.

**2. `src/hooks/useEventAttendance.ts`** — Same pattern: remove the embedded join, fetch attendees and profiles separately, then merge.

No database changes needed. This matches the pattern already used successfully in 5+ other hooks.

### Files Changed
- `src/hooks/useTeamMembers.ts`
- `src/hooks/useEventAttendance.ts`

