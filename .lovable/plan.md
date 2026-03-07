

## Plan: Fix Profile Stats Accuracy

### Problem
The "Events" stat (27) counts **all** past events the user attended (matches, trainings, meetups). This is technically correct, but:
1. **French translation says "Matchs"** — misleading since it includes trainings and meetups too
2. The stat mixes all event types into one number, making it hard to understand
3. The label "Events" is vague — users expect something more meaningful

### Database Reality (for your account)
- 25 standalone events + 2 recurring children = 27 total
- Breakdown: matches, trainings, and meetups all lumped together
- The count itself is not inflated — you genuinely attended 27 past events

### Proposed Fix

**Rename "Events" → "Games"** and only count `type = 'match'` events. This makes the stat meaningful and matches the French "Matchs" label. The "This month" stat will also only count match-type events this month for consistency.

| File | Change |
|------|--------|
| `src/components/settings/ProfileStats.tsx` | Filter `eventsAttended` and `eventsThisMonth` queries to only count `type = 'match'` events |
| `src/i18n/locales/en/common.json` | Change `eventsLabel` from "Events" to "Games" |
| `src/i18n/locales/fr/common.json` | Keep "Matchs" (already correct after this change) |

### Query Changes

```typescript
// eventsAttended: add .eq('events.type', 'match')
supabase
  .from('event_attendance')
  .select('id, events!inner(start_time, type)', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'attending')
  .eq('events.type', 'match')
  .lt('events.start_time', new Date().toISOString())

// eventsThisMonth: same filter
supabase
  .from('event_attendance')
  .select('id, events!inner(start_time, type)', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'attending')
  .eq('events.type', 'match')
  .gte('events.start_time', monthStart)
  .lt('events.start_time', new Date().toISOString())
```

This makes all 4 stats coherent: Teams | Games | This Month (games) | Wins

