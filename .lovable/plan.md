

# Make Max Participants Required (Default: 10) + Always Show Attendee Count

## Combined Plan (merges previous plan)

### 1. `src/components/events/UnifiedEventForm.tsx` — 3 line changes

**Line 78 — Schema:** Make field required
```tsx
// FROM
maxParticipants: z.string().optional(),
// TO
maxParticipants: z.string().min(1, "Required"),
```

**Line 252 — Default value:** Pre-fill with 10
```tsx
// FROM
maxParticipants: '',
// TO
maxParticipants: '10',
```

**Line 443 — Submission mapping:** Always parse (no fallback to undefined)
```tsx
// FROM
max_participants: values.maxParticipants ? parseInt(values.maxParticipants, 10) : undefined,
// TO
max_participants: parseInt(values.maxParticipants, 10),
```

### 2. `src/components/events/EventCard.tsx` — already applied
The attendee count condition was already changed from `attendeeCount > 0 || event.max_participants` to `attendeeCount >= 0` in the last edit. No further change needed.

### Summary
- Every new event will have `max_participants` set (default 10, user can change)
- Every event card always shows the attendee count
- Existing events without `max_participants` still render fine (they just show `👥 N` without `/ max`)

