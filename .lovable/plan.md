
# Fix Edit Event Alignment and Team Join Access

## Issue 1: Edit Event Dialog -- Inconsistent Alignment and Typography

**Problem**: The edit dialog mixes different styling approaches -- `Label` components for form fields, but raw `<p>` tags with ad-hoc classes for the visibility toggle. The ghost "Max Participants" button doesn't align with labeled fields. Overall, the spacing and font hierarchy feel inconsistent.

**Fix in `src/components/events/EditEventDialog.tsx`**:

- Standardize all form sections to use `space-y-1.5` (tighter label-to-input gap) instead of mixing `space-y-2` and `space-y-3`
- Use consistent `text-sm font-medium` (via `Label`) for all section headers
- In the visibility toggle, replace raw `<p className="text-sm font-medium">` with `Label` component for consistency
- Add consistent `space-y-4` between major form sections for breathing room
- Ensure the ghost "Max Participants" button has the same left padding as form labels so it aligns visually
- Add a thin separator before the actions row for visual closure

No functional changes -- purely alignment and typography consistency.

---

## Issue 2: Public Teams Show "Access Denied" When Non-Members Click

**Problem**: In `TeamDetail.tsx` (lines 103-111), when a non-member clicks on a public team from the Discover tab, they hit an unconditional "Access Denied" wall. This is because:
1. The RLS policy on `teams` correctly allows reading public teams
2. But `TeamDetail` checks `isMember` and blocks the entire page if false
3. There is no "Join" flow from the detail page

**Best Practice**: Public teams should show a preview page with team info and a "Join Team" button. Private teams should show "Access Denied". This matches how Discord, Slack, and sports apps handle it.

**Changes**:

### a. `src/pages/TeamDetail.tsx` -- Replace hard block with join preview
Instead of the blanket "Access Denied" for all non-members, split into two cases:

```text
if (!isMember && team.is_private) -> Show "Access Denied" (private team)
if (!isMember && !team.is_private) -> Show team preview with Join button
```

The preview shows:
- Team header (name, avatar, sport, description)
- Member count
- A prominent "Join Team" button

### b. `src/pages/TeamDetail.tsx` -- Add join handler
Add a `handleJoinTeam` function that:
1. Inserts the user into `team_members` with status "active"
2. Creates a `team_member_roles` entry with role "member"
3. Refreshes the page state so it transitions to the full team view

### c. RLS Policy Update -- Allow self-join for public teams
Currently, only team admins can INSERT into `team_members` (`can_manage_team` check). We need an additional INSERT policy:

```sql
CREATE POLICY "Users can join public teams"
  ON public.team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.is_private = false
    )
  );
```

Also need an INSERT policy on `team_member_roles` for self-assigning "member" role on public team join:

```sql
CREATE POLICY "Users can get member role on public team join"
  ON public.team_member_roles FOR INSERT
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

### d. Translation keys
Add to `en/teams.json` and `fr/teams.json`:
- `access.joinTeam`: "Join Team" / "Rejoindre"
- `access.publicTeamPreview`: "This team is open to everyone" / "Cette equipe est ouverte a tous"
- `toast.joinSuccess`: "You joined the team!" / "Vous avez rejoint l'equipe !"
- `toast.joinError`: "Failed to join team" / "Erreur lors de l'inscription"

## Summary of File Changes

| File | Changes |
|------|---------|
| `src/components/events/EditEventDialog.tsx` | Standardize typography, spacing, and label alignment across all form sections |
| `src/pages/TeamDetail.tsx` | Replace blanket "Access Denied" with public team preview + Join button |
| `src/hooks/useTeam.ts` | No changes needed (already fetches team data for public teams via RLS) |
| Database migration | Add INSERT policies on `team_members` and `team_member_roles` for public team joining |
| `src/i18n/locales/en/teams.json` | Add join-related translation keys |
| `src/i18n/locales/fr/teams.json` | Add join-related translation keys |
