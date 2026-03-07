

## Fix Share Button Visibility & "Copied!" Label

### Issues Found

1. **Share section only visible to organizers**: In `EventDetail.tsx` line 833, `{canEdit && event.invite_code && (` restricts the entire share/invite section to event organizers only. All attendees should be able to share the event.

2. **Button says "Copied!" instead of "Copy"**: In `EventInviteLink.tsx` line 207, the translation key `t('common:actions.copied')` resolves to "Copied!" — should be `t('common:actions.copy')` which resolves to "Copy".

### Changes

| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` (line 833) | Change condition from `canEdit && event.invite_code` to just `event.invite_code` so all users see the share section. Keep the settings popover (regenerate code, toggle public join) gated behind `canEdit` inside `EventInviteLink`. |
| `src/components/events/EventInviteLink.tsx` (line 207) | Fix translation key from `t('common:actions.copied')` to `t('common:actions.copy')` |
| `src/components/events/EventInviteLink.tsx` | Accept new `isOrganizer` prop to conditionally show the Settings gear (regenerate code, toggle public join) only for organizers. Copy/Share buttons remain visible for everyone. |

