

# Implement: Friendly Private Team Message + Fix RLS Policies

## Overview
Two changes to ship together:
1. Replace the "Access Denied" wall for private teams with a friendly invite-only message
2. Fix the RLS policies that are blocking the "Join Team" button on public teams (missing `TO authenticated`)
3. Add the missing translation keys for both flows

## Changes

### 1. Database Migration -- Fix RLS policies
Drop and recreate the two public-team-join policies with `TO authenticated`:
- `"Users can join public teams"` on `team_members`
- `"Users can get member role on public team join"` on `team_member_roles`

Without this fix, the Join button will keep showing "Failed to join team" because the policies default to the anonymous role and don't apply to logged-in users.

### 2. `src/pages/TeamDetail.tsx` -- Friendly private team message
Replace the stark "Access Denied" block (lines 136-144) with a styled page matching the public team preview layout:
- Show the team header (name, avatar, sport)
- Display a friendly message: "This team is invite-only"
- Add a subtitle explaining they need an invite link from a team member
- Include a back button to /teams
- Import `Lock` icon from lucide-react for visual clarity

### 3. Translation keys -- `en/teams.json` and `fr/teams.json`
Add an `"access"` object with these keys:

| Key | English | French |
|-----|---------|--------|
| `access.denied` | "Invite Only" | "Sur invitation" |
| `access.notMember` | "You need an invite link from a team member to join this team." | "Vous avez besoin d'un lien d'invitation d'un membre pour rejoindre cette equipe." |
| `access.joinTeam` | "Join Team" | "Rejoindre l'equipe" |
| `access.publicTeamPreview` | "This team is open to everyone" | "Cette equipe est ouverte a tous" |

### Technical Details

**RLS fix SQL:**
```sql
DROP POLICY IF EXISTS "Users can join public teams" ON public.team_members;
CREATE POLICY "Users can join public teams"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'active'
    AND EXISTS (SELECT 1 FROM teams WHERE teams.id = team_id AND teams.is_private = false)
  );

DROP POLICY IF EXISTS "Users can get member role on public team join" ON public.team_member_roles;
CREATE POLICY "Users can get member role on public team join"
  ON public.team_member_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.id = team_member_id
      AND tm.user_id = auth.uid()
      AND t.is_private = false
    )
    AND role = 'member'
  );
```

**Private team UI update:** Replace the centered div with a full page layout using `PageHeader`, `TeamHeader` (showing team name/avatar even to non-members), and a card with Lock icon + invite-only messaging. The back button navigates to `/teams`.

