# Research: add-food-spots (explore, 2026-11-02)

## Codebase (explorer reports)

### Navigation
- One nav: `src/lib/nav.ts` (`Area` union, `areas` array, `activeArea(pathname)` by first path segment, falls back to home),
  `src/lib/shell/AppNav.svelte` (≥1024px top glass pill `data-nav="top"`, <1024px bottom pill bar `data-nav="bar"`,
  compact on scroll >48, `.tabbar.compact { inline-size: 248px }` = "four 44px targets"), `src/lib/ui/PillNav.svelte`
  (`<nav aria-label="Main"><ul><li><a>`, sliding active pill measured from link offsets, ResizeObserver).
- Divider: a `<li role="presentation" aria-hidden>` in the `{#each}`, driven by an optional flag on `NavItem`;
  phone `.bar li { flex: 1 }` → divider needs `flex: 0 0 auto`.
- Spec `openspec/specs/navigation/spec.md` hard-codes four areas (Home, Recipes, Plan, List) → delta needed.
- Tests asserting the list: `e2e/nav.test.ts` (labels/paths, compact `[0,0,0,0]`/`[1,1,1,1]`), `src/lib/nav.test.ts`
  (`toEqual` areas, activeArea mapping), `e2e/transitions.test.ts`, `e2e/journey.test.ts` click by label.
- Compact bar width must grow (~290px+ for 5 items + divider). At 390px 5 items ≈ 70px each.
- Icons: `src/lib/ui/Icon.svelte` has home, book, calendar, basket, search — no pin/fork icon yet.
- Header actions (search recipes, "Add recipe") are cooking-specific and show on every page.

### Data layer
- Migrations `migrations/NNNN_name.sql` (0001_tags, 0002_core), auto-applied by `src/lib/server/db.ts` `migrate()`.
- Recipe CRUD `src/lib/server/recipes.ts`, save `src/lib/recipes/save.ts` (`saveFromForm`), form actions on
  `+page.server.ts`; delete action redirects 303 to list.
- Images: shared `images` table, `storeImage` (sharp → webp ≤1600px), `/images/[id]`; form fields `image`, `imageUrl`, `removeImage`.
- Tags: `tags(id, name, name_key UNIQUE)` + `recipe_tags`; rename/delete/count are recipe-specific; `resetDb()` re-seeds 8 starter tags (Breakfast, Soup …).
- Favourite: `favourite` + `favourited_at`, POST `favourite=0|1`. No rating anywhere.
- Archive list: `src/lib/recipes/query.ts` (`q`, `tags`, `fav`, `sort`), `FilterBar.svelte`, `search_text` + `refreshSearchText`.
- Tests: `/__test/{reset,seed,clock}`, `SeedInput` (add `spots`), `resetDb()` explicit delete list (new tables before images/tags).

### Design system
- Light only, warm cream palette (ground, sand, surface, line, stone, ink, olive accent, brick 2nd accent, one dark tile).
- Fraunces display (italic accent word) + DM Sans; kicker 11–12px uppercase 0.2em; `.tnum` counters.
- Glass (≥0.72 opacity) for nav and recipe info panel. Motion transform/opacity only, `src/lib/motion.ts`.
- Centred column max 1200px, header + section headings on the column's left edge; desktop ≥1280 judged as seriously as phone.
- Card (`src/lib/ui/Card.svelte`): 5/4 photo, radius 24, heart overlay, h3 title, meta row + ≤2 small chips; ImagePlaceholder without photo.
- Detail: full-bleed hero + glass info panel; Edit / Delete; 404 for unknown id. Empty state: serif h2 + CTA + placeholder.
- Forms: `RecipeForm`, `ImageField`, `TagInput`, `Sheet` (`src/lib/plan/Sheet.svelte`), `DiscardDialog`, unsaved guard.
- Hard rules (tests): no raw colours outside `src/lib/styles/`; text/bg pairs ≥4.5:1 listed in `tokens.ts`; 44×44 targets on
  phone; **no external-origin requests** (fonts, images only own origin) → no embedded map tiles.

## Mobbin (iOS; apps confirmed: Beli, Places, corner, Swarm, The Infatuation, Google Maps, Mindtrip)
- Cards: Beli "Been" list — rank, name, "$$ | Brunch, Contemporary", neighbourhood + city, 0–10 score badge
  (screens/2020f649-d8b9-4741-ac5c-f2664b5eff50, order-matched). The Infatuation hit list — square photo + score badge,
  CUISINE | NEIGHBOURHOOD caps, note line (screens/35e750d2-1c03-4910-9453-c3c44fcf024e). Google Maps — photos, stars,
  cuisine, price, open/closed (screens/2a81f624-0abe-44e9-92ac-146324d4601b, order-matched).
- Status is shown by tab (Been / Want to Try), not a badge. Last visit date not on cards.
- Rating: Beli 3-way tap + pairwise comparisons → derived 0–10 score (flows/20addf5d-5722-4901-a7a8-469169be43a7,
  flows/ef2ca2d5-851b-4786-a1e8-b21832816347); corner 4-step disliked/okay/liked/favourite + visited/want toggle
  (screens/746b1040-11ec-4b1c-b12b-713de8936e61, order-matched); Swarm 3-level; Google 5 stars.
- Detail: Beli — tags, price | cuisine, neighbourhood, Website / Call / Directions pills, popular dishes
  (screens/bf589646-7c85-4c03-a51e-b7aad03aad11, order-matched); Polarsteps address/website rows with "Open"
  (screens/9b9605af-dac7-47aa-83b7-d41499d55868); Mindtrip "My tips" incl. favourite dish.
- Add on phone: Beli bottom sheet — one-tap rating, then optional rows (with whom, labels, notes, favourite dishes,
  photos, visit date). Places "Want to go | Been here" segmented toggle (screens/9f19d77d-e026-484c-b6a2-594ec2166657, order-matched).
- List: Beli tabs Been / Want to Try, chips City / Cuisine / Price, sort Score / Distance, map toggle.
