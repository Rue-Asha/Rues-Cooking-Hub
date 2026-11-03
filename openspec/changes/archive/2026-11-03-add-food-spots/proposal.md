## Why

Rue's household tracks what it cooks in the hub, but restaurants, cafés and other places it ate at or wants to try live
nowhere. Rue wants to log those spots, score them and find the good ones again, inside the same app but visibly set apart from cooking.

## What Changes

- A fifth area **Eating Out** (`/eating-out`, map-pin icon) after Home, Recipes, Plan and List, set apart by a small
  decorative divider in the desktop top pill and the phone bottom bar; desktop header actions become area-aware
  ("Search spots" / "Add spot" on Eating Out).
- A new **Spot** entity in SQLite (migration `0003_food_spots.sql`) with its own spot-tag vocabulary, separate from
  recipe tags: name, status Want to go / Visited, score (Visited only), price level, city, neighbourhood, address,
  website, notes, photo, tags.
- Spot CRUD: add form (status segment, score field shown for Visited, same ImageField and TagInput as recipes, Discard
  guard), edit, delete, and a "Mark visited" sheet.
- Score 1.00–10.00 with two decimals, comma or dot accepted, stored as integer hundredths, always shown as "8.75".
- Eating Out list: Visited | Want to go segment with filtered counts, card grid like the archive, search (case- and
  umlaut-folding like recipes), spot-tag / city / price filters, sort (Score, Newest, Name), competition ranks
  (#1, #1, #3) on Visited cards while sorted by score; the whole view lives in the URL.
- Spot detail at `/eating-out/[id]` with hero, glass info panel, Address row with "Open in Maps" (Google Maps
  search link), Website row, Notes, Edit / Delete / Mark visited.
- Opening a spot from its card carries the photo into the spot hero (shared-element view transition, like recipes).
- The desktop header (brand, five-item pill with divider, header actions) fits without overlap from 1024 px.
- Home: a "Top spots" section (up to 4 best Visited spots) after "Recently added".
- Mockup first: a static `/__mockups/eating-out` page with ~6 CC0 restaurant/café photos, approved by Rue before the
  real Eating Out UI is built.
- Test data: `/__test/seed` accepts spots, `/__test/reset` clears them.
- Release 0.2.0 (feature → minor bump).

## Non-Goals

- Embedded map or map view — the app must not make external requests; "Open in Maps" links out instead.
- Visit history (several dated visits per spot), per-person scores, "who did you go with" — one household, one score.
- Beli-style pairwise ranking — rank is derived from the entered score only.
- Spot tag management page (rename/merge/delete) — unused tags simply drop out of the filters; can follow later.
- Planning a spot into the meal plan or shopping list — Eating Out stays its own area apart from Home's section.
- Opening hours, phone number, favourite-dishes list, visit date — notes cover these for now.
- Import of spots from Google Maps / Beli — manual entry only.
- Dark mode — the app is light-only.

## Done criteria

- [ ] Rue sees Eating Out after a divider in the nav on phone and desktop, adds a want-to-go spot, marks it visited with 8.75, and finds it ranked in Visited.
- [ ] Filtering by city / tag / price and searching narrows the list and ranks recount; reload keeps the view.
- [ ] Detail links open Google Maps and the website; edit and delete work; Home shows Top spots.
- [ ] `proof:full` is green, including the updated nav tests on both projects.
- [ ] Rue approved the mockup before the UI was built, and the Gate 2 screenshots match it.
- [ ] `package.json` and the lockfile say 0.2.0; tag `v0.2.0` is pushed at Ship.

## Appetite

Two evenings of flow runtime.

## Capabilities

### New Capabilities
- `eating-out`: spot storage and spot tags, score input/display, add/edit form, list with segments, cards, search,
  filters, sort and ranks, spot detail with external links, Mark visited, delete.

### Modified Capabilities
- `navigation`: five areas with a divider before Eating Out, phone-bar fit at 390 and 320 px, compact bar width,
  area-aware desktop header actions, desktop header fit at 1024 px.
- `home`: a "Top spots" section after "Recently added".
- `design-system`: the Eating Out mockup screen and its CC0 photos join the mockup set and the approval stop.
- `harness`: reset clears spots and spot tags; seed accepts spots.
- `release`: version 0.2.0.

## Impact

- New: `migrations/0003_food_spots.sql`, `src/lib/server/spots.ts`, `src/lib/spots/*`, routes
  `src/routes/(app)/eating-out/{+page,new,[id],[id]/edit}`, `src/routes/__mockups/eating-out/`, spot photos in
  `static/mockups/`.
- Changed: `src/lib/nav.ts`, `src/lib/ui/PillNav.svelte`, `src/lib/ui/Icon.svelte`, `src/lib/ui/Card.svelte`,
  `src/lib/shell/AppNav.svelte`, `src/lib/plan/Sheet.svelte` (aria-hidden while closing), `src/lib/types.ts`,
  `src/lib/copy.ts`, `src/lib/recipes/save.ts` (exports `resolveImage`), `src/lib/server/db.ts` (`resetDb`),
  `src/routes/__test/seed`, Home route, mockup layout and the nav / mockup / design e2e files.
- Recipe tags, tag manager and every recipe flow stay unchanged. No new dependency. No external request.
- Existing databases migrate forward on start (additive tables only).
