# CLAUDE.md

This repository is public and is served as-is by GitHub Pages at myicart.com.au (including this file). Don't put secrets, internal URLs or private notes here.

## UI and design

This site has an established brand ("Calmer · In use"). Design plugins and skills (UXKIN `no-ui-slop`, `frontend-design`, or any other) must work within it, not replace it.

- **Design tokens come first.** Colours, radii, widths and fonts live in `:root` in `styles.css`. Use those custom properties; don't add new hex values, fonts or palettes. If a design needs something the tokens don't cover, add a named token there and say so.
- **Brand rules:** brand blue (`--brand`) for identity, navy (`--ink`) for text, calm off-white canvas (`--canvas`). Gold (`--accent`) is only for deals.
- **Fonts:** Hedvig Letters Sans for text (one weight only, never synthesise bold), Outfit only for the wordmark. No other typefaces.
- **Logos and images:** use the files in `assets/` as they are; don't redraw or recolour the logo.
- **Match the app.** The SmartCart app uses the same brand blue, navy, yellow and canvas; keep the two consistent.
- Reference sites and design ideas from plugins are inspiration for layout and interaction, never a reason to change the brand.
