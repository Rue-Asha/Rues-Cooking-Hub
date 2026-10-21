verified-at: aa5251e

# Verification: build-cooking-hub

## Layer 1: `npm run proof:full`

Result: PROOF-OK, 0 failed (`rg -c "✘"` finds nothing). 381 passed, 29 skipped (all by design: server-only / desktop-only / phone-only tests skip in the other project). Unit: 29 files, 318 tests passed.

```
  ✓  407 [desktop] › e2e/transitions.test.ts:27:1 › Scenario: Area change uses a view transition (182ms)
  ✓  408 [desktop] › e2e/transitions.test.ts:34:1 › Scenario: Browser without View Transitions navigates instantly (191ms)
  ✓  409 [desktop] › e2e/transitions.test.ts:49:1 › Scenario: Reduced motion skips the page transition (176ms)
  ✓  410 [desktop] › e2e/transitions.test.ts:57:1 › Navigation inside one area skips the page transition (167ms)

  29 skipped
  381 passed (5.9m)
```

## Layer 2: spec coverage

Scenarios: 249 (14 specs). unit 96 (all ✓), e2e 125 (all ✓), manual 28. Gaps: none.

| Capability | Scenario | proof | Evidence |
|---|---|---|---|
| archive | Cards show image, title, description, time and tags | e2e | `e2e/archive.test.ts` › "Scenario: Cards show image, title, description, time and tags" ✓ (phone, desktop) |
| archive | Empty archive invites the first recipe | e2e | `e2e/archive.test.ts` › "Scenario: Empty archive invites the first recipe" ✓ (phone, desktop) |
| archive | Card without description shows title and meta | e2e | `e2e/archive.test.ts` › "Scenario: Card without description shows title and meta" ✓ (phone, desktop) |
| archive | Long titles and descriptions are clamped | e2e | `e2e/archive.test.ts` › "Scenario: Long titles and descriptions are clamped" ✓ (phone, desktop) |
| archive | Card without image shows the placeholder | e2e | `e2e/archive.test.ts` › "Scenario: Card without image shows the placeholder" ✓ (phone, desktop) |
| archive | Recipe without times shows no time on its card | e2e | `e2e/archive.test.ts` › "Scenario: Recipe without times shows no time on its card" ✓ (phone, desktop) |
| archive | Cards enter staggered | e2e | `e2e/archive-motion.test.ts` › "Scenario: Cards enter staggered" ✓ (phone, desktop) |
| archive | Reduced motion shows cards without entrance animation | e2e | `e2e/archive-motion.test.ts` › "Scenario: Reduced motion shows cards without entrance animation" ✓ (phone, desktop) |
| archive | Card entrance looks lively and calm | manual (visual judgement by Rue) | manual: on checklist below |
| archive | Featured query returns the seven newest recipes | unit | `src/lib/server/archive.test.ts` › "Scenario: Featured query returns the seven newest recipes" ✓ (unit) |
| archive | Featured stack shows the seven newest | e2e | `e2e/featured.test.ts` › "Scenario: Featured stack shows the seven newest" ✓ (phone, desktop) |
| archive | Featured with fewer than seven counts what exists | e2e | `e2e/featured.test.ts` › "Scenario: Featured with fewer than seven counts what exists" ✓ (phone, desktop) |
| archive | Single featured recipe has no arrows | e2e | `e2e/featured.test.ts` › "Scenario: Single featured recipe has no arrows" ✓ (phone, desktop) |
| archive | Arrows and keyboard step through the stack | e2e | `e2e/featured.test.ts` › "Scenario: Arrows and keyboard step through the stack" ✓ (desktop) |
| archive | Swipe steps through the stack on phone | e2e | `e2e/featured.test.ts` › "Scenario: Swipe steps through the stack on phone" ✓ (phone) |
| archive | Featured stack ignores the filters | e2e | `e2e/featured.test.ts` › "Scenario: Featured stack ignores the filters" ✓ (phone, desktop) |
| archive | Featured stack looks like a coverflow | manual (visual judgement by Rue) | manual: on checklist below |
| archive | Several tags show recipes having all of them | e2e | `e2e/archive-filters.test.ts` › "Scenario: Several tags show recipes having all of them" ✓ (phone, desktop) |
| archive | Tag filter requires all tags on the server | unit | `src/lib/server/archive.test.ts` › "Scenario: Tag filter requires all tags on the server" ✓ (unit) |
| archive | Favourites-only toggle | e2e | `e2e/archive-filters.test.ts` › "Scenario: Favourites-only toggle" ✓ (phone, desktop) |
| archive | No match offers to clear filters | e2e | `e2e/archive-filters.test.ts` › "Scenario: No match offers to clear filters" ✓ (phone, desktop) |
| archive | Filter state survives reload and back | e2e | `e2e/archive-filters.test.ts` › "Scenario: Filter state survives reload and back" ✓ (phone, desktop) |
| archive | Filtered cards glide to new positions | e2e | `e2e/archive-motion.test.ts` › "Scenario: Filtered cards glide to new positions" ✓ (phone, desktop) |
| archive | Reduced motion filters without gliding | e2e | `e2e/archive-motion.test.ts` › "Scenario: Reduced motion filters without gliding" ✓ (phone, desktop) |
| archive | Filter gliding looks smooth | manual (visual judgement by Rue) | manual: on checklist below |
| archive | Search covers title, description, ingredients and tags | unit | `src/lib/server/archive.test.ts` › "Scenario: Search covers title, description, ingredients and tags" ✓ (unit) |
| archive | Search ignores case for umlauts | unit | `src/lib/server/archive.test.ts` › "Scenario: Search ignores case for umlauts" ✓ (unit) |
| archive | Empty search returns all recipes | unit | `src/lib/server/archive.test.ts` › "Scenario: Empty search returns all recipes" ✓ (unit) |
| archive | Search combines with the tag filter | unit | `src/lib/server/archive.test.ts` › "Scenario: Search combines with the tag filter" ✓ (unit) |
| archive | Search from the archive | e2e | `e2e/archive-filters.test.ts` › "Scenario: Search from the archive" ✓ (phone, desktop) |
| archive | Search without match shows the empty state | e2e | `e2e/archive-filters.test.ts` › "Scenario: Search without match shows the empty state" ✓ (phone, desktop) |
| archive | Newest first by default | unit | `src/lib/server/archive.test.ts` › "Scenario: Newest first by default" ✓ (unit) |
| archive | Sort by title | unit | `src/lib/server/archive.test.ts` › "Scenario: Sort by title" ✓ (unit) |
| archive | Sort by total time puts recipes without time last | unit | `src/lib/server/archive.test.ts` › "Scenario: Sort by total time puts recipes without time last" ✓ (unit) |
| archive | Sort choice in the archive | e2e | `e2e/archive-filters.test.ts` › "Scenario: Sort choice in the archive" ✓ (phone, desktop) |
| archive | Favourite toggles on a card | e2e | `e2e/archive.test.ts` › "Scenario: Favourite toggles on a card" ✓ (phone, desktop) |
| archive | Favourite toggle feels alive | manual (visual judgement by Rue) | manual: on checklist below |
| design-system | Text contrast meets 4.5:1 | unit | `src/lib/styles/tokens.test.ts` › "Scenario: Text contrast meets 4.5:1" ✓ (unit) |
| design-system | Glass panel text stays legible over any photo | unit | `src/lib/styles/tokens.test.ts` › "Scenario: Glass panel text stays legible over any photo" ✓ (unit) |
| design-system | Components use no raw colour | unit | `src/lib/motion.test.ts` › "Scenario: Components use no raw colour" ✓ (unit) |
| design-system | Dark colour scheme preference changes nothing | e2e | `e2e/design.test.ts` › "Scenario: Dark colour scheme preference changes nothing" ✓ (phone, desktop, 14 runs) |
| design-system | Pages load no external resources | e2e | `e2e/design.test.ts` › "Scenario: Pages load no external resources" ✓ (phone, desktop, 14 runs) |
| design-system | Display and text fonts load from the app | e2e | `e2e/design.test.ts` › "Scenario: Display and text fonts load from the app" ✓ (phone, desktop, 14 runs) |
| design-system | Controls are at least 44px on phone | e2e | `e2e/design.test.ts` › "Scenario: Controls are at least 44px on phone" ✓ (phone, 7 runs) |
| design-system | Components match the visual brief | manual (visual judgement by Rue at the mockup stop) | manual: on checklist below |
| design-system | Reduced motion makes transitions instant | unit | `src/lib/motion.test.ts` › "Scenario: Reduced motion makes transitions instant" ✓ (unit) |
| design-system | Motion animates only transform and opacity | unit | `src/lib/motion.test.ts` › "Scenario: Motion animates only transform and opacity" ✓ (unit) |
| design-system | Mockup screenshots are produced for both viewports | e2e | `e2e/mockups.test.ts` › "Scenario: Mockup screenshots are produced for both viewports" ✓ (phone, desktop, 14 runs) |
| design-system | Every mockup photo is credited | unit | `src/lib/mockups/credits.test.ts` › "Scenario: Every mockup photo is credited" ✓ (unit) |
| design-system | Mockup routes are hidden without the test flag | unit | `src/routes/__mockups/mockups-guard.test.ts` › "Scenario: Mockup routes are hidden without the test flag" ✓ (unit) |
| design-system | Main screens share one alignment rule | e2e | `e2e/design.test.ts` › "Scenario: Main screens share one alignment rule" ✓ (phone, desktop, 14 runs) |
| design-system | Rue approves the mockups | manual (taste stop; visual judgement by Rue) | manual: on checklist below |
| design-system | Requested changes revise the mockups | manual (taste stop; visual judgement by Rue) | manual: on checklist below |
| harness | Proof prints test names and passes | manual (infrastructure; proven by running it, its output is the evidence every other unit relies on) | manual: on checklist below |
| harness | Proof fails on a failing check | manual (infrastructure; proven once in U1 with a deliberately failing test, then reverted) | manual: on checklist below |
| harness | Proof-full runs e2e on an isolated database | manual (infrastructure; proven by running it in U1) | manual: on checklist below |
| harness | Each e2e test runs on phone and desktop | manual (suite structure; read from the proof:full list output at Gate 2) | manual: on checklist below |
| harness | App is hydrated before tests interact | e2e | `e2e/test-routes.test.ts` › "Scenario: App is hydrated before tests interact" ✓ (phone, desktop) |
| harness | Test routes answer 404 without the test flag | unit | `src/routes/__test/test-routes.test.ts` › "Scenario: Test routes answer 404 without the test flag" ✓ (unit) |
| harness | Reset leaves an empty archive with the starter tags | e2e | `e2e/test-routes.test.ts` › "Scenario: Reset leaves an empty archive with the starter tags" ✓ (desktop) |
| harness | Seed returns the ids of what it inserted | e2e | `e2e/test-routes.test.ts` › "Scenario: Seed returns the ids of what it inserted" ✓ (desktop) |
| harness | Test clock sets today | unit | `src/lib/server/clock.test.ts` › "Scenario: Test clock sets today" ✓ (unit) |
| harness | Package produces a verifiable tarball | unit | `scripts/package.test.ts` › "Scenario: Package produces a verifiable tarball" ✓ (unit) |
| harness | Harness declared with merge and tag policy | manual (documentation; checked by reading the file at Gate 2) | manual: on checklist below |
| home | Dashboard prefers today's dinner | unit | `src/lib/server/home.test.ts` › "Scenario: Dashboard prefers today's dinner" ✓ (unit) |
| home | Dashboard falls back to the first recipe entry of today | unit | `src/lib/server/home.test.ts` › "Scenario: Dashboard falls back to the first recipe entry of today" ✓ (unit) |
| home | Hero shows today's planned recipe | e2e | `e2e/home.test.ts` › "Scenario: Hero shows today's planned recipe" ✓ (phone, desktop) |
| home | Nothing planned today shows the newest recipe | e2e | `e2e/home.test.ts` › "Scenario: Nothing planned today shows the newest recipe" ✓ (phone, desktop) |
| home | Empty archive shows the welcome hero | e2e | `e2e/home.test.ts` › "Scenario: Empty archive shows the welcome hero" ✓ (phone, desktop) |
| home | This week tile lists the seven days | e2e | `e2e/home.test.ts` › "Scenario: This week tile lists the seven days" ✓ (phone, desktop) |
| home | Shopping tile shows open count and first items | e2e | `e2e/home.test.ts` › "Scenario: Shopping tile shows open count and first items" ✓ (phone, desktop) |
| home | Empty list tile says List is empty | e2e | `e2e/home.test.ts` › "Scenario: Empty list tile says List is empty" ✓ (phone, desktop) |
| home | Favourite tile shows the most recently favourited recipe | e2e | `e2e/home.test.ts` › "Scenario: Favourite tile shows the most recently favourited recipe" ✓ (phone, desktop) |
| home | No favourites invites to favourite | e2e | `e2e/home.test.ts` › "Scenario: No favourites invites to favourite" ✓ (phone, desktop) |
| home | Dashboard looks like the approved mockup | manual (visual judgement by Rue) | manual: on checklist below |
| ingredients | Integer quantity with unit | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Integer quantity with unit" ✓ (unit) |
| ingredients | Decimal quantity | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Decimal quantity" ✓ (unit) |
| ingredients | Comma decimal | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Comma decimal" ✓ (unit) |
| ingredients | Mixed and unicode fractions | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Mixed and unicode fractions" ✓ (unit, 3 tests) |
| ingredients | Range uses the upper bound | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Range uses the upper bound" ✓ (unit, 2 tests) |
| ingredients | Attached unit | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Attached unit" ✓ (unit, 2 tests) |
| ingredients | Trailing note is split off | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Trailing note is split off" ✓ (unit, 4 tests) |
| ingredients | Count without unit | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Count without unit" ✓ (unit) |
| ingredients | Line without quantity | unit | `src/lib/shopping/aggregate.test.ts, src/lib/ingredients/parse.test.ts` › "Scenario: Line without quantity" ✓ (unit, 3 tests) |
| ingredients | Unparseable line becomes the name | unit | `src/lib/ingredients/parse.test.ts` › "Scenario: Unparseable line becomes the name" ✓ (unit, 3 tests) |
| ingredients | Parse preview updates while typing | e2e | `e2e/recipe-form.test.ts` › "Scenario: Parse preview updates while typing" ✓ (phone, desktop) |
| meal-plan | Week query returns entries in day, slot and position order | unit | `src/lib/server/plan.test.ts` › "Scenario: Week query returns entries in day, slot and position order" ✓ (unit) |
| meal-plan | Week shows Monday to Sunday with four slots | e2e | `e2e/plan.test.ts` › "Scenario: Week shows Monday to Sunday with four slots" ✓ (phone, desktop) |
| meal-plan | Today is highlighted | e2e | `e2e/plan.test.ts` › "Scenario: Today is highlighted" ✓ (phone, desktop) |
| meal-plan | Previous, next and This week | e2e | `e2e/plan.test.ts` › "Scenario: Previous, next and This week" ✓ (phone, desktop) |
| meal-plan | Empty week shows add affordances | e2e | `e2e/plan.test.ts` › "Scenario: Empty week shows add affordances" ✓ (phone, desktop) |
| meal-plan | Phone stacks the days and desktop shows the grid | e2e | `e2e/plan.test.ts` › "Scenario: Phone stacks the days and desktop shows the grid" ✓ (phone, desktop) |
| meal-plan | Empty free text is rejected | unit | `src/lib/server/plan.test.ts` › "Scenario: Empty free text is rejected" ✓ (unit) |
| meal-plan | Servings below 1 are rejected in the plan | unit | `src/lib/server/plan.test.ts` › "Scenario: Servings below 1 are rejected in the plan" ✓ (unit) |
| meal-plan | Entry servings and text can be edited | unit | `src/lib/server/plan.test.ts` › "Scenario: Entry servings and text can be edited" ✓ (unit) |
| meal-plan | Add a recipe entry with the picker | e2e | `e2e/plan-entries.test.ts` › "Scenario: Add a recipe entry with the picker" ✓ (phone, desktop) |
| meal-plan | Add a free-text entry | e2e | `e2e/plan-entries.test.ts` › "Scenario: Add a free-text entry" ✓ (phone, desktop) |
| meal-plan | Empty free text shows an error | e2e | `e2e/plan-entries.test.ts` › "Scenario: Empty free text shows an error" ✓ (phone, desktop) |
| meal-plan | Edit and delete an entry | e2e | `e2e/plan-entries.test.ts` › "Scenario: Edit and delete an entry" ✓ (phone, desktop) |
| meal-plan | Moving an entry reorders the slot | unit | `src/lib/server/plan.test.ts` › "Scenario: Moving an entry reorders the slot" ✓ (unit) |
| meal-plan | Drag a recipe from the rail onto a slot | e2e | `e2e/plan-move.test.ts` › "Scenario: Drag a recipe from the rail onto a slot" ✓ (desktop) |
| meal-plan | Drag an entry to another day | e2e | `e2e/plan-move.test.ts` › "Scenario: Drag an entry to another day" ✓ (desktop) |
| meal-plan | Reorder entries within a slot | e2e | `e2e/plan-move.test.ts` › "Scenario: Reorder entries within a slot" ✓ (desktop) |
| meal-plan | Drop target is highlighted | e2e | `e2e/plan-move.test.ts` › "Scenario: Drop target is highlighted" ✓ (desktop) |
| meal-plan | Drop outside a slot changes nothing | e2e | `e2e/plan-move.test.ts` › "Scenario: Drop outside a slot changes nothing" ✓ (desktop) |
| meal-plan | Move to moves an entry on phone | e2e | `e2e/plan-move.test.ts` › "Scenario: Move to moves an entry on phone" ✓ (phone) |
| meal-plan | Move to is the keyboard alternative on desktop | e2e | `e2e/plan-move.test.ts` › "Scenario: Move to is the keyboard alternative on desktop" ✓ (desktop) |
| meal-plan | Copy week appends after existing entries | unit | `src/lib/server/plan.test.ts` › "Scenario: Copy week appends after existing entries" ✓ (unit) |
| meal-plan | Copy from an empty week changes nothing | unit | `src/lib/server/plan.test.ts` › "Scenario: Copy from an empty week changes nothing" ✓ (unit) |
| meal-plan | Copy the previous week | e2e | `e2e/plan-copy.test.ts` › "Scenario: Copy the previous week" ✓ (phone, desktop) |
| meal-plan | Copy into a week with entries asks first | e2e | `e2e/plan-copy.test.ts` › "Scenario: Copy into a week with entries asks first" ✓ (phone, desktop) |
| meal-plan | Nothing to copy | e2e | `e2e/plan-copy.test.ts` › "Scenario: Nothing to copy" ✓ (phone, desktop) |
| navigation | Desktop shows the top pill nav | e2e | `e2e/nav.test.ts` › "Scenario: Desktop shows the top pill nav" ✓ (desktop) |
| navigation | Phone shows the bottom tab bar | e2e | `e2e/nav.test.ts` › "Scenario: Phone shows the bottom tab bar" ✓ (phone) |
| navigation | Active area is marked | unit | `src/lib/nav.test.ts` › "Scenario: Active area is marked" ✓ (unit) |
| navigation | Nav marks the open area | e2e | `e2e/nav.test.ts` › "Scenario: Nav marks the open area" ✓ (phone, desktop) |
| navigation | Tablet and phone landscape use one layout without overlap | e2e | `e2e/nav.test.ts` › "Scenario: Tablet and phone landscape use one layout without overlap" ✓ (phone) |
| navigation | Nav shrinks on scroll | e2e | `e2e/nav.test.ts` › "Scenario: Nav shrinks on scroll" ✓ (phone, desktop) |
| navigation | Compact tab bar shows icons only | e2e | `e2e/nav.test.ts` › "Scenario: Compact tab bar shows icons only" ✓ (phone) |
| navigation | Reduced motion shrinks the tab bar instantly | e2e | `e2e/nav.test.ts` › "Scenario: Reduced motion shrinks the tab bar instantly" ✓ (phone) |
| navigation | Nav shrink looks calm | manual (visual judgement by Rue) | manual: on checklist below |
| navigation | Area change uses a view transition | e2e | `e2e/transitions.test.ts` › "Scenario: Area change uses a view transition" ✓ (phone, desktop) |
| navigation | Browser without View Transitions navigates instantly | e2e | `e2e/transitions.test.ts` › "Scenario: Browser without View Transitions navigates instantly" ✓ (phone, desktop) |
| navigation | Reduced motion skips the page transition | e2e | `e2e/transitions.test.ts` › "Scenario: Reduced motion skips the page transition" ✓ (phone, desktop) |
| navigation | Page transition looks calm | manual (visual judgement by Rue) | manual: on checklist below |
| recipe-detail | Recipe page shows hero, info panel, sections and notes | e2e | `e2e/recipe-page.test.ts` › "Scenario: Recipe page shows hero, info panel, sections and notes" ✓ (phone, desktop) |
| recipe-detail | Recipe page without image shows the placeholder hero | e2e | `e2e/recipe-page.test.ts` › "Scenario: Recipe page without image shows the placeholder hero" ✓ (phone, desktop) |
| recipe-detail | Recipe page without source URL shows no source link | e2e | `e2e/recipe-page.test.ts` › "Scenario: Recipe page without source URL shows no source link" ✓ (phone, desktop) |
| recipe-detail | Recipe without times shows no times on its page | e2e | `e2e/recipe-page.test.ts` › "Scenario: Recipe without times shows no times on its page" ✓ (phone, desktop) |
| recipe-detail | Unknown recipe answers 404 | e2e | `e2e/recipe-page.test.ts` › "Scenario: Unknown recipe answers 404" ✓ (phone, desktop) |
| recipe-detail | Favourite toggles on the recipe page | e2e | `e2e/recipe-page.test.ts` › "Scenario: Favourite toggles on the recipe page" ✓ (phone, desktop) |
| recipe-detail | Hero moves on scroll | e2e | `e2e/recipe-motion.test.ts` › "Scenario: Hero moves on scroll" ✓ (phone, desktop) |
| recipe-detail | Reduced motion keeps the hero still | e2e | `e2e/recipe-motion.test.ts` › "Scenario: Reduced motion keeps the hero still" ✓ (phone, desktop) |
| recipe-detail | Card and recipe page share the hero image | e2e | `e2e/recipe-motion.test.ts` › "Scenario: Card and recipe page share the hero image" ✓ (phone, desktop) |
| recipe-detail | Reduced motion skips the shared element | e2e | `e2e/recipe-motion.test.ts` › "Scenario: Reduced motion skips the shared element" ✓ (phone, desktop) |
| recipe-detail | Hero parallax and shared element look smooth | manual (visual judgement by Rue) | manual: on checklist below |
| recipe-detail | Add to plan from the recipe | e2e | `e2e/recipe-page.test.ts` › "Scenario: Add to plan from the recipe" ✓ (phone, desktop) |
| recipe-detail | Servings below 1 are rejected when adding from the recipe | e2e | `e2e/recipe-page.test.ts` › "Scenario: Servings below 1 are rejected when adding from the recipe" ✓ (phone, desktop) |
| recipe-import | Recipe is read from saved real pages | unit | `src/lib/server/import.test.ts` › "Scenario: Recipe is read from saved real pages" ✓ (unit) |
| recipe-import | Recipe found inside @graph | unit | `src/lib/server/import.test.ts` › "Scenario: Recipe found inside @graph" ✓ (unit) |
| recipe-import | HowToSection becomes step sections | unit | `src/lib/server/import.test.ts` › "Scenario: HowToSection becomes step sections" ✓ (unit) |
| recipe-import | ISO 8601 durations become minutes | unit | `src/lib/server/import.test.ts` › "Scenario: ISO 8601 durations become minutes" ✓ (unit) |
| recipe-import | recipeYield becomes servings | unit | `src/lib/server/import.test.ts` › "Scenario: recipeYield becomes servings" ✓ (unit) |
| recipe-import | Categories and keywords become tag names | unit | `src/lib/server/import.test.ts` › "Scenario: Categories and keywords become tag names" ✓ (unit) |
| recipe-import | Relative image URL is resolved | unit | `src/lib/server/import.test.ts` › "Scenario: Relative image URL is resolved" ✓ (unit) |
| recipe-import | Page without Recipe data falls back to meta tags | unit | `src/lib/server/import.test.ts` › "Scenario: Page without Recipe data falls back to meta tags" ✓ (unit) |
| recipe-import | Unreachable page is a fallback | unit | `src/lib/server/import.test.ts` › "Scenario: Unreachable page is a fallback" ✓ (unit) |
| recipe-import | Blocked page is a fallback | unit | `src/lib/server/import.test.ts` › "Scenario: Blocked page is a fallback" ✓ (unit) |
| recipe-import | Slow page times out | unit | `src/lib/server/import.test.ts` › "Scenario: Slow page times out" ✓ (unit) |
| recipe-import | Oversized page is a fallback | unit | `src/lib/server/import.test.ts` › "Scenario: Oversized page is a fallback" ✓ (unit) |
| recipe-import | Only http and https URLs are fetched | unit | `src/lib/server/import.test.ts` › "Scenario: Only http and https URLs are fetched" ✓ (unit) |
| recipe-import | Import shows an editable preview | e2e | `e2e/import.test.ts` › "Scenario: Import shows an editable preview" ✓ (phone, desktop) |
| recipe-import | Imported tags reuse existing tags | e2e | `e2e/import.test.ts` › "Scenario: Imported tags reuse existing tags" ✓ (phone, desktop) |
| recipe-import | Import failure opens the prefilled manual form | e2e | `e2e/import.test.ts` › "Scenario: Import failure opens the prefilled manual form" ✓ (phone, desktop) |
| recipe-import | Invalid URL shows an inline error | e2e | `e2e/import.test.ts` › "Scenario: Invalid URL shows an inline error" ✓ (phone, desktop) |
| recipe-import | Known URL offers the existing recipe | e2e | `e2e/import.test.ts` › "Scenario: Known URL offers the existing recipe" ✓ (phone, desktop) |
| recipe-import | Known URL matches however the source was saved | unit | `src/lib/recipes/save.test.ts` › "Scenario: Known URL matches however the source was saved" ✓ (unit) |
| recipe-import | Image download failure saves without image | e2e | `e2e/import.test.ts` › "Scenario: Image download failure saves without image" ✓ (phone, desktop) |
| recipe-import | Importing a real recipe URL | manual (needs the internet and a real site; tests never hit the network) | manual: on checklist below |
| recipes | Recipe saved with all fields | unit | `src/lib/server/recipes.test.ts` › "Scenario: Recipe saved with all fields" ✓ (unit) |
| recipes | Server rejects invalid recipe input | unit | `src/lib/server/recipes.test.ts` › "Scenario: Server rejects invalid recipe input" ✓ (unit) |
| recipes | Empty title blocks saving the form | e2e | `e2e/recipe-form.test.ts` › "Scenario: Empty title blocks saving the form" ✓ (phone, desktop) |
| recipes | Servings below 1 are rejected in the form | e2e | `e2e/recipe-form.test.ts` › "Scenario: Servings below 1 are rejected in the form" ✓ (phone, desktop) |
| recipes | New recipe defaults to 2 servings | e2e | `e2e/recipe-form.test.ts` › "Scenario: New recipe defaults to 2 servings" ✓ (phone, desktop) |
| recipes | Recipe created from scratch | e2e | `e2e/recipe-form.test.ts` › "Scenario: Recipe created from scratch" ✓ (phone, desktop) |
| recipes | Empty section is dropped on save | unit | `src/lib/server/recipes.test.ts` › "Scenario: Empty section is dropped on save" ✓ (unit) |
| recipes | Leaving with unsaved changes asks first | e2e | `e2e/recipe-form.test.ts` › "Scenario: Leaving with unsaved changes asks first" ✓ (phone, desktop) |
| recipes | Leaving without changes does not ask | e2e | `e2e/recipe-form.test.ts` › "Scenario: Leaving without changes does not ask" ✓ (phone, desktop) |
| recipes | Notes render Markdown | unit | `src/lib/markdown.test.ts` › "Scenario: Notes render Markdown" ✓ (unit) |
| recipes | Unsafe link schemes stay text | unit | `src/lib/markdown.test.ts` › "Scenario: Unsafe link schemes stay text" ✓ (unit) |
| recipes | Script in notes is not executed | e2e | `e2e/recipe-page.test.ts` › "Scenario: Script in notes is not executed" ✓ (phone, desktop) |
| recipes | Uploaded image is stored downscaled | unit | `src/lib/server/images.test.ts` › "Scenario: Uploaded image is stored downscaled" ✓ (unit) |
| recipes | Image from a URL is stored | unit | `src/lib/server/images.test.ts` › "Scenario: Image from a URL is stored" ✓ (unit) |
| recipes | Non-image file is rejected by the server | unit | `src/lib/server/images.test.ts` › "Scenario: Non-image file is rejected by the server" ✓ (unit) |
| recipes | Image is served with caching headers | e2e | `e2e/images.test.ts` › "Scenario: Image is served with caching headers" ✓ (desktop) |
| recipes | Image upload from the form | e2e | `e2e/recipe-image.test.ts` › "Scenario: Image upload from the form" ✓ (phone, desktop) |
| recipes | Non-image file is rejected in the form | e2e | `e2e/recipe-image.test.ts` › "Scenario: Non-image file is rejected in the form" ✓ (phone, desktop) |
| recipes | Oversize file is rejected in the form | e2e | `e2e/recipe-image.test.ts` › "Scenario: Oversize file is rejected in the form" ✓ (phone, desktop) |
| recipes | Replacing the image removes the old blob | unit | `src/lib/server/recipes.test.ts` › "Scenario: Replacing the image removes the old blob" ✓ (unit) |
| recipes | Removing the image deletes its blob | unit | `src/lib/server/recipes.test.ts` › "Scenario: Removing the image deletes its blob" ✓ (unit) |
| recipes | Remove image shows the placeholder | e2e | `e2e/recipe-image.test.ts` › "Scenario: Remove image shows the placeholder" ✓ (phone, desktop) |
| recipes | Recipe saved without image when its image URL fails | e2e | `e2e/recipe-image.test.ts` › "Scenario: Recipe saved without image when its image URL fails" ✓ (phone, desktop) |
| recipes | Edit keeps the old image when a new image URL fails | e2e | `e2e/recipe-image.test.ts` › "Scenario: Edit keeps the old image when a new image URL fails" ✓ (phone, desktop) |
| recipes | Edit changes are saved | e2e | `e2e/recipe-edit.test.ts` › "Scenario: Edit changes are saved" ✓ (phone, desktop) |
| recipes | Deleted recipe's plan entries become free text | unit | `src/lib/server/recipes.test.ts` › "Scenario: Deleted recipe's plan entries become free text" ✓ (unit) |
| recipes | Deleting a recipe leaves the shopping list unchanged | unit | `src/lib/server/recipes.test.ts` › "Scenario: Deleting a recipe leaves the shopping list unchanged" ✓ (unit) |
| recipes | Delete names the plan entries that use the recipe | e2e | `e2e/recipe-page.test.ts` › "Scenario: Delete names the plan entries that use the recipe" ✓ (phone, desktop) |
| recipes | Recipe in no plan entry gets a plain confirm | e2e | `e2e/recipe-page.test.ts` › "Scenario: Recipe in no plan entry gets a plain confirm" ✓ (phone, desktop) |
| release | CI is green on the change's PR | manual (runs on GitHub; the change's own PR shows the checks green) | manual: on checklist below |
| release | Push to main runs on a GitHub-hosted runner | manual (runs on GitHub after the merge; the run's job page shows the runner) | manual: on checklist below |
| release | Superseded PR run is cancelled | manual (runs on GitHub; seen when a fixer pushes to the change's own PR, otherwise read from the concurrency block) | manual: on checklist below |
| release | E2E runs against the unpacked tarball | manual (runs on GitHub; read from the change's PR run log) | manual: on checklist below |
| release | Dependabot config covers actions and npm | manual (configuration; read at Gate 2, dependabot runs on GitHub) | manual: on checklist below |
| release | Tag does not match the version | manual (runs on GitHub on a tag push; not exercised by this change, read from the workflow) | manual: on checklist below |
| release | Release publishes the tested tarball | manual (runs on GitHub after the ship-time tag push) | manual: on checklist below |
| release | First release bump fails while publish succeeds | manual (runs on GitHub after the ship-time tag push; the run page shows both results) | manual: on checklist below |
| release | Runbook lists the outward steps | manual (documentation; checked by reading the file at Gate 2) | manual: on checklist below |
| release | Package and lockfile carry 0.1.0 | unit | `scripts/version.test.ts` › "Scenario: Package and lockfile carry 0.1.0" ✓ (unit) |
| release | Release v0.1.0 published | manual (runs on GitHub after the ship-time tag push) | manual: on checklist below |
| runtime | Fresh database gets the schema and starter tags | unit | `src/lib/server/db.test.ts` › "Scenario: Fresh database gets the schema and starter tags" ✓ (unit) |
| runtime | Only new migrations run on an existing database | unit | `src/lib/server/db.test.ts` › "Scenario: Only new migrations run on an existing database" ✓ (unit) |
| runtime | Failing migration stops the server | unit | `scripts/server.test.ts` › "Scenario: Failing migration stops the server" ✓ (unit) |
| runtime | Missing database directory is created | unit | `src/lib/server/db.test.ts` › "Scenario: Missing database directory is created" ✓ (unit) |
| runtime | Healthy server answers 200 | e2e | `e2e/healthz.test.ts` › "Scenario: Healthy server answers 200" ✓ (desktop) |
| runtime | Unreadable database answers 503 | unit | `src/routes/healthz/healthz.test.ts` › "Scenario: Unreadable database answers 503" ✓ (unit) |
| runtime | Server starts from any working directory | unit | `scripts/server.test.ts` › "Scenario: Server starts from any working directory" ✓ (unit) |
| runtime | Form posts pass the CSRF check behind the proxy header | e2e ("Scenario: Recipe created from scratch") | `e2e/recipe-form.test.ts` › "Scenario: Recipe created from scratch" ✓ (phone, desktop) |
| shopping-list | Manual item is parsed | unit | `src/lib/server/shopping.test.ts` › "Scenario: Manual item is parsed" ✓ (unit) |
| shopping-list | Empty input adds nothing | unit | `src/lib/server/shopping.test.ts` › "Scenario: Empty input adds nothing" ✓ (unit) |
| shopping-list | Same manual name merges amounts | unit | `src/lib/server/shopping.test.ts` › "Scenario: Same manual name merges amounts" ✓ (unit) |
| shopping-list | Add a manual item | e2e | `e2e/list.test.ts` › "Scenario: Add a manual item" ✓ (phone, desktop) |
| shopping-list | Edit an item's name and amount | e2e | `e2e/list.test.ts` › "Scenario: Edit an item's name and amount" ✓ (phone, desktop) |
| shopping-list | Delete an item | e2e | `e2e/list.test.ts` › "Scenario: Delete an item" ✓ (phone, desktop) |
| shopping-list | Ingredients scale by entry servings | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Ingredients scale by entry servings" ✓ (unit, 2 tests) |
| shopping-list | Equal names and units merge | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Equal names and units merge" ✓ (unit) |
| shopping-list | Metric family amounts sum | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Metric family amounts sum" ✓ (unit) |
| shopping-list | Mixed units stay on one line | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Mixed units stay on one line" ✓ (unit) |
| shopping-list | Singular and plural names fold to one line | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Singular and plural names fold to one line" ✓ (unit) |
| shopping-list | Line without quantity appears once without amount | unit | `src/lib/shopping/aggregate.test.ts` › "Scenario: Line without quantity appears once without amount" ✓ (unit, 2 tests) |
| shopping-list | Add from plan adds scaled, merged items | unit | `src/lib/server/shopping.test.ts` › "Scenario: Add from plan adds scaled, merged items" ✓ (unit) |
| shopping-list | Free-text entries contribute nothing | unit | `src/lib/server/shopping.test.ts` › "Scenario: Free-text entries contribute nothing" ✓ (unit) |
| shopping-list | Regenerating replaces open plan items | unit | `src/lib/server/shopping.test.ts` › "Scenario: Regenerating replaces open plan items" ✓ (unit) |
| shopping-list | Manual and checked items survive regenerating | unit | `src/lib/server/shopping.test.ts` › "Scenario: Manual and checked items survive regenerating" ✓ (unit) |
| shopping-list | Checked plan item is not re-added | unit | `src/lib/server/shopping.test.ts` › "Scenario: Checked plan item is not re-added" ✓ (unit) |
| shopping-list | Empty range changes nothing | unit | `src/lib/server/shopping.test.ts` › "Scenario: Empty range changes nothing" ✓ (unit) |
| shopping-list | Plan amounts merge into a manual item with the same name | unit | `src/lib/server/shopping.test.ts` › "Scenario: Plan amounts merge into a manual item with the same name" ✓ (unit) |
| shopping-list | Regenerating recalculates the plan part of a manual item | unit | `src/lib/server/shopping.test.ts` › "Scenario: Regenerating recalculates the plan part of a manual item" ✓ (unit) |
| shopping-list | Add from plan for the shown week | e2e | `e2e/list-plan.test.ts` › "Scenario: Add from plan for the shown week" ✓ (phone, desktop) |
| shopping-list | Merged item shows its manual and plan parts | e2e | `e2e/list.test.ts` › "Scenario: Merged item shows its manual and plan parts" ✓ (phone, desktop) |
| shopping-list | Empty range reports nothing planned | e2e | `e2e/list-plan.test.ts` › "Scenario: Empty range reports nothing planned" ✓ (phone, desktop) |
| shopping-list | New item uses the remembered category | unit | `src/lib/server/shopping.test.ts` › "Scenario: New item uses the remembered category" ✓ (unit) |
| shopping-list | Unknown item goes to Other | unit | `src/lib/server/shopping.test.ts` › "Scenario: Unknown item goes to Other" ✓ (unit) |
| shopping-list | Category memory ignores case | unit | `src/lib/server/shopping.test.ts` › "Scenario: Category memory ignores case" ✓ (unit) |
| shopping-list | List grouped by category with empty ones hidden | e2e | `e2e/list.test.ts` › "Scenario: List grouped by category with empty ones hidden" ✓ (phone, desktop) |
| shopping-list | Moving an item to a category remembers it | e2e | `e2e/list.test.ts` › "Scenario: Moving an item to a category remembers it" ✓ (phone, desktop) |
| shopping-list | Clear checked removes all checked items | unit | `src/lib/server/shopping.test.ts` › "Scenario: Clear checked removes all checked items" ✓ (unit) |
| shopping-list | Check off moves the item to Checked | e2e | `e2e/list-check.test.ts` › "Scenario: Check off moves the item to Checked" ✓ (phone, desktop) |
| shopping-list | Uncheck restores the item | e2e | `e2e/list-check.test.ts` › "Scenario: Uncheck restores the item" ✓ (phone, desktop) |
| shopping-list | Clear checked is disabled with nothing checked | e2e | `e2e/list-check.test.ts` › "Scenario: Clear checked is disabled with nothing checked" ✓ (phone, desktop) |
| shopping-list | Reduced motion checks off without sliding | e2e | `e2e/list-check.test.ts` › "Scenario: Reduced motion checks off without sliding" ✓ (phone, desktop) |
| shopping-list | Check-off animation feels satisfying | manual (visual judgement by Rue) | manual: on checklist below |
| shopping-list | Imported recipe reaches the list scaled and grouped | e2e | `e2e/journey.test.ts` › "Scenario: Imported recipe reaches the list scaled and grouped" ✓ (phone, desktop) |
| tags | New tag created while editing a recipe | e2e | `e2e/recipe-form.test.ts` › "Scenario: New tag created while editing a recipe" ✓ (phone, desktop) |
| tags | Duplicate tag name reuses the existing tag | unit | `src/lib/server/tags.test.ts` › "Scenario: Duplicate tag name reuses the existing tag" ✓ (unit) |
| tags | Rename a tag | e2e | `e2e/tags.test.ts` › "Scenario: Rename a tag" ✓ (phone, desktop) |
| tags | Renaming onto an existing name merges the tags | unit | `src/lib/server/tags.test.ts` › "Scenario: Renaming onto an existing name merges the tags" ✓ (unit) |
| tags | Rename onto an existing tag merges them in the manager | e2e | `e2e/tags.test.ts` › "Scenario: Rename onto an existing tag merges them in the manager" ✓ (phone, desktop) |
| tags | Deleting a tag in use names the count | e2e | `e2e/tags.test.ts` › "Scenario: Deleting a tag in use names the count" ✓ (phone, desktop) |
| tags | Deleted tag is removed from its recipes | unit | `src/lib/server/tags.test.ts` › "Scenario: Deleted tag is removed from its recipes" ✓ (unit) |

## Manual checklist for Rue

Start: `npm run dev` then http://localhost:5173. The dev DB starts empty: import a recipe at /recipes/import (any site with schema.org Recipe) or add 3-4 by hand incl. one with an image and a tag, then add some to the plan (/plan) so the dashboard, archive and list have content.

- Archive: cards enter staggered, lively and calm (Card entrance looks lively and calm)
- Archive: featured stack looks like a coverflow (Featured stack looks like a coverflow); needs 3+ favourited recipes
- Archive: toggling a tag filter glides smoothly (Filter gliding looks smooth)
- Archive: tapping the heart feels alive (Favourite toggle feels alive)
- Design: components match the visual brief; mockups in the shots list below (Components match the visual brief)
- Design: approve the mockups (Rue approves the mockups)
- Design: if not approved, request changes and see them revised (Requested changes revise the mockups)
- Harness: read CLAUDE.md ## Harness for merge and tag policy (Harness declared with merge and tag policy)
- Harness: `npm run proof:full -- --list` shows each e2e test under [phone] and [desktop] (Each e2e test runs on phone and desktop)
- Harness: proof prints test names and passes; proof fails on a failing check; proof-full runs e2e on an isolated DB (3 scenarios, evidence = U1 runs and the green Layer 1 above; optional re-run `npm run proof`)
- Home: dashboard looks like the approved mockup (Dashboard looks like the approved mockup)
- Nav: scroll down on phone, tab bar shrinks calmly (Nav shrink looks calm)
- Nav: switching areas (Recipes to Plan) transitions calmly (Page transition looks calm)
- Recipe detail: hero parallax and shared-element transition from a card look smooth (Hero parallax and shared element look smooth)
- Import: import a real recipe URL, fields fill in (Importing a real recipe URL); needs internet
- Shopping list: check an item off, animation feels satisfying (Check-off animation feels satisfying)
- Release (read at Gate 2 / after ship, runs on GitHub): CI green on PR; push to main on GitHub-hosted runner; superseded run cancelled; E2E on unpacked tarball; dependabot config covers actions+npm (.github/dependabot.yml); tag mismatch fails; release publishes tested tarball; first release bump fails while publish succeeds; Release v0.1.0 published; runbook lists the outward steps (read the runbook file)

## Diffstat

235 files changed, 33358 insertions(+) (`git diff --stat origin/main...flow/build-cooking-hub`)

## Screenshots (not committed)

Only the mockup shots exist; no per-feature shots were written by e2e.

- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-home.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-import-fallback.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-import.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-list.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-plan.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-recipe.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/desktop-recipes.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-home.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-import-fallback.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-import.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-list.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-plan.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-recipe.png
- /tmp/claude-1001/-home-Rue/1ce55759-6cf9-460a-8a81-55f69ee06bea/scratchpad/verify/shots/phone-recipes.png

## Review

- Round 1 (fresh-context reviewer on 81b085a): weak test pins in journey.test.ts (Other fallback, edited title, today's Dinner, fixture servings), recipe-form a11y descriptions, package.test.ts tar root, motion.test.ts scope; mismatches on SectionsEditor slide, AppNav/PillNav inline-size, state-change colour/border/shadow transitions, Week box-shadow keyframe, raw rgb() colours, recipes/new hard-coded durations/easings, edit with broken image link, minutes validation; correctness: duplicate check missed un-normalised source URLs; docs/release.md gh api form. Fixed in 82a2d34 and 45fa24c (tests added, code fixes, new tokens, normaliseUrl on create/update, COPY.imageKept, server-side minutes validation). Motion exceptions (a) state-change colour/border/shadow transitions, (b) SectionsEditor slide, (c) AppNav/PillNav inline-size glide were written into the spec and approved by Rue on 2026-10-20.
- Round 2 (reviewer scoped to 719b424..45fa24c): should-fix: Week `.today .slots::after` ring drew around the whole today column on desktop (`.slots` is display:contents there); nit: edit page `imageFailed` object lookup read prototype keys (`?imageFailed=constructor` gave a 500). Fixed in 1396cef with e2e regression tests (watched red without the fix). Everything else checked clean (stricter minutes validation cannot reject stored data, duplicate check not a regression, tokens all defined, scan tests not vacuous).

## Follow-ups (not fixed, approved by Rue to ship without)

- Hard-coded animation durations outside tokens: FeaturedStack (640ms), HeroTile (1200/1400ms), WeekTile (420/520ms), ListTile (560ms), FavouriteTile (620/1600ms), layout view-transition (520ms). The motion scan test checks properties and raw colours only, not durations.
- A ~310+ digit string in minutes or servings passes the `^\d+$` form check, Number() gives Infinity, and the server ValidationError is uncaught, giving a 500 (and an already-downloaded image would be orphaned).
