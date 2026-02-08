

# Feature Graphic Redesign -- Professional Google Play Standard

## Problem Analysis
The current feature graphic fails on every modern app store design principle:
- **White background with scattered geometric shapes** looks like a 2018 corporate PowerPoint
- **Zero visual connection to the app icon**, which uses a polished blue-to-cyan gradient with a bold white "A"
- **Decorative elements** (random circles, lines, triangles) add clutter without meaning
- **No energy or personality** -- doesn't convey a sports/community app

## Design Direction

The feature graphic must be a **direct extension of the app icon's identity**. The icon uses:
- A rich **blue-to-cyan gradient** (deep blue top-left to bright cyan/electric blue bottom-right)
- A bold, clean **white "A" lettermark**
- Rounded corners, smooth, polished feel

### New Concept: Gradient-Forward Brand Banner

The new feature graphic will:
1. **Use the same blue-to-cyan gradient as the app icon** as the full background -- creating instant visual recognition
2. **"ATHLETICA" in bold white sans-serif type** -- large, centered, clean
3. **Tagline "Find your team. Play your game."** in white with slight transparency -- elegant, not competing
4. **No decorative clutter** -- the gradient itself is the visual statement
5. **Optional subtle light/glow effect** behind the text for depth (like modern app banners from Strava, Nike, etc.)

### Specifications
- **Exact dimensions**: 1024 x 512 pixels (image generation constraint; content centered in the 1024x500 safe zone)
- **Background**: Smooth gradient matching the app icon (deep blue #0052CC top-left to bright cyan #00AAFF bottom-right)
- **Typography**: "ATHLETICA" in bold white, clean sans-serif (Montserrat-like). Tagline smaller below
- **No icons, no shapes, no clip-art** -- just brand + gradient

### What Changes
- `public/feature-graphic.png` -- replaced with the new gradient-based design

### Image Generation Prompt Strategy
The prompt will reference:
- The app icon's exact gradient colors
- Modern app store banner style (Strava, Nike Run Club, Headspace as references)
- Strict instruction: no decorative elements, no shapes, gradient background only
- White bold typography centered
- Professional, premium, 2025 mobile-app aesthetic

