
# Fix "Modernized Form Not Visible" — Root Causes & Fixes

## Diagnosis

The modernized form code is fully written and correct. The problem is **not** a missing feature — it's three concrete bugs that prevent the form from rendering cleanly:

### Bug 1 — Stale module cache (primary issue)
The runtime error `Failed to fetch dynamically imported module: .../Index.tsx?t=1771458270323` means the browser is holding a stale reference to an old build chunk. When `Index.tsx` fails to lazy-load, the whole app tree stalls and the user sees the old cached UI. Fix: force a clean build by touching `UnifiedEventForm.tsx` with a meaningful change (fixing Bug 2 also achieves this).

### Bug 2 — `isPickupGame` used before declaration (hoisting bug)
In `handleSubmit` (line 319), the code references `isPickupGame`:
```ts
is_public: isPickupGame ? true : ...
```
But `isPickupGame` is declared on line 342 — **after** the function that uses it. While `const` declarations are technically in scope due to hoisting within the component body, they are in the temporal dead zone during `handleSubmit` execution IF the value was computed from stale state. The safe fix: move the derived flag declarations **before** `handleSubmit`, not after.

### Bug 3 — Uncontrolled → Controlled Select warning
The sport `Select` uses `value={selectedSport || '__none__'}`. When `selectedSport` starts as `''` (empty string), it initializes as uncontrolled, then switches to `'__none__'` (controlled). This triggers the React warning seen in the console and can cause the select to not display its value correctly. Fix: initialize `selectedSport` with `'__none__'` or handle the empty case properly with a dedicated `undefined` sentinel.

### Bug 4 — DialogContent accessibility warning
`CreateEventDialog` is missing `aria-describedby={undefined}` on `DialogContent`. This causes a console warning that may suppress renders in strict mode. Fix: add `aria-describedby={undefined}` to the `DialogContent`.

---

## What the Fixed Form Will Look Like

The modernized form is already fully implemented. Once the cache is busted by the fixes, the user will see:

```text
┌─────────────────────────────────────┐
│ [Training] [Game] [Social]          │  ← Underline tabs
├─────────────────────────────────────┤
│ ✏️  Nom de la séance...             │  ← Ghost input, text-base font-medium
│ 📝  Description (optionnel)...      │  ← Ghost textarea
├── section divider ──────────────────┤
│ 🏃  Quel sport ? ▾                  │  ← Dropdown
│ 👥  Mon équipe ▾                    │  ← Ghost select
│ ⚔️  [Nom adversaire] / [App team]   │  ← MATCH ONLY, main body
│     [Dom] [Ext] [Neutre]            │  ← Home/away pills
├── section divider ──────────────────┤
│ 📅  Sam, 8 Mar · 19:00 · 1h30      │  ← Collapsed date row
│ 📍  Adresse ou lieu...              │  ← Ghost address
│ 🌐  Public ─────────── ●           │  ← Visibility toggle
│ €   Gratuit ─────────── ○          │  ← Cost toggle
├─────────────────────────────────────┤
│ ⌄  Plus d'options                   │
│ [      Créer la séance      ]       │  ← Full-width h-11
└─────────────────────────────────────┘
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/events/UnifiedEventForm.tsx` | Move derived flag declarations before `handleSubmit`; fix sport `Select` controlled/uncontrolled bug (use `value={selectedSport || undefined}` and handle empty state); this also forces a clean module rebuild |
| `src/components/events/CreateEventDialog.tsx` | Add `aria-describedby={undefined}` to `DialogContent` to suppress accessibility warning |

No database changes. No new dependencies. No translation changes.
