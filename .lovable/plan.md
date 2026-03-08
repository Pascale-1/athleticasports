

## Fix Three Team-Related Bugs

### Bug 1: Private team creation RLS error

**Root cause**: When `createTeam` calls `.insert().select('id').single()`, PostgREST uses the `RETURNING` clause which evaluates **before** the `handle_new_team_owner` AFTER trigger fires. The SELECT policy on `teams` is `((NOT is_private) OR is_team_member(auth.uid(), id))`. For private teams, `is_private=true` and the membership doesn't exist yet, so the policy denies the return.

**Fix**: Update the SELECT policy to also allow the creator to see their own team:
```sql
DROP POLICY "Teams are viewable based on privacy" ON public.teams;
CREATE POLICY "Teams are viewable based on privacy" ON public.teams
  FOR SELECT USING (
    (NOT is_private) OR is_team_member(auth.uid(), id) OR (created_by = auth.uid())
  );
```

### Bug 2: No navigation after accepting invitation inline

**Root cause**: In `InlineInvitationCards.tsx`, after `handleAccept` succeeds, it calls `onRefresh()` but never navigates to the team page. The edge function returns `teamId` in the response but it's ignored.

**Fix**: Add `useNavigate` to `InlineInvitationCards` and navigate to `/teams/${data.teamId}` after successful acceptance.

### Bug 3: `Cannot read properties of null (reading 'avatar_url')` in TeamMemberCard

**Root cause**: `useTeamMembers` joins `profiles_public:user_id`, but if a profile row doesn't exist yet for a member, the join returns `null`. `TeamMemberCard` then accesses `member.profile.avatar_url` without null checking.

**Fix**:
1. In `useTeamMembers.ts`, filter out members with null profiles or provide a fallback profile object
2. In `TeamMemberCard.tsx`, add optional chaining on `member.profile`

### Changes

1. **Database migration** — Update teams SELECT policy to include `created_by = auth.uid()`
2. **`src/components/teams/InlineInvitationCards.tsx`** — Add `useNavigate`, navigate to team page after accepting
3. **`src/hooks/useTeamMembers.ts`** — Provide fallback profile when `profiles_public` join returns null
4. **`src/components/teams/TeamMemberCard.tsx`** — Add optional chaining on `member.profile`

