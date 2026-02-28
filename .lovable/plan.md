

# Micro-Interactions & Feedback States

## Files to modify (7 files) + 1 new file

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add `rsvp-pop` keyframe (scale 1→1.05→1, 150ms) |
| `src/components/ui/button.tsx` | Add `active:opacity-90 active:scale-95` to base styles (already has `active:scale-95` on most variants) |
| `src/components/ui/card.tsx` | Add `active:scale-[0.99]` to `default` and `elevated` variants |
| `src/components/events/EventRSVPBar.tsx` | Add `animate-rsvp-pop` class on active RSVP button for scale feedback |
| `src/components/events/EventCardSkeleton.tsx` | **NEW** — skeleton matching EventCard shape (date block + 2 text lines + CTA placeholder) |
| `src/pages/Events.tsx` | Replace generic `Skeleton` blocks with `EventCardSkeleton`, update empty states with emoji + styled messages |
| `src/pages/Teams.tsx` | Replace `Loader2` spinner with `TeamCardSkeleton` list, update empty state messages |
| `src/pages/Index.tsx` | Update empty state for no events with emoji + CTA text |
| `src/components/events/CreateEventDialog.tsx` | Add success state after creation: sport emoji, "Événement créé ! 🎉", summary, two CTAs |
| `src/components/EmptyState.tsx` | Support optional emoji prop for centered emoji display |

---

## 1. tailwind.config.ts — Add rsvp-pop keyframe

Add to `keyframes`:
```typescript
"rsvp-pop": {
  "0%": { transform: "scale(1)" },
  "50%": { transform: "scale(1.05)" },
  "100%": { transform: "scale(1)" },
},
```
Add to `animation`:
```typescript
"rsvp-pop": "rsvp-pop 150ms ease-out",
```

## 2. button.tsx — Ensure active press state

The base cva string already has `active:scale-95` on most variants. Verify and add `active:opacity-90` to the base string (before variant definitions).

## 3. card.tsx — Tappable press feedback

Add `active:scale-[0.99]` to `default` and `interactive` variant strings so all cards feel tappable.

## 4. EventRSVPBar.tsx — RSVP tap animation

When a button is active (matches `userStatus`), apply `animate-rsvp-pop` class. This gives the brief scale-up on selection.

## 5. EventCardSkeleton.tsx — NEW component

Matches EventCard layout:
```tsx
<Card className="border-l-[5px] border-l-muted overflow-hidden">
  <div className="flex gap-0 p-0">
    {/* Date block placeholder */}
    <div className="flex flex-col items-center justify-center px-3 py-3 shrink-0">
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <div className="w-px bg-border shrink-0" />
    {/* Content */}
    <div className="flex-1 px-3 py-2.5 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  </div>
</Card>
```

## 6. Events.tsx — Skeleton + empty states

Replace 3× `<Skeleton className="h-28 w-full rounded-xl" />` blocks (lines 310-312, 335-337, 367-369) with `<EventCardSkeleton />` components.

Empty state messages (already using EmptyState component — keep as-is, the translations handle text).

## 7. Teams.tsx — Loading skeleton

Replace the `Loader2` spinner (lines 151-157) with a list of `TeamCardSkeleton` components:
```tsx
if (loading) {
  return (
    <PageContainer>
      <div className="space-y-6 pt-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-3">
          {[1,2,3].map(i => <TeamCardSkeleton key={i} />)}
        </div>
      </div>
    </PageContainer>
  );
}
```

## 8. CreateEventDialog.tsx — Success screen

After `onSubmit` succeeds, show a success state instead of immediately closing:
- Full dialog content replaced with centered layout
- Sport emoji large (48px)
- "Événement créé ! 🎉" in 24px bold
- "Voir l'événement" primary CTA → navigates to event
- "Créer un autre" ghost CTA → resets form

This requires storing the created event ID from the `createEvent` return. Currently `createEvent` returns `boolean`. The success screen will show for 2 seconds or until user taps a CTA.

**Simplified approach**: Show success state with auto-close after animation, without needing event ID:
```tsx
const [showSuccess, setShowSuccess] = useState(false);

// After successful submit:
setShowSuccess(true);
setTimeout(() => { onOpenChange(false); setShowSuccess(false); }, 2500);
```

Success UI:
```tsx
{showSuccess && (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-scale-in">
    <span className="text-5xl mb-4">⚽</span>
    <h2 className="text-[24px] font-bold mb-2">Événement créé ! 🎉</h2>
    <p className="text-sm text-muted-foreground mb-6">Ton événement est prêt</p>
    <Button variant="ghost" onClick={() => { setShowSuccess(false); onOpenChange(false); }}>
      Fermer
    </Button>
  </div>
)}
```

## 9. EmptyState.tsx — Add emoji support

Add optional `emoji` prop. When provided, show it above the icon:
```tsx
{emoji && <span className="text-4xl mb-2">{emoji}</span>}
```

## Summary

| Feature | Implementation |
|---------|---------------|
| Skeleton loaders | New `EventCardSkeleton`, reuse `TeamCardSkeleton`, replace spinners |
| RSVP feedback | `animate-rsvp-pop` keyframe on active button |
| Button press | `active:opacity-90 active:scale-95` globally |
| Card press | `active:scale-[0.99]` on default card variant |
| Form transitions | Already implemented via framer-motion `slideVariants` in UnifiedEventForm |
| Success screen | Post-creation celebration in CreateEventDialog |
| Empty states | Emoji + styled messages via EmptyState component |

