# Scope: add-food-spots

Triage: feature — new "Eating Out" area (own entity, migration, CRUD, list, rating, nav divider, Home section). Appetite: two evenings of flow runtime.

## Problem
Rue's household tracks what it cooks in the hub, but restaurants, cafés and other places it ate at or wants to try live
nowhere. Rue wants to log those spots, score them and find the good ones again, inside the same app but visibly set apart from cooking.

## Flows
- Add a spot: nav "Eating Out" → "Add spot" (page button; desktop header too) → form (name, status, …) → Save → spot detail.
- Want to go → Visited: spot detail → "Mark visited" → sheet with score field → Save → spot sits in Visited with its score.
- Browse: "Eating Out" → Visited | Want to go segment → search / tag / city / price filters, sort → card → detail.
- Edit: detail → Edit → form → Save → detail (Discard guard on leave with unsaved changes).
- Delete: detail → Delete → confirm → list.
- Open place: detail → "Open in Maps" / website link → external tab.
- Home: Home → "Top spots" row → card → detail, or "All spots" → Eating Out.
- Design check: mockup page → Rue approves → real UI is built.

## Entity model (confirmed with Rue)
- **Spot**: name (required), status `want` | `visited`, score (only when visited, required then), price level (optional, 1–4),
  city (optional), neighbourhood (optional), address (optional), website (optional), notes (optional), photo (optional),
  spot tags (0..n), created_at.
- **Spot tag**: own vocabulary, separate from recipe tags (no starter tags, recipe tags never show on spots and vice versa).
- One score per spot for the whole household. No visit history, no persons.

## In scope
- **S1** The main nav shows a fifth area "Eating Out" (map-pin icon) at `/eating-out`, after Home, Recipes, Plan and List.
  A small decorative divider sits between List and Eating Out in both the desktop top pill and the phone bottom bar.
  - edges: `/eating-out/*` sub-pages mark Eating Out active (aria-current), not Home · divider is `aria-hidden`, not focusable,
    not counted as a link · phone 390px and 320px: five labels fit without overflow, every target ≥44×44 · compact (scrolled)
    phone bar widens enough for five targets plus the divider · the sliding active pill still lands on the right link with the divider present.
- **S2** Spots are stored in SQLite through a new migration, with their own tag vocabulary; recipe tag management
  (rename, delete, counts) and recipe tags are unaffected.
  - edges: existing DB with recipes migrates without data loss · test reset clears spots and spot tags (before images) ·
    deleting a spot removes its photo and its tag links · a spot tag used by no spot no longer shows as a filter chip.
- **S3** Add spot form: name (required), status segment "Want to go | Visited" (default Want to go), score field shown only for
  Visited, spot tags (TagInput with spot-tag suggestions), city, neighbourhood, address, website, price level (€ … €€€€, clearable),
  notes, photo (upload, URL, remove — same ImageField as recipes). Save → detail.
  - edges: empty name → inline error, nothing saved · Visited without score → inline error · website not http(s) → inline error ·
    duplicate names allowed (chains in two cities) · leaving with unsaved changes → Discard dialog · photo too large / broken URL →
    same errors as recipes.
- **S4** Score is entered in a decimal number field (decimal keyboard on phone) and accepts 1.00 to 10.00 with at most two
  decimals; both "8.75" and "8,75" are accepted. It is always displayed with two decimals and a dot ("9.00", "8.75").
  - edges: "0.99", "10.01", "8.755", "abc", empty (when Visited) → inline error, form keeps the other values · "10" → 10.00 ·
    stored exactly (no float drift: 8.75 stays 8.75, e.g. stored as integer hundredths).
- **S5** Eating Out list has a "Visited | Want to go" segment with a count per side (default Visited; if Visited is empty and
  Want to go is not, default Want to go). Cards in a grid like the recipe archive.
  - edges: no spots at all → empty state ("Start your list"-style serif heading, short text, "Add spot" CTA, placeholder) ·
    one side empty → short empty line for that side with "Add spot" · segment, filters and sort live in the URL (reload/back keeps them).
- **S6** Spot card shows photo (5/4, placeholder when none), name, spot tags as small chips (≤2, like recipe cards),
  "Neighbourhood, City" (whichever exist), price level, and on Visited cards a score badge ("8.75").
  - edges: no city and no neighbourhood → no location text, no stray comma · long name wraps/clamps without breaking the
    grid · no price → nothing shown · Want to go cards have no badge.
- **S7** Search and filters: a search field (name, neighbourhood, city, tags, notes; case- and umlaut-insensitive like recipes),
  spot-tag chips, a city filter (cities in use), and a price filter (€ … €€€€). Filters combine with AND and apply within the
  current segment; segment counts reflect the active filters.
  - edges: no match → "no-match" state with a clear-filters action · city/tag lists only show values in use · a filter value
    that no longer exists (stale URL) is ignored, not an error.
- **S8** Sort: Score (Visited default), Newest (Want to go default), Name (A–Z, case-insensitive). Score sort is not offered on Want to go.
  - edges: equal scores → ordered by name · switching segment resets to that segment's default sort unless the URL names one valid for it.
- **S9** Rank numbers (#1, #2 …) appear on Visited cards only while sorted by Score, counted within the currently filtered
  list; equal scores share a rank (8.75, 8.75, 8.10 → #1, #1, #3). The detail page shows no rank.
  - edges: filters change → ranks recount from #1 · Name/Newest sort → no rank shown.
- **S10** Spot detail at `/eating-out/[id]`: hero photo (placeholder if none) with glass info panel (name, score badge on
  Visited, price, tags, "Neighbourhood, City"); below: Address row with "Open in Maps" (Google Maps search URL with name +
  address + city, new tab), Website row (new tab), Notes. Actions: Edit, Delete (confirm), and "Mark visited" on Want to go spots.
  - edges: unknown id → 404 · no address → no Address row and no Maps link · no website → no row · no notes → no Notes block ·
    Maps/website links open externally with `rel="noopener"`; the app itself makes no external request.
- **S11** "Mark visited" opens a sheet with the score field (same validation as S4); Save sets status Visited and the score,
  Cancel changes nothing.
  - edges: invalid score → inline error in the sheet, sheet stays open · after save the detail shows the score badge and no "Mark visited".
- **S12** Edit form = add form prefilled; switching a Visited spot to Want to go clears its score on save; switching to Visited requires a score.
  - edges: edit of a deleted spot → 404 · removing the photo deletes the image.
- **S13** Desktop header actions are context-aware: on `/eating-out` and its sub-pages they read "Search spots" (→ `/eating-out`,
  focus the search field) and "Add spot" (→ `/eating-out/new`); everywhere else they stay "Search recipes" / "Add recipe".
  Phone has no header; the Eating Out page carries its own "Add spot" button.
  - edges: header updates on client-side navigation between areas without reload.
- **S14** Home shows a "Top spots" section with the up to 4 highest-scored Visited spots (card style of S6, with score badge)
  and an "All spots" link to `/eating-out`, placed after "Recently added"; hidden when there is no Visited spot.
  - edges: fewer than 4 visited → shows what exists · the bento keeps exactly 4 `[data-tile]`s (section gets no `data-tile`) ·
    phone 2-col / desktop row like "Recently added".
- **S15** Mockup first: a static `/__mockups/eating-out` page (list with cards and ranks, detail, add form, Mark-visited sheet,
  Home "Top spots" row; phone and desktop) using CC0 photos, listed in the mockup/design e2e screen arrays. Rue approves it
  before the real UI units start; her corrections go into design.md and the specs first.
  - edges: mockup makes no external requests (photos are local fixtures).
- **S16** Test data: `/__test/seed` accepts spots (status, score, tags, city, price, `image: true`), and ~6 CC0 restaurant/café
  photos are stored once as fixtures (source + licence noted) for the mockup and Gate 2 screenshots.
  - edges: photo source down → second source; missing shapes covered by the existing synthetic test image.
- **S17** (Gate 1 addition a) At 1024px desktop width the brand, the five-item nav pill with divider and the header actions do not overlap.
  - edges: also checked with the Eating Out header actions ("Search spots", "Add spot").
- **S18** (Gate 1 addition b) Opening a spot from its card uses a shared photo view transition from card to spot hero, like recipes.
  - edges: reduced motion → instant/fade per design-system · no photo → placeholder morphs the same way.

## Non-goals
- Embedded map or map view — the app must not make external requests; "Open in Maps" links out instead.
- Visit history (several dated visits per spot), per-person scores, "who did you go with" — one household, one score.
- Beli-style pairwise ranking — rank is derived from the entered score only.
- Spot tag management page (rename/merge/delete) — unused tags simply drop out of the filters; can follow later.
- Planning a spot into the meal plan or shopping list — Eating Out stays its own area apart from Home's section.
- Opening hours, phone number, favourite-dishes list, visit date — notes cover these for now.
- Import of spots from Google Maps / Beli — manual entry only.
- Dark mode — the app is light-only.

## Codebase touchpoints
- `src/lib/nav.ts`, `src/lib/nav.test.ts` — `Area` union + `areas` gain `eating-out`, divider flag (explorer: navigation).
- `src/lib/ui/PillNav.svelte` — divider `<li role="presentation" aria-hidden>`; phone `.bar li { flex: 1 }` needs `flex: 0 0 auto` for it.
- `src/lib/shell/AppNav.svelte` — compact width 248px → ~290px+; context-aware header actions (explorer: home/header).
- `src/lib/ui/Icon.svelte` — new `pin` icon.
- `e2e/nav.test.ts` (labels/paths/compact arrays), `e2e/transitions.test.ts`, `e2e/journey.test.ts` — exact tab lists.
- `migrations/0003_food_spots.sql`; `src/lib/server/db.ts` `resetDb()` delete order (explorer: data layer).
- New `src/lib/server/spots.ts`, `src/lib/spots/*` (save, query, card, form), routes `src/routes/(app)/eating-out/{+page,new,[id],[id]/edit}`.
  Patterns: `src/lib/server/recipes.ts`, `src/lib/recipes/save.ts`, `query.ts`, `FilterBar.svelte`, `ImageField`, `TagInput`,
  `src/lib/plan/Sheet.svelte`, `DiscardDialog`, `DeleteRecipe`, `unsaved.ts`, `src/lib/server/images.ts`, `src/lib/ui/Card.svelte`, `Chip`, `ImagePlaceholder`, `GlassPanel`.
- `src/lib/server/tags.ts` — recipe-specific rename/delete/count stay recipe-only.
- `src/routes/(app)/+page.svelte` + `+page.server.ts` — "Top spots" section after "Recently added" (`.recent`/`.section-head` pattern); `e2e/home.test.ts` (4 tiles).
- `src/routes/__test/seed/+server.ts`, `e2e/helpers.ts` — `spots` in SeedInput/SeedResult.
- `src/routes/__mockups/eating-out/`, `e2e/mockups.test.ts`, `e2e/design.test.ts` — screen arrays.
- `src/lib/copy.ts` — English UI strings.
- Specs: navigation, home (deltas); new capability for eating out (planner names it).

## Risks
- R1 Five labels + divider in the 390px phone bar ("Eating Out" ≈55px at 11px in ≈70px slots) → accepted, covered by S1 edges (390 and 320 overflow + 44px checks); fallback is the planner's call only if a test proves it doesn't fit.
- R2 Exact-list nav tests across three e2e files break → accepted: planner lists them as owned by the nav unit.
- R3 Shared `tags` table is recipe-specific in places (rename/delete/count, starter tags re-seeded) → resolved: own spot-tag vocabulary (Rue), so recipe tag code stays untouched.
- R4 Score float drift (8.75 → 8.7499) and German comma input → resolved by S4 (integer hundredths, comma accepted).
- R5 CC0 photo sources flaky (Openverse 504s seen before) → accepted: two named sources (Openverse, Wikimedia Commons), cap ~10 fetches, synthetic fallback (S16).
- R6 Mockup approval pauses the build between waves → accepted: Rue chose mockup-first; the orchestrator asks after the mockup wave.

## Decisions
- Tab label "Eating Out", route `/eating-out`, map-pin icon, placed last after a divider — Rue: content is different from cooking.
- Status Want to go / Visited; Visited always has a score, set via "Mark visited" — Rue.
- Score 1.00–10.00, two decimals, number field — Rue; comma accepted and dot display — German keyboard vs English UI.
- One score per spot — Rue: one household.
- Separate spot tags — Rue: recipe tags (Soup, Breakfast …) don't belong on spots.
- City and neighbourhood as separate fields, city filterable — Rue.
- Card: photo, tags, location, price (+ score badge on Visited) — Rue; no notes snippet on card.
- Detail extras: address + Open in Maps, website, notes — Rue.
- Rank within the filtered list, no rank on detail — Rue; ties share a rank — standard competition ranking, so equal scores look equal.
- Header actions context-aware — Rue. Home "Top spots" (top 4) — Rue. Otherwise no integration with plan/list — Rue.
- Price € … €€€€, optional — Rue.
- Mockup first with CC0 photos — Rue.
- Gate 1: additions (a) desktop fit at 1024px and (b) card→hero photo transition accepted; (c) accent-insensitive search declined — search behaves like Recipes.

## Done when
- Rue sees Eating Out after a divider in the nav on phone and desktop, adds a want-to-go spot, marks it visited with 8.75, and finds it ranked in Visited.
- Filtering by city / tag / price and searching narrows the list and ranks recount; reload keeps the view.
- Detail links open Google Maps and the website; edit and delete work; Home shows Top spots.
- `proof:full` is green, including the updated nav tests on both projects.
- Rue approved the mockup before the UI was built, and the Gate 2 screenshots match it.

## Split off
- none (candidates for later: spot tag management, visit history, plan integration)
