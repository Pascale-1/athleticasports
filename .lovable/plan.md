

# Comprehensive Design Polish — Ink & Ice Final Pass

## 1. Bug Fix: Raw i18n Keys Rendering

The translation key `types.match` doesn't exist — the JSON uses `types.game` for match events. Two files call `t(`types.${event.type}`)` directly instead of mapping through `getEventTypeKey()`:

- **`src/components/events/SwipeableEventCard.tsx`** line 135 → use `getEventTypeKey`
- **`src/components/teams/EventsPreview.tsx`** line 89 → use `getEventTypeKey`

Both need to import `getEventTypeKey` from `@/lib/eventConfig` and change `t(`types.${event.type}`)` to `t(`types.${getEventTypeKey(event.type as EventType)}`)`.

## 2. EventCard.tsx — Type-Specific Left Border + Type Chip

Replace the uniform `TYPE_ACCENT` map with per-type colors:
- `match` → `border-l-[#38BDF8]` (sky blue)
- `training` → `border-l-[#CBD5E1]` (silver)
- `meetup` → `border-l-[#A78BFA]` (soft purple)

Add a **type chip** (Row 1, before status chip) with per-type styling:
- Match: `rgba(56,189,248,0.10)` bg, `#38BDF8` text, `⚽`
- Training: `rgba(203,213,225,0.10)` bg, `#CBD5E1` text, `🏃`
- Meetup: `rgba(167,139,250,0.10)` bg, `#A78BFA` text, `🤝`

Update **status chip** logic:
- Past → `bg-[#1A1E26]` text `#64748B`, label via `t('status.done')` / `t('status.past')`
- Upcoming → transparent, `border border-[#334155]`, text `#64748B`

Update **RSVP chip colors**:
- Attending → `rgba(52,211,153,0.12)` bg, `#34D399` text
- Not attending → `rgba(248,113,113,0.12)` bg, `#F87171` text

## 3. Remove Warning Color References

Replace all `bg-warning`, `text-warning`, `border-warning` references across ~10 files with sky blue or appropriate alternatives:

- **`EventPreviewCard.tsx`**: match type → `bg-primary/10 text-primary`
- **`EventRSVPBar.tsx`**: committed badge → `bg-primary/10 text-primary`
- **`NextEventCard.tsx`**: match color → `bg-primary/10 text-primary`
- **`SwipeableEventCard.tsx`**: maybe status → `bg-primary/10 text-primary`
- **`EventsPreview.tsx`**: match badge → `bg-primary/10 text-primary`
- **`InlineInvitationCards.tsx`**: invitation card → `border-primary/20 bg-primary/5`
- **`MatchProposalCard.tsx`**: warning box → `bg-destructive/10 border-destructive/20 text-destructive`
- **`NotificationItem.tsx`**: announcement/proposal → `bg-primary/10 text-primary`
- **`OnboardingHint.tsx`**: tip variant → `border-primary/30 bg-primary/5`
- **`PerformanceLevelBadge.tsx`**: beginner level → `bg-primary/20 text-primary`
- **`SessionAttendance.tsx`**: maybe badge → `bg-primary text-primary-foreground`
- **`ConflictWarning.tsx`**: warning → `bg-destructive/10 border-destructive/30`
- **`EventAttendees.tsx`**: committed badge → `bg-primary/20 text-primary`

## 4. CSS Token Updates

In `src/index.css`, update `--warning` to match primary (sky blue) since warning was previously gold:
```
--warning: 199 89% 60%;
```
Already done from previous pass — verify no warm remnants.

## 5. Home Screen Stats — Proper Labels

In `src/pages/Index.tsx` (lines 253-277), update stat labels to use 28sp bold numbers, 10sp uppercase tracking labels with vertical dividers between columns (matching the spec from profile stats).

## 6. EventsPreview.tsx — Type Color Fix

Update `getEventTypeColor` to use consistent sky blue scheme:
- Match → `bg-primary/10 text-primary border-primary/20`
- Training → existing primary is fine
- Meetup → keep success

## 7. Files to Edit (Summary)

| File | Changes |
|---|---|
| `src/components/events/EventCard.tsx` | Type chip, per-type borders, status chips, RSVP colors |
| `src/components/events/SwipeableEventCard.tsx` | Fix `getEventTypeKey` bug, remove warning colors |
| `src/components/teams/EventsPreview.tsx` | Fix `getEventTypeKey` bug, update type colors |
| `src/components/events/EventPreviewCard.tsx` | Replace warning with primary for match |
| `src/components/events/EventRSVPBar.tsx` | Replace warning with primary |
| `src/components/settings/NextEventCard.tsx` | Replace warning with primary |
| `src/components/teams/InlineInvitationCards.tsx` | Replace warning with primary |
| `src/components/matching/MatchProposalCard.tsx` | Replace warning with destructive |
| `src/components/notifications/NotificationItem.tsx` | Replace warning with primary |
| `src/components/onboarding/OnboardingHint.tsx` | Replace warning with primary |
| `src/components/teams/PerformanceLevelBadge.tsx` | Replace warning with primary |
| `src/components/teams/SessionAttendance.tsx` | Replace warning with primary |
| `src/components/events/ConflictWarning.tsx` | Replace warning with destructive |
| `src/components/events/EventAttendees.tsx` | Replace warning with primary |
| `src/pages/Index.tsx` | Stats layout with dividers and proper sizing |
| `src/pages/ConfirmDeletion.tsx` | Replace warning with destructive |

