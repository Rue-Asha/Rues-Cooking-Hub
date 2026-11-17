## ADDED Requirements

### Requirement: Main navigation
The app SHALL expose exactly one navigation named "Main" at a time at every viewport width, with the five areas Home (`/`), Recipes (`/recipes`), Plan (`/plan`), List (`/list`) and Eating Out (`/eating-out`, last). The current area SHALL carry `aria-current="page"`, also on every page below it (`/recipes/12`, `/recipes/new/form`, `/recipes/tags` mark Recipes; `/eating-out/3/edit` marks Eating Out). From the posture switch (1024 px, kept at gate 4) the navigation SHALL be the desktop top bar, below it the phone bar, tablets included; exactly one of the two SHALL be shown. After the page is scrolled more than 48 px the navigation SHALL carry `data-compact` and lose it within 48 px of the top. Its presentation follows the signed-off hi-fi (gate 5 with checkpoint A, fingerprint 2.0.0): on the phone the pill group SHALL be the opaque card surface in every state, never glass, so scrolling changes nothing there; on the desktop from 1024 to 1099 px the top bar scrolls away with the page, and from 1100 px it becomes a sticky, solid compact capsule (brand mark, area links, actions) once the top of the frame is out of view. Link names SHALL stay available in every state and under reduced motion the change SHALL be instant. Content and focused elements SHALL never sit under the navigation.

#### Scenario: Active area is derived for sub-routes
- **WHEN** the active area is derived for `/`, `/recipes/12`, `/recipes/new/form`, `/recipes/tags`, `/plan`, `/list` and `/eating-out/3/edit`
- **THEN** it is home, recipes, recipes, recipes, plan, list and eating-out
- **proof:** unit

#### Scenario: One Main navigation at every width
- **WHEN** `/plan` is opened at 320×640, 390×844, 768×1024, 844×390, 1024×768 and 1280×800
- **THEN** each time exactly one navigation named "Main" is exposed, it marks only Plan with `aria-current="page"`, and only one of the top bar and the phone bar is visible
- **proof:** e2e

#### Scenario: Only the sticky top bar sits out the page fade
- **WHEN** `/` is opened at 375, 1024 and 1280 px wide
- **THEN** the top bar carries the view-transition name `app-topbar` only at 1280 (from 1100 px, where it is the sticky capsule), and the phone top strip never carries one (`Shell.svelte`)
- **proof:** e2e ("the top bar sits out the page fade only where it is sticky")

#### Scenario: Navigation reports the scrolled state
- **WHEN** a long page is scrolled 200 px down and back to the top at 390×844 and at 1280×800
- **THEN** the Main navigation carries `data-compact` after the first scroll and not after the second, and its links keep their names in both states
- **proof:** e2e

#### Scenario: Scrolled navigation keeps an opaque card
- **WHEN** a long page is scrolled 200 px down at 390×844, at 1024×768 and at 1280×800, each with and without `prefers-reduced-motion: reduce`
- **THEN** at 390×844 the phone pill group's background is the opaque card surface before and after the scroll; at 1024×768 the top bar has scrolled out of view; at 1280×800 the top bar stays in view at the top of the viewport on a solid surface with every area link named; and with reduced motion none of these changes has a transition
- **proof:** e2e

#### Scenario: Content never sits under the navigation
- **WHEN** a long page (Recipes with 40 recipes) is scrolled to its end at 390×844, 768×1024, 844×390 and 1280×800
- **THEN** the last content element's bottom edge is above the phone bar's top edge (phone posture) or its top is below the top bar's bottom edge when scrolled into view (desktop posture)
- **proof:** e2e

#### Scenario: Focused control is not hidden by the navigation
- **WHEN** at 390×844 and at 1280×800 a page is scrolled to its middle and focus is moved by Tab to each control until one sits next to the bar
- **THEN** every focused control's rectangle has no overlap with the navigation's rectangle
- **proof:** e2e

### Requirement: Desktop top bar
In the desktop posture the top bar SHALL keep today's structure: the brand "Rues Cooking Hub" (link to `/`), the five area links with Eating Out last, and the area's search and add actions ("Search recipes" → `/recipes` and "Add recipe" → `/recipes/new`, or the spot actions on Eating Out pages, see Area-aware header actions), styled with fingerprint roles only. From 1024 px to 1280 px and wider every item SHALL sit on one line without overlapping and the page SHALL not scroll horizontally, with either action set.

#### Scenario: Top bar shows brand, five areas and the recipe actions
- **WHEN** `/list` is opened at 1280×800
- **THEN** the top bar holds a link "Rues Cooking Hub" to `/`, the links Home, Recipes, Plan, List and Eating Out in that order, "Search recipes" to `/recipes` and "Add recipe" to `/recipes/new`, and no phone bar is visible
- **proof:** e2e

#### Scenario: Top bar fits from 1024 to 1280 px
- **WHEN** `/plan` and `/eating-out` are opened at 1024×768, 1152×800 and 1280×800
- **THEN** on each the brand, every area link and both actions share one row (their vertical centres within 4 px), no two of their rectangles overlap, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Top bar looks like the signed-off hi-fi
- **WHEN** Rue opens the running app at 1024 and 1280 px wide
- **THEN** the top bar matches the gate-5 hi-fi of G1
- **proof:** manual (visual judgement by Rue at gate 7)

### Requirement: Phone bar
In the phone posture the navigation SHALL be a bar at the bottom with the five areas as pills, labelled Home, Recipes, Plan, List and Spots, plus a separate round "+" button outside the pill group. The current area's pill SHALL be marked (visibly and with `aria-current="page"`). The bar SHALL respect the safe-area insets, fit at 320 px with pills that are icon-only below 360 px (the label stays as the accessible name) and labelled from 360 px (checkpoint A, 2026-11-16; fingerprint 2.0.0 dock), and every pill and the "+" at least 44×44 px, and never cover content (tablet and landscape phone included). While a text field (input, textarea, contenteditable) has focus the bar SHALL be hidden and `inert`, and SHALL come back when focus leaves the field.

#### Scenario: Phone bar shows five pills and the round add button
- **WHEN** `/recipes` is opened at 390×844
- **THEN** the phone bar holds links Home, Recipes, Plan, List and Spots in that order and, outside their group, one round button whose accessible name is "Add recipe" (the Recipes label of `COPY.contextAdd`, gate 5), and no top bar is visible
- **proof:** e2e

#### Scenario: Current area pill is marked on the phone
- **WHEN** `/recipes/12` and then `/eating-out` are opened at 390×844
- **THEN** first only the Recipes pill and then only the Spots pill carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Phone bar fits at 320 px
- **WHEN** `/list` is opened at 320×640
- **THEN** the five pills are icon-only with the accessible names Home, Recipes, Plan, List and Spots (labelled from 360 px) (checkpoint A, 2026-11-16; fingerprint 2.0.0 dock), the pills and the "+" are each at least 44×44 px, none of their rectangles overlap, all lie inside the viewport, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Phone bar hides while a text field has focus
- **WHEN** at 390×844 the "Add an item" field on `/list` is focused, and then focus leaves it
- **THEN** while the field has focus the phone bar is not visible and carries `inert` (its links are not in the accessibility tree); after blur it is visible and interactive again
- **proof:** e2e

#### Scenario: Phone bar respects the safe areas
- **WHEN** Rue opens the app on a phone with a home indicator, in portrait and landscape
- **THEN** the bar sits above the home indicator and clear of the notch, and no content hides under it
- **proof:** manual (real hardware: Playwright cannot emulate safe-area insets)

### Requirement: Context add button
The phone bar's round "+" SHALL act for the current area: on Recipes pages (archive, recipe page, tags) it SHALL open `/recipes/new`; on Plan it SHALL open the plan's Add dialog (see meal-plan); on List it SHALL focus the "Add an item" field without a dialog (see shopping-list); on Eating Out pages it SHALL open `/eating-out/new`; on Home it SHALL open a choice sheet with "Recipe" (→ `/recipes/new`), "Plan entry" (→ `/plan?add=1`) and "List item" (→ `/list?add=1`). Its accessible name SHALL come from `COPY.contextAdd` per area (copy fixed at gate 5). The sheet SHALL be a modal dialog that closes on Escape, its close control, an outside tap and the browser's back, returning focus to the "+". On the recipe form routes (`/recipes/new`, `/recipes/new/form`, `/recipes/[id]/edit`) the "+" SHALL be hidden and inert.

#### Scenario: Plus on Recipes pages opens Add recipe
- **WHEN** at 390×844 the "+" is tapped on `/recipes`, then on a recipe page and then on `/recipes/tags`
- **THEN** each time `/recipes/new` is shown
- **proof:** e2e

#### Scenario: Plus on Eating Out pages opens Add spot
- **WHEN** at 390×844 the "+" is tapped on `/eating-out` and on a spot page
- **THEN** each time `/eating-out/new` is shown
- **proof:** e2e

#### Scenario: Plus on Home opens the choice sheet
- **WHEN** at 390×844 the "+" named "Add to your kitchen" (gate 5) is tapped on `/`
- **THEN** a modal dialog titled "Add to your kitchen" opens with "Recipe" to `/recipes/new`, "Plan entry" to `/plan?add=1` and "List item" to `/list?add=1`, and focus is inside it
- **proof:** e2e

#### Scenario: Choice sheet closes on Escape, outside tap and back
- **WHEN** the Home choice sheet is opened and closed once with Escape, once with a tap outside it and once with the browser's back
- **THEN** each time the sheet is gone, `/` is still shown and focus is on the "+"
- **proof:** e2e

#### Scenario: Plus is hidden on the recipe form
- **WHEN** at 390×844 `/recipes/new`, `/recipes/new/form` and a recipe's edit page are opened
- **THEN** on each the "+" is not visible and not in the accessibility tree, and the five pills are still there
- **proof:** e2e

### Requirement: Recipe actions on every screen
At every width and on every screen the brand link to `/` SHALL be reachable, and on every screen outside the Eating Out pages also "Search recipes" and "Add recipe", in addition to the phone's context "+". In the phone posture they SHALL sit visible in a top strip above the content (gate 4, placement A): the brand (its mark only below 360 px, the accessible name staying "Rues Cooking Hub"), a "Search recipes" icon button and an "Add recipe" button, reachable without a tap first; on Recipes pages the strip's "Add recipe" and the "+" both lead to `/recipes/new` (accepted at gate 4). "Search recipes" SHALL land on `/recipes` with its search field focused, also when `/recipes` is already open. On Eating Out pages "Search spots" and "Add spot" take the place of "Search recipes" and "Add recipe" in the top bar and on the phone, and no recipe action is exposed there (see Area-aware header actions).

#### Scenario: Recipe actions are reachable on every recipe-side screen on the phone
- **WHEN** at 390×844 each of `/`, `/recipes`, a recipe page, `/recipes/tags`, `/recipes/new/form`, `/plan` and `/list` is opened
- **THEN** on each the phone top strip shows a link "Rues Cooking Hub" to `/`, a "Search recipes" control and an "Add recipe" control to `/recipes/new`, all visible and activatable without a tap before them
- **proof:** e2e

#### Scenario: Tablet width uses the phone posture
- **WHEN** `/recipes` is opened at 768×1024 and at 1023×768, then at 1024×768
- **THEN** at the first two sizes the phone bar and the phone top strip are shown and no top bar, at 1024×768 the top bar and no phone bar
- **proof:** e2e

#### Scenario: Search recipes on the phone focuses the field
- **WHEN** at 390×844 "Search recipes" is chosen from Home, and again while on `/recipes`
- **THEN** each time `/recipes` is shown and the "Search recipes" field has focus
- **proof:** e2e

### Requirement: Unsaved recipe edits survive the new shell
On the recipe form, every in-app way out the new shell offers (area links and pills, the brand, "Search recipes", "Add recipe", the Home choice sheet's links) SHALL go through the unsaved-changes guard: with edits it SHALL cancel the navigation and ask "Discard changes?" with "Keep editing" and "Discard"; without edits it SHALL navigate at once.

#### Scenario: Phone pill on an edited form asks first
- **WHEN** at 390×844 a recipe's title is changed on its edit page, the field is blurred and the Plan pill is tapped; then "Keep editing" is chosen; then the pill is tapped again and "Discard" chosen
- **THEN** first "Discard changes?" is shown and the edit page stays with the changed title, then `/plan` is shown
- **proof:** e2e

#### Scenario: Top bar actions on an edited form ask first
- **WHEN** at 1280×800 the title on `/recipes/new/form` is typed and the brand link, then "Search recipes", then "Add recipe" are clicked, each answered with "Keep editing"
- **THEN** each click shows "Discard changes?" and the form keeps the typed title
- **proof:** e2e

#### Scenario: Unedited form leaves without asking
- **WHEN** a recipe's edit page is opened without changes and the List link is activated at 390×844 and at 1280×800
- **THEN** `/list` is shown and no dialog appeared
- **proof:** e2e

## MODIFIED Requirements

### Requirement: Area-aware header actions
The navigation's search and add actions SHALL depend on the area: on `/eating-out` and every page below it they SHALL read "Search spots" (→ `/eating-out#search`) and "Add spot" (→ `/eating-out/new`); everywhere else they SHALL read "Search recipes" (→ `/recipes`) and "Add recipe" (→ `/recipes/new`). This SHALL hold in the desktop top bar and in the phone top strip (gate 4, placement A). They SHALL update on client-side navigation without a reload.

#### Scenario: Header actions per area
- **WHEN** the header actions are derived for the areas home, recipes, plan, list and eating-out
- **THEN** the first four give "Search recipes" → `/recipes` and "Add recipe" → `/recipes/new`, and eating-out gives "Search spots" → `/eating-out#search` and "Add spot" → `/eating-out/new`
- **proof:** unit

#### Scenario: Eating Out header shows spot actions
- **WHEN** `/eating-out` and then `/plan` are opened at 1280×800
- **THEN** on Eating Out the header shows "Search spots" and "Add spot" with their hrefs and no recipe actions, and on Plan "Search recipes" and "Add recipe"
- **proof:** e2e

#### Scenario: Header follows client-side navigation
- **WHEN** at 1280×800 `/recipes` is opened, a marker is set on `window`, and the Eating Out nav item is clicked
- **THEN** the header shows "Search spots" and "Add spot" and the marker is still set (no reload)
- **proof:** e2e

#### Scenario: Phone offers the spot actions on Eating Out
- **WHEN** at 390×844 `/eating-out` is opened
- **THEN** the phone top strip shows the link "Rues Cooking Hub" to `/`, "Search spots" and "Add spot", all visible and activatable without a tap before them, and no "Search recipes" or "Add recipe" control is exposed
- **proof:** e2e

## REMOVED Requirements

### Requirement: Area navigation
**Reason**: Replaced by "Main navigation", "Desktop top bar" and "Phone bar" (S1, S2): five areas, phone pills with a round "+", scrolled state kept as `data-compact` with the presentation of the signed-off hi-fi (see "Main navigation").
**Migration**: The compact icon-only tab bar scenarios ("Compact tab bar shows icons only", "Reduced motion shrinks the tab bar instantly", "Nav shrink looks calm") are dropped with it; their tests in `e2e/nav.test.ts` are rewritten to the new scenarios by the shell unit. Gate 5 and checkpoint A keep no shrinking phone bar: the phone pill group is the opaque card in every state, and only the desktop top bar turns into the sticky capsule from 1100 px (see "Main navigation"). Retiring unit: the shell unit (14.2) for `e2e/nav.test.ts`, and for the `inline-size` exception of the old tab bar in `src/lib/motion.test.ts` (see "Motion module").

### Requirement: Desktop header fits at 1024 px
**Reason**: Folded into "Desktop top bar" ("Top bar fits from 1024 to 1280 px").
**Migration**: `e2e/nav-fit.test.ts` is rewritten to the new scenario by the shell unit.
