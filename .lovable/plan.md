

## Plan: Fix Events Badge + Event Type Education

### 1. Fix persistent "1" badge on Events tab

**File:** `src/components/mobile/BottomNavigation.tsx`

Add `.neq('created_by', userId)` to the events query in `fetchBadgeCounts` (around line 46). This excludes events the user created from the unanswered RSVP count, fixing the persistent badge caused by recurring child events where the auto-attendance trigger skips children.

### 2. Add event type descriptions in EventTypeSelector

**File:** `src/components/events/EventTypeSelector.tsx`

Add a subtle animated description line below the type selector that shows the description for the currently selected type. Reuse existing translation keys: `create.trainingDesc`, `create.gameDesc`, `create.meetupDesc`.

### 3. Add event types step to the walkthrough

The current walkthrough has 5 steps (profile, quick actions, games, feed, navigation). Add a new step between "quick actions" and "games" that introduces the 3 event types (Training, Game, Social) with a brief explanation.

**Files:**
- `src/i18n/locales/en/walkthrough.json` -- Add `steps.eventTypes` with title and description
- `src/i18n/locales/fr/walkthrough.json` -- French equivalent
- `src/hooks/useAppWalkthrough.ts` -- Add the new step targeting the event type selector or a dedicated element

### 4. Make walkthrough mandatory (non-dismissible)

**File:** `src/hooks/useAppWalkthrough.ts`

Set `allowClose: false` in the driver.js config so users must complete all steps. The walkthrough already only triggers once after onboarding via the `setTrigger`/`shouldTrigger` mechanism, so this just prevents skipping it.

---

### Summary

| File | Change |
|------|--------|
| `src/components/mobile/BottomNavigation.tsx` | Exclude user's own events from unanswered RSVP count |
| `src/components/events/EventTypeSelector.tsx` | Show description text below selector for selected type |
| `src/i18n/locales/en/walkthrough.json` | Add `eventTypes` step |
| `src/i18n/locales/fr/walkthrough.json` | Add French `eventTypes` step |
| `src/hooks/useAppWalkthrough.ts` | Add event types step, set `allowClose: false` |

