

# Fix: "Pay / Book" button not navigating to the payment link

## Root Cause

The `openExternalUrl` function (and the anchor-click fallback) sets `href` directly to the user-provided URL. If the stored `payment_link` value lacks a protocol prefix (e.g., `example.com` instead of `https://example.com`), the browser interprets it as a relative path within the app, so the link goes nowhere useful.

## Fix

**File: `src/hooks/useExternalLink.ts`**

Add a URL normalization step at the top of `openExternalUrl` (both the hook version and the standalone export): if the URL does not start with `http://` or `https://`, prepend `https://`.

```ts
const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};
```

Then call `normalizeUrl(url)` before passing to `Browser.open` or `openUrlWithAnchor`.

### Files changed
- `src/hooks/useExternalLink.ts` -- add URL normalization

