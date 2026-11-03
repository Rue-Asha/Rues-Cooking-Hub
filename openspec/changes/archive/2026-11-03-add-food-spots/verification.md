verified-at: ba8fc8c

## Layer 1: PORT=4700 npm run proof:full: ok
```
Test Files  34 passed (34)
     Tests  386 passed (386)
  41 skipped
  525 passed (6.8m)
```

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Mockup screenshots are produced for both viewports | e2e | `e2e/mockups.test.ts` ✓ desktop+phone |
| Every mockup photo is credited | unit | `src/lib/mockups/credits.test.ts` ✓ |
| Mockup routes are hidden without the test flag | unit | `src/routes/__mockups/mockups-guard.test.ts` ✓ |
| Main screens share one alignment rule | e2e | `e2e/design.test.ts` ✓ desktop+phone |
| Eating Out mockup loads only local resources | e2e | `e2e/mockup-eating-out.test.ts` ✓ desktop+phone |
| Rue approves the mockups | manual (taste stop; visual judgement by Rue) | checklist: mockups `test-results/shots/mockups/*-eating-out.png` |
| Requested changes revise the mockups | manual (taste stop; visual judgement by Rue) | checklist: taste stop (already done in flow) |
| Migration keeps existing recipe data | unit | `src/lib/server/db.test.ts` ✓ |
| Spot tags stay apart from recipe tags | unit | `src/lib/server/spots.test.ts` ✓ |
| Spot tag names are reused ignoring case | unit | `src/lib/server/spots.test.ts` ✓ |
| Duplicate spot names are allowed | unit | `src/lib/server/spots.test.ts` ✓ |
| Deleting a spot removes its photo and tag links | unit | `src/lib/server/spots.test.ts` ✓ |
| Unused spot tag drops out | unit | `src/lib/server/spots.test.ts` ✓ |
| Invalid spot rows are refused by the database | unit | `src/lib/server/schema.test.ts` ✓ |
| Valid scores parse to hundredths | unit | `src/lib/spots/score.test.ts` ✓ |
| Invalid scores are rejected | unit | `src/lib/spots/score.test.ts` ✓ |
| Scores display with two decimals and a dot | unit | `src/lib/spots/score.test.ts` ✓ |
| Score is stored without drift | unit | `src/lib/spots/save.test.ts` ✓ |
| Score field uses the decimal keyboard | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Invalid score keeps the other values | e2e | `e2e/spots-form-errors.test.ts` ✓ desktop+phone |
| Spot created with all fields | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| New spot defaults to Want to go | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Score field appears only for Visited | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Server rejects invalid spot input | unit | `src/lib/spots/save.test.ts` ✓ |
| Empty name blocks saving a spot | e2e | `e2e/spots-form-errors.test.ts` ✓ desktop+phone |
| Visited without score is rejected in the form | e2e | `e2e/spots-form-errors.test.ts` ✓ desktop+phone |
| Website must be http or https | e2e | `e2e/spots-form-errors.test.ts` ✓ desktop+phone |
| Price level can be cleared | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Spot tag field suggests spot tags only | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Spot photo errors match the recipe form | e2e | `e2e/spots-form-errors.test.ts` ✓ desktop+phone |
| Leaving the spot form with unsaved changes asks first | e2e | `e2e/spots-form-guard.test.ts` ✓ desktop+phone |
| Leaving the untouched spot form does not ask | e2e | `e2e/spots-form-guard.test.ts` ✓ desktop+phone |
| Spot edit changes are saved | e2e | `e2e/spots-edit.test.ts` ✓ desktop+phone |
| Switching to Want to go clears the score | e2e | `e2e/spots-edit.test.ts` ✓ desktop+phone |
| Switching to Visited requires a score | e2e | `e2e/spots-edit.test.ts` ✓ desktop+phone |
| Removing the spot photo deletes the image | unit | `src/lib/server/spots.test.ts` ✓ |
| Editing a deleted spot answers 404 | e2e | `e2e/spots-edit.test.ts` ✓ desktop+phone |
| Default segment follows what exists | unit | `src/lib/spots/query.test.ts` ✓ |
| Visited is the default segment | e2e | `e2e/spots-list.test.ts` ✓ desktop+phone |
| Want to go opens when nothing is visited | e2e | `e2e/spots-list.test.ts` ✓ desktop+phone |
| Empty Eating Out invites the first spot | e2e | `e2e/spots-list.test.ts` ✓ desktop+phone |
| Empty side shows a short line | e2e | `e2e/spots-list.test.ts` ✓ desktop+phone |
| Eating Out view survives reload and back | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| Phone page carries Add spot | e2e | `e2e/spots-list.test.ts` ✓ phone |
| Location text joins what exists | unit | `src/lib/spots/format.test.ts` ✓ |
| Visited card shows photo, name, tags, location, price and score | e2e | `e2e/spots-card.test.ts` ✓ desktop+phone |
| Sparse card shows no empty parts | e2e | `e2e/spots-card.test.ts` ✓ desktop+phone |
| Long spot names are clamped | e2e | `e2e/spots-card.test.ts` ✓ desktop+phone |
| Spot grid fits narrow phones | e2e | `e2e/spots-card.test.ts` ✓ phone |
| Spot search covers name, neighbourhood, city, tags and notes | unit | `src/lib/server/spots.test.ts` ✓ |
| Spot search ignores case for umlauts | unit | `src/lib/server/spots.test.ts` ✓ |
| Spot filters combine within the segment | unit | `src/lib/server/spots.test.ts` ✓ |
| Segment counts follow the filters | unit | `src/lib/server/spots.test.ts` ✓ |
| Filters offer only values in use | unit | `src/lib/server/spots.test.ts` ✓ |
| Stale filter values are ignored | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| Filtering by city updates cards and counts | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| Search from Eating Out | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| No spot match offers to clear filters | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| Search spots focuses the spot search | e2e | `e2e/spots-filters.test.ts` ✓ desktop |
| Score sort orders ties by name | unit | `src/lib/server/spots.test.ts` ✓ |
| Name and newest sorts | unit | `src/lib/server/spots.test.ts` ✓ |
| Sort defaults per segment | unit | `src/lib/spots/query.test.ts` ✓ |
| Segment switch resets an invalid sort | unit | `src/lib/spots/query.test.ts` ✓ |
| Want to go offers no score sort | e2e | `e2e/spots-filters.test.ts` ✓ desktop+phone |
| Equal scores share a rank | unit | `src/lib/spots/query.test.ts` ✓ |
| Ranks show while sorted by score | e2e | `e2e/spots-rank.test.ts` ✓ desktop+phone |
| Ranks recount within the filters | e2e | `e2e/spots-rank.test.ts` ✓ desktop+phone |
| Other sorts show no rank | e2e | `e2e/spots-rank.test.ts` ✓ desktop+phone |
| Maps link is built from name, address and city | unit | `src/lib/spots/format.test.ts` ✓ |
| Spot page shows hero, panel, rows and actions | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| Spot page without photo shows the placeholder hero | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| Missing address, website and notes hide their rows | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| External links open in a new tab | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| Spot page makes no external requests | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| Unknown spot answers 404 | e2e | `e2e/spots-page.test.ts` ✓ desktop+phone |
| Delete a spot from its page | e2e | `e2e/spots-delete.test.ts` ✓ desktop+phone |
| Card and spot page share the photo | e2e | `e2e/spots-hero.test.ts` ✓ desktop+phone |
| Spot without photo morphs its placeholder | e2e | `e2e/spots-hero.test.ts` ✓ desktop+phone |
| Reduced motion skips the spot shared element | e2e | `e2e/spots-hero.test.ts` ✓ desktop+phone |
| Spot photo carries over smoothly | manual (visual judgement by Rue at Gate 2) | checklist: open a spot from the list |
| Mark visited stores status and score | unit | `src/lib/server/spots.test.ts` ✓ |
| Mark visited from the spot page | e2e | `e2e/spots-visit.test.ts` ✓ desktop+phone |
| Invalid score keeps the sheet open | e2e | `e2e/spots-visit.test.ts` ✓ desktop+phone |
| Cancel leaves the spot unchanged | e2e | `e2e/spots-visit.test.ts` ✓ desktop+phone |
| Mark visited is refused for a spot that is already visited | e2e | `e2e/spots-visit.test.ts` ✓ desktop+phone |
| Eating Out matches the approved mockup | manual (visual judgement by Rue at Gate 2) | `test-results/shots/eating-out-{list,list-want,spot,spot-sheet,form}-{phone,desktop}.png` |
| Test routes answer 404 without the test flag | unit | `src/routes/__test/test-routes.test.ts` ✓ |
| Reset leaves an empty archive with the starter tags | e2e | `e2e/test-routes.test.ts` ✓ desktop |
| Seed returns the ids of what it inserted | e2e | `e2e/test-routes.test.ts` ✓ desktop |
| Seeded spots carry their photos | e2e | `e2e/test-routes.test.ts` ✓ desktop |
| Test clock sets today | unit | `src/lib/server/clock.test.ts` ✓ |
| Top spots query returns the four best visited spots | unit | `src/lib/server/spots.test.ts` ✓ |
| Home shows Top spots after Recently added | e2e | `e2e/home-spots.test.ts` ✓ desktop+phone |
| Fewer than four visited spots shows what exists | e2e | `e2e/home-spots.test.ts` ✓ desktop+phone |
| No visited spot hides Top spots | e2e | `e2e/home-spots.test.ts` ✓ desktop+phone |
| Top spots row lays out like Recently added | e2e | `e2e/home-spots.test.ts` ✓ desktop+phone |
| Top spots look like the approved mockup | manual (visual judgement by Rue at Gate 2) | `test-results/shots/eating-out-home-{phone,desktop}.png` |
| Desktop shows the top pill nav | e2e | `e2e/nav.test.ts` ✓ desktop |
| Phone shows the bottom tab bar | e2e | `e2e/nav.test.ts` ✓ phone |
| Active area is marked | unit | `src/lib/nav.test.ts` ✓ |
| Nav marks the open area | e2e | `e2e/nav.test.ts` ✓ desktop+phone |
| Nav marks Eating Out on its sub-pages | e2e | `e2e/spots-form.test.ts` ✓ desktop+phone |
| Divider sits between List and Eating Out | e2e | `e2e/nav-fit.test.ts` ✓ desktop+phone |
| Active pill lands on Eating Out | e2e | `e2e/nav-fit.test.ts` ✓ desktop+phone |
| Five labels fit the phone tab bar | e2e | `e2e/nav-fit.test.ts` ✓ phone |
| Tablet and phone landscape use one layout without overlap | e2e | `e2e/nav.test.ts` ✓ phone |
| Nav shrinks on scroll | e2e | `e2e/nav.test.ts` ✓ desktop+phone |
| Compact tab bar shows icons only | e2e | `e2e/nav.test.ts` ✓ phone |
| Reduced motion shrinks the tab bar instantly | e2e | `e2e/nav.test.ts` ✓ phone |
| Nav shrink looks calm | manual (visual judgement by Rue) | checklist: scroll on phone and desktop |
| Header actions per area | unit | `src/lib/nav.test.ts` ✓ |
| Eating Out header shows spot actions | e2e | `e2e/header.test.ts` ✓ desktop |
| Header follows client-side navigation | e2e | `e2e/header.test.ts` ✓ desktop |
| Desktop header fits at 1024 px | e2e | `e2e/header.test.ts` ✓ desktop |
| Package and lockfile carry 0.2.0 | unit | `scripts/version.test.ts` ✓ |
| Release v0.2.0 published | manual (runs on GitHub after the ship-time tag push) | checklist: after tag push, GitHub release carries tgz + sha256 |

Notes
- Gaps: none. 41 skipped e2e are the single-project tests (phone-only or desktop-only) and the scrolled-pill variant on desktop.
- "Unused spot tag drops out": the test asserts `spotTags()` (suggestions and, via the in-use filter, facets) is empty and `spot_tags` has 0 rows after the edit. It would fail if pruning were missing, so it pins the THEN. It was never red in U1 (stub); not mutation-checked here (verifier does not edit).
- "Spot page makes no external requests": collects every request origin on a seeded spot with photo, address and website, waits for networkidle and asserts the set equals exactly the app origin. A real external request would fail it; pins the THEN. Never red before the page existed because it was added after the page.
- Release delta: package.json 0.2.0, package-lock.json 0.2.0 (root and packages[""]) covered by scripts/version.test.ts; no tag (ship time).

## Manual checklist
run: `npm run dev` then http://localhost:5173
- Eating Out: add a spot, mark it visited with a score, filter by city, open the spot page, delete it.
- Home: Top spots row appears after Recently added when a spot is visited.
- Nav: scroll on phone and desktop; shrink looks calm; five labels fit at 320 px.
- Spot photo carries over smoothly from card to spot page (and placeholder morph).
- Compare Eating Out screens against the approved mockup (`/__mockups/eating-out` needs COOKING_HUB_TEST=1).
- After tag push: GitHub release v0.2.0 carries rues-cooking-hub-0.2.0.tgz and its sha256.

## Diffstat
```
 static/mockups/spot-terrace.jpg                    |  Bin 0 -> 276109 bytes
 static/mockups/spot-wine-bar.jpg                   |  Bin 0 -> 252725 bytes
 89 files changed, 8094 insertions(+), 79 deletions(-)
```

## Screenshots (untracked, from this run)
- test-results/shots/eating-out-form-desktop.png
- test-results/shots/eating-out-form-phone.png
- test-results/shots/eating-out-home-desktop.png
- test-results/shots/eating-out-home-phone.png
- test-results/shots/eating-out-list-desktop.png
- test-results/shots/eating-out-list-phone.png
- test-results/shots/eating-out-list-want-desktop.png
- test-results/shots/eating-out-list-want-phone.png
- test-results/shots/eating-out-spot-desktop.png
- test-results/shots/eating-out-spot-phone.png
- test-results/shots/eating-out-spot-sheet-desktop.png
- test-results/shots/eating-out-spot-sheet-phone.png
- test-results/shots/mockups/desktop-eating-out.png
- test-results/shots/mockups/desktop-home.png
- test-results/shots/mockups/desktop-import-fallback.png
- test-results/shots/mockups/desktop-import.png
- test-results/shots/mockups/desktop-list.png
- test-results/shots/mockups/desktop-plan.png
- test-results/shots/mockups/desktop-recipe.png
- test-results/shots/mockups/desktop-recipes.png
- test-results/shots/mockups/phone-eating-out.png
- test-results/shots/mockups/phone-home.png
- test-results/shots/mockups/phone-import-fallback.png
- test-results/shots/mockups/phone-import.png
- test-results/shots/mockups/phone-list.png
- test-results/shots/mockups/phone-plan.png
- test-results/shots/mockups/phone-recipe.png
- test-results/shots/mockups/phone-recipes.png

## Review

Round 1 (fresh-context reviewer on origin/main...flow/add-food-spots at cce2a5d), fixed in 028dc6a, 95d2133, 0654523:
- WEAK `spots.test.ts` Top spots tie order: now uses the scenario data (Gamma, beta, Zeta, Alpha); mutation check with a case-sensitive tie-break went red. Fixed.
- WEAK `e2e/mockup-eating-out.test.ts` local resources: now pins every `<img>` currentSrc to `/mockups/*.jpg`. Fixed.
- SPEC MISMATCH `visit` action rescored a Visited spot: now 404 unless Want to go; scenario "Mark visited is refused for a spot that is already visited" added to the spec (ba8fc8c) and test written first (red, then green). Fixed.
- Nav width tests loosened from 0.75x to "narrower than full": justified by the spec (five items plus divider).

Round 2 (scoped reviewer on cce2a5d...ba8fc8c): no weakened or weak tests, no bugs. Open, not fixed (Rue to decide at Gate 2):
- Stale tab: saving "Mark visited" in a second tab for an already visited spot shows the app's Not found page (was a silent overwrite). The spec fixes only the POST status.
- Race: two simultaneous `visit` POSTs for one Want to go spot can both pass the status check (check runs before `request.formData()`); the second score wins. Single-user app, unlikely.

Evidence reran at ba8fc8c: `PORT=4700 npm run proof:full` ok, 525 passed, 41 skipped.
