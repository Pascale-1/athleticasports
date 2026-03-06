

# Fix Share Links — Use Web Share API Standard

## The Standard Pattern

The industry-standard approach used by apps like Instagram, Strava, and WhatsApp is:

1. **Always try `navigator.share()` first** (native share sheet on mobile — lets users pick WhatsApp, iMessage, etc.)
2. **If it throws (iframe, unsupported, etc.), fall back to clipboard copy** with a toast confirmation
3. **The URL must always be a valid HTTPS URL** — never an iframe origin

## Current Problems

- `getAppBaseUrl()` falls back to `window.location.origin` which returns the Lovable iframe URL (not a valid shareable link)
- `handleShare` in `Settings.tsx` doesn't fall back to clipboard when `navigator.share` throws a non-AbortError
- The `VITE_APP_URL` env var is not set, so all generated URLs are broken

## Changes

### `src/lib/appUrl.ts`
Hardcode the preview URL as fallback when `VITE_APP_URL` is unset and the origin looks like an iframe/localhost:

```ts
export const getAppBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  const origin = window.location.origin;
  // If running inside iframe or localhost, use the known preview URL
  if (origin.includes('lovableproject.com') || origin.includes('localhost')) {
    return 'https://id-preview--cf052cd2-1671-4422-bc90-2b3b42373aba.lovable.app';
  }
  return origin;
};
```

### `src/pages/Settings.tsx` — `handleShare`
Follow the standard pattern: try native share, catch all errors (except user cancel), fall back to clipboard:

```ts
const handleShare = async () => {
  const shareUrl = `${getAppBaseUrl()}/users?user=${profile?.user_id}`;
  const shareData = {
    title: profile?.display_name || profile?.username,
    text: 'Athletica',
    url: shareUrl,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return;
  }
  const copied = await copyToClipboard(shareUrl);
  if (copied) toast.success(t("profileToasts.linkCopied"));
};
```

### `src/components/events/EventInviteLink.tsx`
Already uses `copyToClipboard` correctly. The fix to `appUrl.ts` will make the generated URL valid. No other changes needed.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/appUrl.ts` | Add preview URL fallback for iframe/localhost origins |
| `src/pages/Settings.tsx` | Fix `handleShare` to always fall back to clipboard on error |

