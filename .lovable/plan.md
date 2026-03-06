

# Add Practice Teams Section to Event Detail Page

The "Practice Teams" (manual group assignment) feature currently only exists inside `TrainingSessionDetail`, which is rendered on the Training tab of a team page. The `EventDetail` page (`/events/:eventId`) has no reference to it at all.

## Plan

### 1. Add a Practice Teams card to `EventDetail.tsx`

Insert a new card section (after "Who's Coming" card, ~line 544) that:
- Only shows for **team events** where the current user `canEdit` (is admin/coach)
- Imports and uses `useTeamGeneration(eventId)`, `useTeamMembers(event.team_id)`, and `usePerformanceLevels(event.team_id)`
- Renders the existing `ManualTeamAssignment` component for manual mode
- Renders `GeneratedTeamCard` cards for view mode
- Includes the "Manual" / "Auto Generate" / "Regenerate" buttons (same pattern as `TrainingSessionDetail`)
- Includes the `GenerateTeamsDialog`

### 2. Files to change

| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` | Import `useTeamGeneration`, `useTeamMembers`, `usePerformanceLevels`, `ManualTeamAssignment`, `GeneratedTeamCard`, `GenerateTeamsDialog`. Add state for `manualMode`, `showGenerateDialog`, `saving`. Add the Practice Teams card section after "Who's Coming". |

No new files, no DB changes. All hooks and components already exist.

### 3. Visibility rules

- The entire section is visible to **all team members** (read-only view of generated groups)
- The "Manual" and "Generate" buttons only appear when `canEdit` is true
- Non-team events don't show this section at all (`event.team_id` must exist)

