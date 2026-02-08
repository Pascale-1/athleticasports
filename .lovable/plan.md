

# Feature Graphic Redesign for Google Play

## Current Issue
The existing feature graphic looks dated and doesn't match the Athletica brand identity -- a clean, modern, minimalist mobile-first sports app with an Electric Blue (#0066FF) primary color, white backgrounds, Montserrat headings, and Inter body text.

## Design Direction
Based on the app's visual identity:
- **Color palette**: Electric Blue (#0066FF) primary, clean white, subtle neutral grays
- **Typography**: Montserrat (bold headings), Inter (body) -- clean sans-serif fonts
- **Aesthetic**: Compact, high-density mobile-app feel -- minimalist, modern, not cluttered
- **Brand tagline**: "Empowering women in sports through community and teamwork"
- **Icon style**: The app icon (`athletica_icon.png`) uses a clean, modern mark

## Proposed Approach

### Image Generation Strategy
Generate the feature graphic at exactly **1024x500 pixels** (Google Play's exact requirement) so no cropping is needed. The image generation tool supports custom dimensions in multiples of 1 pixel.

### Visual Concept
A clean, professional banner that mirrors the app's minimalist UI:

- **Clean white or very light background** (matching the app's `bg-background` white feel)
- **"ATHLETICA" wordmark** in Montserrat Bold, large and centered
- **Tagline** beneath in Inter -- "Find your team. Play your game."
- **Electric Blue (#0066FF) accent elements** -- subtle geometric shapes, lines, or gradients (no busy patterns)
- **Minimal sports iconography** -- abstract/geometric, not clip-art or stock photo style
- **No busy backgrounds, no gradients that look 2010s** -- pure modern SaaS/app-store style

### What Will Change
- `public/feature-graphic.png` -- replaced with a new, modern 1024x500 image

### Technical Details
- Use the image generation tool with exact 1024x512 dimensions (closest supported), then the prompt will specify the 1024x500 safe area
- The prompt will emphasize: minimal, modern app-store aesthetic, Electric Blue (#0066FF), white space, Montserrat typography, professional quality
- No cropping needed by the user if the generation supports exact pixel dimensions; otherwise a note will be provided

