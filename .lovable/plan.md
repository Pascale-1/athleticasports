

# Fix: BottomNavigation badge counts expired invitations

## Problem
`src/components/mobile/BottomNavigation.tsx` line 32-36 queries `team_invitations` with `status = 'pending'` but does NOT filter out expired invitations (`.gt("expires_at", ...)`). This causes the "1" badge on the Teams icon even though the invitation is expired and not shown inline.

## Solution

**File: `src/components/mobile/BottomNavigation.tsx`** (line 35)

Add `.gt('expires_at', new Date().toISOString())` to the invitation count query, after `.eq('status', 'pending')`.

One line added. No other changes needed.

