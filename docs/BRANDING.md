# Admin dashboard branding

## Scope

This adapts the supplied Holan branding standards to the Nigerian staff procurement
dashboard. Do not copy the source document's UK marine/offshore business claims,
public-site content, asset paths or unverified company information.
Use existing approved admin logo assets unchanged; preserve aspect ratio,
legibility and accessible naming. Do not redraw or recolour logos.

## Core palette

| Semantic role      | Colour  |
| ------------------ | ------- |
| Brand primary/navy | #04035E |
| Brand accent/sky   | #69CAF0 |
| Brand neutral/grey | #696060 |
| Brand white        | #FFFFFF |

Use semantic Tailwind tokens, not scattered hex values. Navy/white and navy/sky
are primary readable pairings. Never use white text on sky for essential content.
Success/warning/info/error and neutral shades are UI extensions, not original
logo colours. Use status labels/icons as well as colour.

## Implementation source

src/app/globals.css is the Tailwind v4 CSS-first source of theme values and
mappings. The legacy tailwind.config.js is an empty compatibility shim, not a
second palette. It is not loaded by the v4 stylesheet.

Tokens include primary/secondary/accent, background/foreground, card/popover,
muted, border/input/ring, sidebar, chart-1 through chart-5 and status families:
success, warning, info and destructive. Each status has foreground and subtle
surface/content/border companions. error/danger/destroy alias destructive;
alert aliases warning. Prefer destructive and warning in new code.

Existing brand-navy/blue/gray/white aliases remain available. New code should use
semantic roles. Light and dark values are defined; this does not add a new
theme-switcher UI or imply all legacy hard-coded page styling is dark-mode ready.

## Typography

Use next/font/google:

- Barlow 500/600/700 for headings; titles 700, smaller headings 600.
- Lato 400/700 for subtitles, navigation, labels and CTAs.
- Inter for body/interface text.
- System monospace for code; never imitate logo lettering with fonts.

Semantic font tokens: sans/body, heading/display, subtitle/label/caption and mono.
Use bounded display/heading/subtitle/body/label/caption size tokens where suitable;
keep body paragraphs at least 16px on mobile. Explicit compact table/label sizing
may differ without shrinking general body copy. Verify font-loading layout.

## Logo and content

The approved tagline is “Delivery Reliability Every Time,” used selectively.
Do not automatically add it to every dashboard screen.
Preserve current admin logo variants; asset changes need separate approval.
No UK photography or marine imagery is required for this operations UI.

## Accessibility

Ensure normal text pairs meet 4.5:1 and important UI boundaries/focus indicators
meet 3:1 against adjacent surfaces. Small muted text must remain readable.
Do not convey state only through colour. Theme tests validate configured token
pairs; browser review remains necessary for opacity, images and component overrides.
