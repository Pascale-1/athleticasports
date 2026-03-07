

## Hide Performance Levels from Regular Members

Currently, the performance levels page and related UI elements are visible to all team members. The change will restrict visibility to admins and coaches only.

### Changes

**1. `src/components/teams/PerformancePreview.tsx`**
- Wrap the component to return `null` if the user is not an admin or coach (use `canManage` or check role against `coach`)

**2. `src/pages/TeamPerformance.tsx`**
- Add access guard: if user is not admin/coach, redirect back to team detail page

**3. `src/components/teams/PerformanceLevelBadge.tsx` usage in member lists**
- Check if badges are shown in other contexts (e.g., team member lists, team generation) — hide them for non-admin/coach users where appropriate

**4. `src/hooks/useTeam.ts`**
- Already exposes `canManage` (admin check) and `userRole`. Need to also check for `coach` role since coaches should see levels too. Will add a `canViewPerformance` flag that's true for admin/owner/coach.

### Implementation Detail

The `canManage` flag covers admin/owner. For coaches, I'll check `userRole === 'coach'`. A new derived boolean `canViewPerformance = canManage || userRole === 'coach'` will be returned from `useTeam` and used to gate:
- The PerformancePreview card on the team detail page
- Access to the `/teams/:teamId/performance` route
- Any performance badges shown in member lists to non-privileged users

