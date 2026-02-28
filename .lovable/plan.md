

# Fix: Stats Not Reflecting User's Actual Events

## Problem

The home screen stats are computed incorrectly:

1. **"Parties" (upcomingMatches)** — queries ALL upcoming match events globally (`events` table where `type=match`), not filtered to events the user is attending
2. **"Événements" (eventsAttended)** — counts ALL attendance records (past + future) with `status=attending`, not just upcoming events

## Fix (1 file: `src/pages/Index.tsx`)

Replace the `fetchStats` function's three queries:

### Current (broken)
```typescript
// Matches: counts ALL upcoming matches globally
supabase.from('events').select('*', { count: 'exact', head: true })
  .eq('type', 'match').gte('start_time', new Date().toISOString())

// Events attended: counts ALL attendance records (past+future)
supabase.from('event_attendance').select('*', { count: 'exact', head: true })
  .eq('user_id', userId).eq('status', 'attending')
```

### Fixed
```typescript
// Matches: count upcoming matches where THIS USER is attending
supabase.from('event_attendance').select('event_id, events!inner(type, start_time)', { count: 'exact', head: true })
  .eq('user_id', userId).eq('status', 'attending')
  .eq('events.type', 'match').gte('events.start_time', new Date().toISOString())

// Events attended: count UPCOMING events where user is attending (not past)
supabase.from('event_attendance').select('event_id, events!inner(start_time)', { count: 'exact', head: true })
  .eq('user_id', userId).eq('status', 'attending')
  .gte('events.start_time', new Date().toISOString())
```

This ensures both stats reflect only the user's own upcoming events, matching what `useUserEvents` returns.

