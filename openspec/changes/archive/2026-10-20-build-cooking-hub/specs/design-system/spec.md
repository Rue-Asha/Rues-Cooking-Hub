## ADDED Requirements

### Requirement: Light warm tokens
Every colour, radius, shadow, blur, spacing step, duration and easing SHALL come from the custom properties in
`src/lib/styles/tokens.css` (mirrored in `src/lib/styles/tokens.ts` for tests); no raw colour SHALL appear in a
component. The palette SHALL be light and warm: cream/sand ground, stone grey, olive and brick-red accents, one dark
tile style (design.md → Visual brief). There SHALL be no dark mode: `color-scheme: light` only.

#### Scenario: Text contrast meets 4.5:1
- **WHEN** every text/background token pair listed in `tokens.ts` is evaluated
- **THEN** each pair has a contrast ratio of at least 4.5:1
- **proof:** unit

#### Scenario: Glass panel text stays legible over any photo
- **WHEN** the glass fill is composited over pure black and over pure white
- **THEN** body ink on both composites reaches at least 4.5:1, and white headline text on the hero scrim over pure white reaches at least 3:1
- **proof:** unit

#### Scenario: Components use no raw colour
- **WHEN** every component and stylesheet outside `src/lib/styles/` is scanned
- **THEN** none contains a hex, `rgb()`, `rgba()` or `hsl()` colour
- **proof:** unit

#### Scenario: Dark colour scheme preference changes nothing
- **WHEN** a page is opened with `prefers-color-scheme: dark` emulated
- **THEN** the body background and text colours equal those under `prefers-color-scheme: light`
- **proof:** e2e

### Requirement: Self-hosted fonts
The app SHALL use one serif display face and one sans text face (chosen in the mockup unit), stored as woff2 under
`static/fonts/` with their licence files, declared with `@font-face` in the app and preloaded in `app.html`. No page
SHALL request a resource from another origin.

#### Scenario: Pages load no external resources
- **WHEN** each mockup screen is opened
- **THEN** every request the page makes goes to the app's own origin
- **proof:** e2e

#### Scenario: Display and text fonts load from the app
- **WHEN** a mockup screen has finished loading
- **THEN** `document.fonts` reports both the display and the text family as loaded from `/fonts/`
- **proof:** e2e

### Requirement: Shared components
`src/lib/ui/` SHALL provide GlassPanel, PillNav, ArrowButton (arrow in a circle, dark and light variants), RoundNav
(prev/next pair), Card, Chip (outlined, active filled), Button (primary dark pill, secondary), Kicker, Counter
(`01/07`, tabular numerals), Tile (light and dark) and ImagePlaceholder (the designed no-image state). Every button
and nav link SHALL be at least 44×44 px on phone.

#### Scenario: Controls are at least 44px on phone
- **WHEN** each mockup screen is opened in the phone project
- **THEN** every visible `button` and nav link has a bounding box of at least 44×44 px
- **proof:** e2e

#### Scenario: Components match the visual brief
- **WHEN** Rue reviews the mockup screenshots
- **THEN** glass panel, pill nav, arrow-in-circle button, card, chip and the dark tile read as the brief describes
- **proof:** manual (visual judgement by Rue at the mockup stop)

### Requirement: Motion module
`src/lib/motion.ts` SHALL export `reducedMotion()` and the shared motion primitives (design.md → Contracts). Movement,
entrances and exits SHALL animate only `transform` and `opacity`. Three exceptions are allowed: (a) colour, background,
border-colour and box-shadow transitions on interactive state changes (hover, focus, pressed, selected, checked);
(b) the height-based `slide` that inserts or removes a row where its neighbours must make room (the recipe form's
sections editor); (c) `inline-size` on the compact tab bar and on the nav pill that glides to the active item. A
keyframe animation never animates colour or shadow. Under `prefers-reduced-motion: reduce` every primitive SHALL be
instant or a plain fade.

#### Scenario: Reduced motion makes transitions instant
- **WHEN** `reducedMotion()` is true and a motion primitive is asked for its transition
- **THEN** its duration is 0 or it only changes opacity
- **proof:** unit

#### Scenario: Motion animates only transform and opacity
- **WHEN** the CSS of every motion primitive is generated at t = 0.5
- **THEN** it sets no property other than `transform` and `opacity`, and no transition, keyframe or Svelte transition in `src/` outside the exceptions above animates anything else
- **proof:** unit

### Requirement: Mockups before feature UI
Static mockups of Home, Recipes, Recipe detail, Import (preview and fallback form), Plan and List SHALL exist at
`/__mockups/<screen>` (404 unless `COOKING_HUB_TEST=1`), built from the shared components with fixture data and ~8 free-licence food photos in `static/mockups/` whose source
URL, author and licence are listed in `static/mockups/CREDITS.txt`, and
`npm run shots:mockups` SHALL write their screenshots at 390×844 and 1280×800 to
`test-results/shots/mockups/<project>-<screen>.png`. All main screens SHALL follow one alignment rule (design.md →
Visual brief). No unit that builds feature UI SHALL start before Rue approved the mockups.

#### Scenario: Mockup screenshots are produced for both viewports
- **WHEN** `npm run shots:mockups` runs
- **THEN** it writes one screenshot per screen and project (14 files: 7 screens × phone and desktop)
- **proof:** e2e

#### Scenario: Every mockup photo is credited
- **WHEN** the files in `static/mockups/` are compared with `CREDITS.txt`
- **THEN** every image file has a line with its source URL, author and licence
- **proof:** unit

#### Scenario: Mockup routes are hidden without the test flag
- **WHEN** the mockup route guard runs while `COOKING_HUB_TEST` is not `1`
- **THEN** it responds 404
- **proof:** unit

#### Scenario: Main screens share one alignment rule
- **WHEN** each mockup screen is measured at 390 and 1280
- **THEN** the page header and every section heading start at the content column's left edge, and the column is centred within 1px
- **proof:** e2e

#### Scenario: Rue approves the mockups
- **WHEN** Rue reviews the phone and desktop screenshots, the desktop judged as seriously as the phone
- **THEN** Rue approves them, and only then do feature UI units start
- **proof:** manual (taste stop; visual judgement by Rue)

#### Scenario: Requested changes revise the mockups
- **WHEN** Rue asks for changes to the mockups
- **THEN** the mockups are revised and shown again until Rue approves; the build waits, which is not a failure
- **proof:** manual (taste stop; visual judgement by Rue)
