

# Fix "Unknown team" for Private Team Invitations

## Root Cause

The `usePendingInvitations` hook (line 74) fetches team details separately:
```typescript
supabase.from("teams").select("id, name, sport, avatar_url").in("id", teamIds)
```

The `teams` table RLS policy only allows viewing private teams if you're a member:
```sql
USING ((NOT is_private) OR is_team_member(auth.uid(), id))
```

When a user has a pending invitation to a **private** team but hasn't joined yet, they're not a member, so RLS blocks the team SELECT. The code falls back to `"Unknown team"` on line 86.

## Solution

Add a SECURITY DEFINER database function that returns team details for teams where the user has a pending invitation. This bypasses team RLS safely since we only return data for teams with valid pending invitations.

### 1. Database migration — create helper function

```sql
CREATE OR REPLACE FUNCTION public.get_team_info_for_invitation(_team_id uuid, _user_id uuid)
RETURNS TABLE(id uuid, name text, sport text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.sport, t.avatar_url
  FROM public.teams t
  WHERE t.id = _team_id
    AND (
      NOT t.is_private
      OR is_team_member(_user_id, t.id)
      OR EXISTS (
        SELECT 1 FROM public.team_invitations ti
        WHERE ti.team_id = t.id
          AND ti.status = 'pending'
          AND ti.expires_at > now()
          AND (ti.invited_user_id = _user_id OR ti.email = (SELECT email FROM auth.users WHERE auth.users.id = _user_id))
      )
    );
$$;
```

### 2. Update `usePendingInvitations.ts`

Replace the direct teams query with individual RPC calls for each team, or simpler: just fetch teams one-by-one via the RPC function. Since invitation counts are small, this is fine.

Replace lines 73-76:
```typescript
// Fetch team details using security definer function
const teamDetails = await Promise.all(
  teamIds.map(tid =>
    supabase.rpc('get_team_info_for_invitation', { _team_id: tid, _user_id: user.id }).single()
  )
);
const teamsMap = new Map(
  teamDetails.filter(r => r.data).map(r => [r.data!.id, r.data!])
);

const invitersResult = await supabase
  .from("profiles").select("user_id, display_name, username").in("user_id", inviterIds);
const invitersMap = new Map((invitersResult.data || []).map(p => [p.user_id, p]));
```

## Files to Change

| File | Change |
|------|--------|
| Migration SQL | Add `get_team_info_for_invitation` function |
| `src/hooks/usePendingInvitations.ts` | Use RPC instead of direct teams query |

