

## Unified App Walkthrough — All Sections in One Flow

### Current Behavior
Each page (Home, Events, Teams, Profile) independently starts its own walkthrough when visited for the first time. The user must manually navigate to each section to see its walkthrough.

### Proposed Behavior
After onboarding, a single continuous walkthrough runs across all four sections automatically. The flow:
1. Home walkthrough starts → user taps through steps
2. On completion, automatically navigates to Events → walkthrough starts
3. On completion, navigates to Teams → walkthrough starts
4. On completion, navigates to Profile → walkthrough starts
5. Done — all sections marked complete

### Changes

**`src/hooks/useAppWalkthrough.ts`**
- Add a new `startFullWalkthrough()` function that accepts a `navigate` function (from react-router)
- This function runs the Home walkthrough, and on `onDestroyed`, navigates to `/events` and starts the Events walkthrough, and so on through Teams (`/teams`) → Profile (`/settings`)
- Each page's completion is still tracked in localStorage so it won't re-trigger
- Add a new localStorage key `athletica_full_walkthrough_active` to track that a full walkthrough is in progress

**`src/pages/Index.tsx`**
- When `shouldTrigger()` is true (post-onboarding), call `startFullWalkthrough(navigate)` instead of just `startWalkthrough('home')`

**`src/pages/Events.tsx`, `src/pages/Teams.tsx`, `src/pages/Settings.tsx`**
- When these pages detect that a full walkthrough is active (check localStorage flag), they auto-start their walkthrough after a brief delay for DOM elements to render
- Remove the independent "first visit" walkthrough triggers since the full walkthrough handles them
- If a user visits these pages later without the full walkthrough flag and hasn't completed that page's walkthrough, still run it independently as a fallback

**`src/components/settings/ProfileTabs.tsx`**
- "Restart Walkthrough" button will trigger the full walkthrough flow (navigate to home, set trigger)

### Flow Detail
```text
Onboarding Complete
  → navigate to /
  → Home walkthrough (5 steps)
  → onDestroyed → navigate('/events')
  → Events walkthrough (5 steps)
  → onDestroyed → navigate('/teams')
  → Teams walkthrough (4 steps)
  → onDestroyed → navigate('/settings')
  → Profile walkthrough (4 steps)
  → onDestroyed → clear full walkthrough flag
```

### Files Changed
- `src/hooks/useAppWalkthrough.ts` — add `startFullWalkthrough` with chained navigation
- `src/pages/Index.tsx` — use full walkthrough on trigger
- `src/pages/Events.tsx` — auto-start when full walkthrough active
- `src/pages/Teams.tsx` — auto-start when full walkthrough active
- `src/pages/Settings.tsx` — auto-start when full walkthrough active
- `src/components/settings/ProfileTabs.tsx` — restart triggers full flow

