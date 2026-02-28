

# Fix 10 Issues Across Athletica App

## Files to modify

| # | Issue | File(s) |
|---|-------|---------|
| 1 | Raw i18n key "types.match" in badge | `src/components/events/EventCard.tsx` — no code change needed, translation works. Investigate `EventTypeSelector` and any other badge usage |
| 2 | Markdown in announcements | `src/components/teams/AnnouncementCard.tsx` |
| 3 | System announcement author | `src/components/teams/AnnouncementCard.tsx` |
| 4 | Duplicate attendance count | `src/components/events/EventRSVPBar.tsx` |
| 5 | Simplify RSVP bar (toggle, remove cancel) | `src/components/events/EventRSVPBar.tsx` — already a toggle, just remove cancel button |
| 6 | FAB overlapping last item | `src/pages/Teams.tsx`, `src/pages/Events.tsx` |
| 7 | Team sport category headers | `src/components/teams/TeamCard.tsx` — sport ribbon font size |
| 8 | Empty/placeholder About text | `src/components/teams/TeamAboutSection.tsx`, `src/pages/EventDetail.tsx` |
| 9 | Performance level labels | `src/components/teams/PerformanceLevelBadge.tsx`, `src/components/teams/PerformanceLevelsTab.tsx` |
| 10 | Event detail vertical spacing | `src/pages/EventDetail.tsx` |

---

## 1. Fix raw i18n key in event type badge

The translation files have `types.game: "Match"` (FR) and `types.game: "Game"` (EN). The code uses `getEventTypeKey()` which maps `match` → `game`. This should work. Need to check if `t()` is being called without the namespace. In `EventDetail.tsx` line 311: `t(\`types.${getEventTypeKey(event.type)}\`)` — this uses the `events` namespace, which has `types.game`. This is correct.

**Action**: Check if the issue is in a specific component. The `EventCard.tsx` also uses `t('rsvp.going')` etc. The type badge in EventCard doesn't exist as a separate badge — it uses the left accent bar. The issue may be in the `EventTypeSelector` or another place. Will search for raw `types.match` rendering and verify the translation loading is correct. If translations just haven't loaded yet, add a fallback.

**Fix**: In `EventDetail.tsx` line 311, add fallback: `t(\`types.${getEventTypeKey(event.type)}\`, event.type)` — this ensures if the key isn't found, the raw type name shows instead of the key path.

## 2. Render markdown in announcements

In `AnnouncementCard.tsx` line 43, the content is rendered as plain text. Replace with a simple markdown renderer that handles `**bold**` and `_italic_` patterns using regex replacement to `<strong>` and `<em>` tags.

**Implementation**: Create a small inline function or component that parses basic markdown (bold, italic) and renders via `dangerouslySetInnerHTML` or React elements. No external dependency needed for just bold/italic.

```tsx
const renderSimpleMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
};

// In JSX:
<p className="text-xs sm:text-sm whitespace-pre-wrap break-words"
   dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(announcement.content) }} />
```

## 3. Fix system announcement author

In `AnnouncementCard.tsx`, detect if the username starts with `user_` (UUID-style). If so, show "Athletica" as display name with a bot icon instead of the raw username.

```tsx
const isSystemUser = announcement.profile?.username?.startsWith('user_');
const displayName = isSystemUser ? 'Athletica' : `@${announcement.profile?.username}`;
// For avatar, show a Bot icon instead of initials
```

## 4. Remove duplicate attendance count

In `EventRSVPBar.tsx` lines 140-142, remove the `<p>` element that shows `t('rsvp.stats', ...)`. This duplicates what's already in the `EventAttendees` component inside the "Who's Coming" card.

Also remove the same stats line from the committed state (line 60-62) and deadline-passed state (line 76-78).

## 5. Simplify RSVP bar — remove cancel button

The RSVP buttons already toggle (line 32-37 in `EventRSVPBar.tsx` — clicking same status calls `onRemoveAttendance`). Simply remove the "Cancel my attendance" button block (lines 87-96).

## 6. Fix FAB overlapping last list item

Add `pb-24` to the content wrapper in both screens to ensure the last item isn't hidden behind the FAB.

- `src/pages/Events.tsx`: Add `pb-24` to the main content area
- `src/pages/Teams.tsx`: Add `pb-24` to the `PullToRefresh` or its inner `motion.div`

## 7. Improve team sport category headers

In `TeamCard.tsx` lines 33-38, the sport ribbon uses `text-caption font-medium`. Change to `text-sm font-semibold uppercase tracking-wider` to make it a proper section header.

## 8. Replace empty/placeholder About text

In `TeamAboutSection.tsx`, when description is null/empty or looks like test data (e.g. "test", "asdf"), show a styled placeholder: "Ajouter une description pour présenter ton équipe 💬".

In `EventDetail.tsx`, the description card already only renders if `event.description` exists (line 540). No change needed there.

```tsx
// TeamAboutSection.tsx
const isPlaceholder = !description || description.trim().length < 5 || /^(test|asdf|xxx)/i.test(description.trim());
if (isPlaceholder) {
  return (
    <Card>
      <CardContent className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Ajouter une description pour présenter ton équipe 💬</p>
      </CardContent>
    </Card>
  );
}
```

## 9. Rename Performance Levels to skill labels

In `PerformanceLevelBadge.tsx`, replace "Level 1/2/3/4" with:
- 1 → "Débutante"
- 2 → "Intermédiaire"  
- 3 → "Avancée"
- 4 → "Experte"

In `PerformanceLevelsTab.tsx`, update `statsCards` labels and the Select filter items to match.

## 10. Reduce vertical spacing on event detail

In `EventDetail.tsx` line 258, the main container uses `space-y-5`. Reduce to `space-y-4` (16px). Also reduce `mb-4` on the title (line 325) to `mb-2`, and `mb-4` on the badges row (line 304) is fine since it uses `mb-3`.

---

## Summary

| # | Fix | Complexity |
|---|-----|-----------|
| 1 | Add fallback to `t()` call for event type badge | Trivial |
| 2 | Parse basic markdown in announcement content | Small |
| 3 | Detect system user, show "Athletica" + bot icon | Small |
| 4 | Remove duplicate stats `<p>` from RSVP bar | Trivial |
| 5 | Remove cancel button from RSVP bar | Trivial |
| 6 | Add `pb-24` to Events + Teams page content | Trivial |
| 7 | Increase sport ribbon font size/weight | Trivial |
| 8 | Show placeholder for empty/test descriptions | Small |
| 9 | Rename level labels to French skill names | Small |
| 10 | Reduce spacing from `space-y-5` to `space-y-4`, reduce title margin | Trivial |

