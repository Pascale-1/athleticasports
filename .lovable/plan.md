

# Home Screen Redesign

## Files to modify

| File | Changes |
|------|-------|
| `src/pages/Index.tsx` | Full layout restructure: greeting section, stats grid, CTA row, team card, games feed |
| `src/i18n/locales/fr/common.json` | Add `home.greeting`, `home.greetingSubtitle`, `home.joinTeam` keys |

## Changes

### 1. Index.tsx — Greeting section (replace hero card)

Remove the current hero Card (lines 215-249) with avatar/welcome. Replace with a simple text-only greeting below the utility row:

```tsx
<div className="space-y-0.5">
  <h1 className="text-[22px] font-bold tracking-tight">
    Bonjour {profile.display_name || profile.username} 👋
  </h1>
  <p className="text-[14px] text-muted-foreground">
    {t('home.greetingSubtitle')}
  </p>
</div>
```

No avatar, no Card wrapper — clean typographic greeting.

### 2. Stats grid — keep as-is (already standalone 3-col, 28px bold)

Already matches spec. Numbers use `text-[28px] font-bold`, labels `text-xs text-muted-foreground`. No change needed.

### 3. CTA row — swap primary/secondary

Current: "Trouver un match" = primary (filled), "Créer un événement" = outlined.  
Spec: "Trouver un match" = outlined secondary, "Créer un événement" = filled primary.

- Swap variants: Find → `variant="outline" className="bg-card border-border"`, Create → `variant="default"`
- Add subtitles inside each button: small muted line below the label
- Both keep `h-[52px] flex-1 rounded-xl`, icon 20px left

```tsx
<div className="flex gap-2">
  <Button variant="outline" className="flex-1 h-[52px] rounded-xl bg-card ..." onClick={...}>
    <Search className="h-5 w-5 shrink-0" />
    <div className="text-left">
      <span className="text-sm font-medium">{t('home.findGame')}</span>
      <span className="text-[11px] text-muted-foreground block">{t('home.findGameSubtitle')}</span>
    </div>
  </Button>
  <Button variant="default" className="flex-1 h-[52px] rounded-xl ..." onClick={...}>
    <Plus className="h-5 w-5 shrink-0" />
    <div className="text-left">
      <span className="text-sm font-medium">{t('home.organizeEvent')}</span>
      <span className="text-[11px] text-primary-foreground/70 block">{t('home.organizeEventSubtitle')}</span>
    </div>
  </Button>
</div>
```

### 4. Team row — update label + height

Change label from `t('home.createTeam')` ("Équipe +") to `t('home.joinTeam')` ("Rejoindre une équipe"). Change height to `h-14` (56px). Keep existing card styling (rounded-xl, bg-card, border, icon left, chevron right).

### 5. "Matchs à rejoindre" section — redesign header

- Remove bg-success tint from the wrapping Card — use plain `Card className="p-3"`
- Section header: icon + "Matchs à rejoindre" + count Badge + right-aligned "Voir tout →"
- Use `text-[13px] font-semibold text-muted-foreground` for the section title (not green)
- Replace the green-tinted icon/text with standard muted styling

### 6. AvailableGameCard compact — add "Rejoindre" pill

Already shows a "Rejoindre" button via `showJoinBadge` prop with `bg-primary` fill. This matches the spec. The `ArrowRight` icon should be removed and replaced with just the text label. Change line 137 in AvailableGameCard:
```tsx
<Button size="sm" className="h-7 px-3 text-[11px]">{t('matching:actions.join')}</Button>
```

### 7. Hardcoded color cleanup in upcoming events

Lines 431-435: Replace `bg-amber-100 dark:bg-amber-900/50 text-amber-700` with `bg-warning/15 text-warning` and `bg-blue-100 dark:bg-blue-900/50 text-blue-700` with `bg-info/15 text-info`.

### 8. Translation keys

Add to `fr/common.json`:
```json
"home.greetingSubtitle": "Prêt·e pour ta prochaine session ?",
"home.joinTeam": "Rejoindre une équipe"
```

Add to `en/common.json`:
```json
"home.greetingSubtitle": "Ready for your next session?",
"home.joinTeam": "Join a team"
```

