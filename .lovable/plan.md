

## Hide Raw URLs — Show Only Copy & Share Buttons

Two components expose raw URLs/codes to users via readonly Input fields. The fix is to remove those inputs and replace them with clean action buttons.

### Changes

**1. `src/components/events/EventInviteLink.tsx`** (lines 199-204)
- Remove the `<Input value={inviteLink} readOnly />` field
- Keep only the Copy and Share buttons side by side, styled as full-width action buttons with labels (e.g. "Copy Link" and "Share")

**2. `src/components/teams/TeamInviteLink.tsx`** (lines 146-183)
- Remove the invite link `<Input>` section (lines 147-163) showing the full URL
- Remove the invite code `<Input>` section (lines 166-183) showing the raw code
- Replace with two clean action buttons: "Copy Link" and "Copy Code", plus keep the existing Share/WhatsApp/SMS buttons below

Both components already have all the copy/share logic wired up — this is purely a UI cleanup removing the visible Input fields.

