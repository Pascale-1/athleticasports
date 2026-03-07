

## Plan: Move Logout Button to Profile Page Header

### Change

Use the `PageHeader`'s `rightAction` prop to place the `LogoutButton` in the top-right corner of the profile page, next to the title.

### File

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Import `LogoutButton`, pass it as `rightAction` to `PageHeader` instead of `undefined` |

### Code Change

```tsx
// In Settings.tsx, line ~231-236
<PageHeader
  title={t("profile.title")}
  showBackButton
  backPath="/"
  rightAction={<LogoutButton variant="header" />}
/>
```

The `LogoutButton` with `variant="header"` already renders a compact ghost button with red text — fits naturally in the header corner. No other files need changes.

