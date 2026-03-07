

# Payment Tracking for Paid Events (Self-Declaration)

Since there's no embedded payment system, attendees will self-declare "I paid" and organizers can see who has/hasn't paid at a glance.

## Approach

### Database
Add a `has_paid` boolean column (default `false`) to `event_attendance`. Attendees toggle it themselves.

```sql
ALTER TABLE public.event_attendance ADD COLUMN has_paid boolean DEFAULT false;
```

### UI Changes

**1. Event Detail Page (`src/pages/EventDetail.tsx`)**
- For paid events, show a "Mark as Paid" button near the RSVP bar (or inline) when the user is attending but hasn't paid yet.
- Once toggled, show a green "Paid ✓" badge instead.

**2. Attendee List (`src/components/events/EventAttendees.tsx`)**
- For paid events, show a `💰` or `✓ Paid` badge next to each attendee who has `has_paid = true`.
- Show "Not paid" in muted text for those who haven't, visible to the organizer.

**3. Attendance Hook (`src/hooks/useEventAttendance.ts`)**
- Add `has_paid` to the `EventAttendee` interface.
- Add a `markAsPaid()` function that updates `has_paid = true` for the current user.
- Track paid count in stats for the organizer summary (e.g. "3/5 paid").

**4. Event Card (`src/components/events/EventCard.tsx`)**
- No change needed — already shows cost/free indicator.

### Flow
1. Attendee RSVPs "Going" on a paid event.
2. They see a "Mark as Paid" button (e.g. after cash/Lydia transfer).
3. They tap it → `has_paid` is set to `true`.
4. Organizer sees paid/unpaid status per attendee in the attendee list.
5. A summary line like "3/5 paid" appears in the organizer view.

### Files to Change

| File | Change |
|------|--------|
| Migration | Add `has_paid` boolean to `event_attendance` |
| `src/hooks/useEventAttendance.ts` | Add `has_paid` to interface, add `markAsPaid()`, track paid count |
| `src/components/events/EventAttendees.tsx` | Show paid/unpaid badge per attendee |
| `src/pages/EventDetail.tsx` | Add "Mark as Paid" button for attending users on paid events |

