

## Apply: Restrict Practice Teams to Training Events Only

Two small edits in `src/pages/EventDetail.tsx`:

1. **Line 112** — Only load team generation for training events:
   - Change `event?.team_id ? eventId || null : null` to `event?.team_id && event?.type === 'training' ? eventId || null : null`

2. **Line 672** — Only render Practice Teams section for training events:
   - Change `event.team_id && isTeamMember &&` to `event.team_id && isTeamMember && event.type === 'training' &&`

Match results are already correctly guarded to `event.type === 'match'` — no change needed there.

