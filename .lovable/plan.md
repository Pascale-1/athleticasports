

## Performance Optimization Opportunities

The app is already well-structured with lazy-loaded routes, code splitting via `manualChunks`, a centralized realtime manager with ref-counting, and sensible React Query caching. Here are the remaining optimizations worth implementing:

### 1. BottomNavigation: Excessive DB queries on every route change

The `BottomNavigation` component makes **4 sequential database queries** (`getUser`, `profiles`, `team_invitations`, `team_members` + `events` + `event_attendance`) every time `location.pathname` changes. This is the most impactful issue.

**Fix**: Debounce `fetchBadges` and cache `userId`/`profile` so they aren't re-fetched on every navigation. Also move badge counts into React Query so they benefit from `staleTime` caching.

### 2. BottomNavigation: Activity listeners call `getSession()` on every interaction

In `client.ts`, every `mousedown`, `keydown`, `touchstart`, and `scroll` event triggers `supabase.auth.getSession()`. Combined with the BottomNavigation re-fetching on each nav, this creates unnecessary auth calls.

**Fix**: Throttle the activity listener in `client.ts` to fire at most once per minute instead of on every interaction.

### 3. Redundant `supabase.auth.getUser()` calls

Multiple components independently call `supabase.auth.getUser()` — BottomNavigation, NotificationContext, ProtectedRoute, activity feed hooks, etc. Each is a separate network request.

**Fix**: Use a lightweight auth context or shared ref that caches the current user from `onAuthStateChange`, so components read from memory instead of making API calls.

### 4. Icon bundle size (lucide-react: 148KB)

`lucide-react` is the largest JS resource at 148KB. The app imports individual icons throughout, but the full bundle is being loaded in dev. In production this is handled by tree-shaking, so this is **low priority** — the production build with `manualChunks` already handles this well.

---

### Summary of changes

| File | Change |
|------|--------|
| `src/integrations/supabase/client.ts` | Throttle activity event listener to once per 60s instead of every event |
| `src/components/mobile/BottomNavigation.tsx` | Use React Query for badge counts with `staleTime`, remove direct `getUser` call in favor of shared auth state, debounce fetch |
| `src/hooks/useAuth.ts` (new) | Create a small hook that subscribes to `onAuthStateChange` and provides cached `user` object, eliminating redundant `getUser()` calls across the app |

### Estimated impact
- Reduces database round-trips by ~60-70% during normal navigation
- Eliminates hundreds of unnecessary `getSession()` calls during scrolling/typing
- No user-facing behavior changes

