# design-system Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Self-hosted fonts
The app SHALL use the fingerprint's fonts (Gilda Display for display, DM Sans for UI, the fingerprint mono for code), stored as woff2 under `static/fonts/fingerprint/` with their licence files, declared by the vendored `fonts.css` and preloaded in `app.html`. No page SHALL request a resource from another origin.

#### Scenario: Pages load no external resources
- **WHEN** each redesign mockup page is opened
- **THEN** every request the page makes goes to the app's own origin
- **proof:** e2e

#### Scenario: Display and text fonts load from the app
- **WHEN** `/` has finished loading
- **THEN** `document.fonts` reports Gilda Display and DM Sans as loaded from `/fonts/fingerprint/`
- **proof:** e2e

### Requirement: Motion module
`src/lib/motion.ts` SHALL export `reducedMotion()` and the shared motion primitives (design.md → Contracts). Movement, entrances and exits SHALL animate only `transform` and `opacity`. One exception is allowed: colour, background, border-colour and box-shadow transitions on interactive state changes (hover, focus, pressed, selected, checked). Nothing animates height, margin, padding or min-height: a row added to the recipe form's sections editor settles in like any created row, a removed one fades, and its siblings glide (FLIP). The vendored fingerprint motion under `src/lib/styles/fingerprint/` (the pill glide on `clip-path`, the card settle, the scrolled top bar) is governed by the Design-System and not checked here. A keyframe animation never animates colour or shadow. Under `prefers-reduced-motion: reduce` every primitive SHALL be instant or a plain fade.

What the user makes happen moves short and eases out, on the fingerprint durations and curves (Rue, gate 7): a row the user creates (a list item, a plan entry) settles in from a few pixels above (opacity, translate and scale 0.98 → 1, 260 ms, `--ease-out`); a removed row fades in 160 ms and the rows that stay glide to their place (FLIP, 260 ms, `--ease-in-out`), measured on the page, so a row that kept its place does not glide when the browser clamps the scroll; a checked list item fills its box and then flies to Checked in 260 ms on `--ease-out`, whatever the distance. Menus and popovers (the recipe and spot ··· menus, plan entry options, the category menu from 768 px) open out of their trigger with a fade and a scale from 0.97 in 160 ms and close in 120 ms; dialogs and sheets open softly — a bottom sheet below 768 px slides up from its edge in 260 ms, a centred card rises a few pixels and grows from 0.97 in 160 ms — and close faster than they open. Under `prefers-reduced-motion: reduce` menus, popovers, dialogs and sheets open and close instantly. Focus moves, traps and returns exactly as without motion.

#### Scenario: Menus and dialogs open softly
- **WHEN** at 1280×800 the recipe page's ··· menu is opened, and the Add to plan dialog is opened at 1280×800 and at 390×844
- **THEN** the menu panel plays an animation of 100 to 200 ms; the dialog plays a 100 to 200 ms animation at 1280×800 and a 200 to 300 ms one at 390×844; and after Escape the dialog is closed and focus is back on its trigger
- **proof:** e2e

#### Scenario: Reduced motion opens menus and dialogs instantly
- **WHEN** reduced motion is emulated and the same menu and dialog are opened and closed, and the Home "+" sheet is opened and closed at 390×844 and at 800×800
- **THEN** neither the menu panel nor the dialog nor the sheet nor their backdrops play any animation, and the sheet is gone right after it is closed
- **proof:** e2e

#### Scenario: A new list item settles in
- **WHEN** an item is added on `/list`
- **THEN** its new row plays an animation of 200 to 300 ms, and with reduced motion it plays none
- **proof:** e2e

#### Scenario: Clearing checked items at the page end moves no row to buy
- **WHEN** at 375×812 the list is scrolled to its end, so that clearing the checked items shortens the page and the browser clamps the scroll, and "Clear checked" is pressed
- **THEN** no row and no aisle under "To buy" plays a FLIP animation and none of them moves on the page while the checked rows leave (rows and aisles glide measured on the page, and only the level that moved glides)
- **proof:** e2e

#### Scenario: Press states show on an iPhone
- **WHEN** Rue presses and holds a button or a card on a real iPhone in Safari
- **THEN** its press state (`:active` scale) shows while the finger is down; the document listens for `touchstart` with a passive listener (`Shell.svelte`), which is what makes iOS Safari apply `:active`, and scrolling stays smooth
- **proof:** manual (real iPhone: Playwright's WebKit does not reproduce iOS Safari's `:active` rule)

#### Scenario: Reduced motion makes transitions instant
- **WHEN** `reducedMotion()` is true and a motion primitive is asked for its transition
- **THEN** its duration is 0 or it only changes opacity
- **proof:** unit

#### Scenario: Motion animates only transform and opacity
- **WHEN** the CSS of every motion primitive is generated at t = 0.5
- **THEN** it sets no property other than `transform` and `opacity`, and no transition, keyframe or Svelte transition in `src/` outside the vendored fingerprint and the exceptions above animates anything else
- **proof:** unit

### Requirement: Vendored fingerprint
The app SHALL carry Design-System fingerprint 2.0.0 (the single bump of checkpoint A) as vendored by `scripts/sync.sh`: `src/lib/styles/fingerprint/`, `scripts/fingerprint/`, `static/fonts/fingerprint/`, `DESIGN.md`, `DESIGN.json`, `DESIGN-reference.md` and `fingerprint.lock`, never edited here. Every app page SHALL load the fingerprint CSS, set `data-accent` on `<html>` (rosemary, fingerprint 2.0.0) and style with fingerprint roles only, as `check-slop` enforces.

#### Scenario: Vendored files match the lock
- **WHEN** `node scripts/fingerprint/check-drift.mjs` runs
- **THEN** it exits 0 and `fingerprint.lock` names the synced version
- **proof:** unit

#### Scenario: App renders with the accent
- **WHEN** `/`, `/recipes` and `/eating-out` are opened
- **THEN** `<html>` carries `data-accent="rosemary"` (checkpoint A, fingerprint 2.0.0) and the computed `--accent` equals that accent's value from the vendored `tokens.css`
- **proof:** e2e

#### Scenario: App pages load nothing from other origins
- **WHEN** every contract page route is opened with seeded data
- **THEN** every request the page makes goes to the app's own origin
- **proof:** e2e

### Requirement: Redesign mockups
Gate 4 wireframes and gate 5 hi-fi SHALL exist as pages under `/__mockups/redesign/` (`wire/<screen>/`, `hifi/<screen>/`; 404 unless `COOKING_HUB_TEST=1`), loading only the fingerprint CSS, with a normal and a worst-case data set (`?data=worst`), and `e2e/redesign-shots.test.ts` SHALL shoot every page at 375, 768 and 1280 px wide in both data sets. Mockup photos SHALL stay local with their credits in `static/mockups/CREDITS.txt`. No build unit (gate 6) SHALL start before Rue signed off gate 5 and checkpoint A has re-synced the fingerprint.

#### Scenario: Redesign mockups are hidden without the test flag
- **WHEN** `/__mockups/redesign/` and one `wire/` page are requested without `COOKING_HUB_TEST=1`
- **THEN** both answer 404
- **proof:** unit

#### Scenario: Every mockup screen is shot at three widths
- **WHEN** `e2e/redesign-shots.test.ts` runs
- **THEN** every page directory under `/__mockups/redesign/` has a screenshot at 375, 768 and 1280 px wide for the normal and the worst-case set in `test-results/shots/redesign/`
- **proof:** e2e

#### Scenario: Worst-case data switches the fixtures
- **WHEN** a mockup page is opened with and without `?data=worst`
- **THEN** the worst-case page shows the 120-character recipe title and the 80-item list where the normal page shows the normal fixtures
- **proof:** e2e

#### Scenario: Every mockup photo is credited
- **WHEN** the files in `static/mockups/` are listed
- **THEN** each image has a line in `CREDITS.txt` with source URL, author and licence
- **proof:** unit

#### Scenario: Rue signs off wireframes and hi-fi
- **WHEN** the gate 4 wireframes and then the gate 5 hi-fi with the master icon are presented
- **THEN** Rue signs each off, recorded with date and picks in design.md → Gate log
- **proof:** manual (human gate)

### Requirement: App icon
The app SHALL ship the master icon designed at gate 5 (Design-System `icons/Rues-Cooking-Hub/icon.svg`, from the app's main jobs, in the family sheet) as the built icon set in `static/`, with link tags and `theme-color` in `app.html` and a `static/manifest.webmanifest` that references only existing icon files. There SHALL be no service worker.

#### Scenario: Icon files are served
- **WHEN** every icon path in `app.html` and the manifest is requested
- **THEN** each answers 200 with an image content type
- **proof:** e2e

#### Scenario: Head carries the icon links
- **WHEN** `/` is opened
- **THEN** the head holds the icon, apple-touch-icon and manifest links and a `theme-color` meta
- **proof:** e2e

#### Scenario: Icon reads at small sizes
- **WHEN** the icon sheet at 16, 32, 180 and 512 px is shown next to the sibling apps' icons
- **THEN** Rue and the fresh-context reviewer read it as Cooking Hub and as part of the family
- **proof:** manual (visual judgement at gate 5)

### Requirement: Contract states and English copy
Every route SHALL render the required states its contract section lists (empty, loading, error, single, many, overlong as applicable), every user-facing string SHALL be English and come from the contract copy list (new strings fixed at gate 5 are added to the list and to `src/lib/copy.ts` in the wave that ships them), and only the allow-listed `data-*` attributes SHALL carry behaviour.

#### Scenario: Contract strings stay
- **WHEN** `src/lib/copy.ts` is compared with the contract copy list
- **THEN** every key's string appears verbatim in the copy list
- **proof:** unit

#### Scenario: New strings are in the contract
- **WHEN** the strings added at gate 5 are read: the `COPY.contextAdd` labels "Add to your kitchen", "Add recipe", "Add to plan", "Add an item" and "Add spot", the Home choice sheet labels "Recipe", "Plan entry" and "List item" with their hints, "Show all N tags", "Show fewer tags", "Search spots" and the tag empty state "No tags yet" / "Tags are added while you edit a recipe."
- **THEN** each appears in the contract copy list
- **proof:** unit

### Requirement: Shared dialogs, menus and status notices
Every dialog and menu (G4: Add to plan, the plan Add dialog, entry options, Move to…, Copy week, Add from plan, Delete recipe, Delete tag, the category menu, Discard changes?, Mark visited, Delete spot, the Home choice sheet) SHALL be built on the copied-in fingerprint primitives with fingerprint roles only, open as a centred card from 768 px and as a bottom sheet below (gate 4), give delete confirmations a secondary pill (never the screen's dark primary pill), and keep the contract's behaviour: modal, focus moves in on open and back to the trigger on close, Escape, the "Close" control and an outside click close it (the discard dialog is an alert dialog and Escape keeps editing). Status notices (G5: list "Added N items from the plan", tags "Merged … into …", Add to plan "Added to …", import and image notices) SHALL share one style and be announced without taking focus. A menu or popover anchored to a trigger (plan entry options, the recipe and spot ··· menus, the category menu from 768 px) SHALL never reach under the phone bar: its bottom limit is the bar's top edge (the bar already sits above the safe-area inset) less 12 px, and the viewport's bottom edge less 12 px where no bar shows; when there is no room below the trigger it SHALL open above it (verify round 3).

#### Scenario: Every dialog traps focus and returns it
- **WHEN** at 390×844 and 1280×800 each G4 dialog is opened from its trigger, Tab is pressed through it twice, and it is closed with Escape
- **THEN** focus never leaves the dialog while open and returns to the trigger after closing
- **proof:** e2e

#### Scenario: Close control and outside click close every dialog
- **WHEN** each G4 dialog except Discard changes? is opened and closed once with its "Close" control and once with a click outside it
- **THEN** each time the dialog is gone and nothing was saved
- **proof:** e2e

#### Scenario: Dialogs are bottom sheets on the phone and cards from 768 px
- **WHEN** the Delete recipe dialog and the plan Add dialog are opened at 390×844 and at 1280×800
- **THEN** at 390×844 each dialog's bottom edge sits at the viewport's bottom and it spans the viewport width; at 1280×800 it is horizontally centred and narrower than the viewport
- **proof:** e2e

#### Scenario: Menus open clear of the phone bar
- **WHEN** on a touch screen at 390×844 and at 768×1024 the plan is scrolled to its end and the options of the week's last entry are opened by a tap
- **THEN** the menu's bottom edge is at least 12 px above the phone bar's top edge, and a tap on its "Delete" deletes the entry
- **proof:** e2e

#### Scenario: Status notices are announced without taking focus
- **WHEN** "Add from plan" adds items on `/list` and a tag is merged on `/recipes/tags`
- **THEN** each outcome text appears inside an element with `role="status"` and focus stays where it was
- **proof:** e2e

### Requirement: Accessibility floor
Every route and dialog SHALL meet WCAG 2.2 AA: no horizontal page scroll from 320 to 1920 px, pointer targets at least 24×24 px everywhere and at least 44×44 px for phone controls, visible focus never hidden by the navigation or a dialog, every drag with a Move to… alternative, and reduced motion removing non-essential movement.

#### Scenario: No horizontal page scroll from 320 to 1920
- **WHEN** Home, `/recipes`, a recipe page, `/recipes/new/form`, `/recipes/tags`, `/plan`, `/list` and `/eating-out` are opened with the worst-case seed at 320, 375, 768, 1024, 1280 and 1920 px wide
- **THEN** on each the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Controls meet the target sizes
- **WHEN** the same pages are opened at 390×844 and 1280×800
- **THEN** every visible button, link and form control is at least 24×24 px, and at 390×844 every navigation pill, the "+", the brand link of the top strip and every list checkbox is at least 44×44 px
- **proof:** e2e

#### Scenario: Focus is visible and not obscured
- **WHEN** each of those pages is walked with Tab at 390×844 and 1280×800
- **THEN** every focused element has a visible focus indicator and is not covered by the navigation or a dialog
- **proof:** e2e

#### Scenario: Reduced motion removes movement
- **WHEN** reduced motion is emulated and Home, the archive filter, a recipe page and a list check are used
- **THEN** no element changes `transform` over time and no view transition is started
- **proof:** e2e

#### Scenario: WCAG 2.2 AA review passes
- **WHEN** the a11y reviewer checks every route and dialog at gate 7
- **THEN** no AA failure remains open
- **proof:** manual (review at gate 7)

### Requirement: Chrome cursor
Text that cannot be edited — kickers, headings, ledes, counts, card text, navigation links, labels, chips, menu items, buttons, and the recipe's ingredients, method and notes — SHALL show the default cursor (or its control's pointer inside a link or button), never the text cursor. Only inputs and textareas SHALL show the text cursor. Like a native app, nothing on the screen SHALL start a text selection or the long-press callout — headings, kickers, ledes, card headings and meta, labels, the charcoal facts card, plan day names, aisle headings, links and controls — except fields (inputs, textareas, selects, editable text) and what the user wrote themselves: the recipe's ingredients, method and notes, and a spot's notes and address (Rue, gate 7; verify round 2).

#### Scenario: Chrome and reading text show the default cursor
- **WHEN** Home and a recipe page are opened on the desktop with a seeded recipe
- **THEN** a kicker, the page heading, a card heading, a navigation link, an ingredient, a method step and the servings group have computed cursor `default` or `pointer`, never `text` or `auto`; an item of the open recipe menu has `pointer`
- **proof:** e2e

#### Scenario: Fields keep the text cursor
- **WHEN** `/list` and `/recipes/new/form` are opened on the desktop
- **THEN** the list's add field, the recipe title field and a textarea have computed cursor `text`
- **proof:** e2e

#### Scenario: Only fields and the user's own writing are selectable
- **WHEN** a recipe page, Home and `/list` are opened on the desktop
- **THEN** the recipe menu button, a navigation link, an item of the open menu, the page heading, a card heading, the "Scale to servings" label, the charcoal facts card, a recipe card's time on Home and the "All N recipes" link have computed `user-select: none`, while an ingredient, a method step, the notes and the list's add field keep `user-select` other than `none`; a double-click on the page heading leaves the selection empty, and a double-click on a method step selects a word of it
- **proof:** e2e

### Requirement: No old styling
After the build the old style system SHALL be gone: `src/lib/styles/tokens.css`, `tokens.ts`, `global.css`, their tests, the old `static/fonts/*` outside `fingerprint/`, the old `/__mockups/<screen>` pages and `src/lib/mockups/*`, and the old atoms in `src/lib/ui/` no code imports; `proof` SHALL run `check-slop` with no baseline.

#### Scenario: Old style files are gone
- **WHEN** the repo is listed after the cleanup
- **THEN** none of `src/lib/styles/tokens.css`, `src/lib/styles/tokens.ts`, `src/lib/styles/global.css`, `static/fonts/fraunces-latin-opsz-normal.woff2`, `src/routes/__mockups/home/` exists
- **proof:** unit

#### Scenario: Proof runs check-slop without a baseline
- **WHEN** `package.json` is read
- **THEN** `proof` calls `scripts/fingerprint/check-slop.mjs` and `scripts/fingerprint/check-drift.mjs` directly and no `scripts/slop-baseline.*` file exists
- **proof:** unit

