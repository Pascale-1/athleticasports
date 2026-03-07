

## Ensure All Links Open Native Apps on Mobile

### Current Issues

| Link Type | Current Behavior | Problem |
|-----------|-----------------|---------|
| **WhatsApp share** | Opens `https://wa.me/...` via Capacitor Browser | Opens in-app browser instead of WhatsApp app |
| **SMS share** | `window.location.href = sms:...` | Works correctly on native — no change needed |
| **Maps (providers)** | Opens Google/OSM/Waze web URLs via Capacitor Browser | Opens in-app browser instead of native map apps |
| **Maps (native)** | `window.location.href = maps://` or `geo:` | Works correctly — opens native maps app |
| **Calendar (Google/Outlook)** | Opens web URLs via Capacitor Browser | Opens in-app browser; should open native calendar apps |
| **Calendar (ICS download)** | Creates blob + anchor click | May silently fail on native; should use Share plugin |
| **Payment link** | Opens arbitrary URL via Capacitor Browser | In-app browser is acceptable here — no change needed |
| **Venue link** | Opens arbitrary URL via Capacitor Browser | In-app browser is acceptable here — no change needed |

### Plan

#### 1. Update `useExternalLink.ts` — Add native intent support

Add a new helper that detects URLs with known app schemes and uses `window.location.href` (which triggers native intent resolution) instead of Capacitor Browser for these domains:
- `wa.me` / `api.whatsapp.com` → `whatsapp://send?text=...`
- `calendar.google.com` → Keep as-is (no reliable native scheme), but consider alternative
- `waze.com` → `waze://?q=...`
- `google.com/maps` → `google.navigation:q=...` (Android) / `comgooglemaps://?q=...` (iOS)

#### 2. Update `AddToCalendarButton.tsx` — Use native calendar intents on mobile

On native platforms, instead of opening Google/Outlook web URLs:
- **Primary option**: Use ICS download for all calendar providers (it triggers the native calendar picker on both iOS and Android)
- Remove Google Calendar / Outlook / Office 365 web links on native — they just open a browser. Replace with a single "Add to Calendar" button that generates and shares the ICS file
- On **web**, keep all options as-is

#### 3. Update `mapProviders.ts` — Add native URL schemes

Add native-specific URLs for Google Maps and Waze:
- Google Maps: `comgooglemaps://?q=...` (iOS) / `geo:0,0?q=...` (Android, already exists)
- Waze: `waze://?ll=0,0&q=...`
- Apple Maps: already handled via `maps://`

#### 4. Update WhatsApp sharing — Use native scheme

In `EventInviteLink.tsx` and `TeamInviteLink.tsx`:
- On native: use `whatsapp://send?text=...` via `window.location.href` 
- On web: keep `https://wa.me/...` as-is

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useExternalLink.ts` | Add `openNativeIntent()` helper that maps known domains to native URI schemes |
| `src/lib/mapProviders.ts` | Add native URI schemes for Google Maps and Waze per platform |
| `src/components/events/AddToCalendarButton.tsx` | On native: show only "Add to Calendar" (ICS-based); on web: keep all options |
| `src/components/events/EventInviteLink.tsx` | Use `whatsapp://` scheme on native for WhatsApp sharing |
| `src/components/teams/TeamInviteLink.tsx` | Same WhatsApp fix |
| `src/pages/EventDetail.tsx` | Use native map URLs from updated `mapProviders.ts` instead of web URLs on native |

