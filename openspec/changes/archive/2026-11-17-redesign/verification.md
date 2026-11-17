verified-at: fe1f678

# Verification round 4

## Layer 1: proof:full

Command: `npm run proof:full` at fe1f678, exit 0 (GREEN). check-slop: 217 files clean. check-drift: 25 files match lock v2.0.0. svelte-check: 0 errors, 0 warnings. vitest: 425 tests passed. Playwright: 687 passed, 119 skipped (phone/desktop duplicates and project-scoped describes), 0 failed, 16.2m. `openspec validate redesign --strict`: valid. An earlier run at 36c796a was red (2 failures: the 16:9 plate rule resized the photo frame under the pointer, so Save never posted); fixed in 96e8bec, full rerun green.

```
  ✓  792 [desktop] › e2e/test-routes.test.ts:14:1 › Scenario: Reset leaves an empty archive with the starter tags (81ms)
  ✓  793 [desktop] › e2e/test-routes.test.ts:50:1 › Scenario: Seed returns the ids of what it inserted (43ms)
  ✓  794 [desktop] › e2e/test-routes.test.ts:77:1 › Scenario: Seeded spots carry their photos (108ms)
  ✓  795 [desktop] › e2e/test-routes.test.ts:92:1 › the clock route accepts a date and null (3ms)
  ✓  796 [desktop] › e2e/test-routes.test.ts:99:1 › Scenario: App is hydrated before tests interact (131ms)
  ✓  797 [desktop] › e2e/transitions.test.ts:27:1 › Scenario: Area change uses a view transition (214ms)
  ✓  798 [desktop] › e2e/transitions.test.ts:34:1 › Scenario: Browser without View Transitions navigates instantly (216ms)
  ✓  799 [desktop] › e2e/transitions.test.ts:49:1 › Scenario: Reduced motion skips the page transition (237ms)
  ✓  800 [desktop] › e2e/transitions.test.ts:57:1 › Navigation inside one area skips the page transition (567ms)
  ✓  801 [desktop] › e2e/transitions.test.ts:72:1 › the top bar sits out the page fade only where it is sticky (296ms)
  ✓  802 [desktop] › e2e/wake-lock.test.ts:54:1 › Scenario: Recipe page requests a wake lock (153ms)
  ✓  803 [desktop] › e2e/wake-lock.test.ts:63:1 › Scenario: Leaving the recipe page releases the wake lock (846ms)
  ✓  804 [desktop] › e2e/wake-lock.test.ts:84:1 › Scenario: Wake lock is requested again after the page was hidden (161ms)
  ✓  805 [desktop] › e2e/wake-lock.test.ts:104:1 › Scenario: Missing wake lock API changes nothing (165ms)
  ✓  806 [desktop] › e2e/wake-lock.test.ts:115:1 › Scenario: Denied wake lock shows no error (174ms)

  Slow test file: [desktop] › e2e/redesign-shots.test.ts (5.6m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  119 skipped
  687 passed (16.2m)
```

## Layer 2: spec coverage

Covered 182, manual 16, gaps 1 (of 199).

Gap: release "Package and lockfile carry 0.4.0" (unit): `scripts/version.test.ts` is still named for 0.3.0 and package.json is 0.3.0, so no test of that name runs. Non-blocking: the bump to 0.4.0 happens at ship (release tag), unchanged since round 2.

| Capability | Scenario | proof | Evidence |
|---|---|---|---|
| archive | No recipes shows Start your archive | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | Filters matching nothing offer Clear filters | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | A hundred recipes stay usable | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | Long titles and many tags stay in the layout | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | Recipes head keeps Add recipe and Manage tags | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | More than eight tags collapse behind Show all | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | A selected tag outside the first eight stays visible | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | Eight tags or fewer show no toggle | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | List shows 24 and more on request | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | A filter change starts at 24 again | e2e | `e2e/archive-states.test.ts` [desktop/phone] ✓ |
| archive | Rows show photo, title, description, time and tags | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Empty archive invites the first recipe | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Row without description shows title and meta | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Long titles and descriptions are clamped | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Row without image shows the plate | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Recipe without times shows no time in its row | e2e | `e2e/archive.test.ts` [desktop/phone] ✓ |
| archive | Featured query returns the seven newest recipes | unit | `src/lib/server/archive.test.ts` ✓ |
| archive | Featured stack shows the seven newest | e2e | `e2e/featured.test.ts` [desktop/phone] ✓ |
| archive | Featured with fewer than seven counts what exists | e2e | `e2e/featured.test.ts` [desktop/phone] ✓ |
| archive | Single featured recipe has no arrows | e2e | `e2e/featured.test.ts` [desktop/phone] ✓ |
| archive | Arrows and keyboard step through the stack | e2e | `e2e/featured.test.ts` [desktop] ✓ |
| archive | Swipe steps through the stack on phone | e2e | `e2e/featured.test.ts` [phone] ✓ |
| archive | Featured stack ignores the filters | e2e | `e2e/featured.test.ts` [desktop/phone] ✓ |
| archive | Featured matches the signed-off hi-fi | manual | manual, see checklist |
| design-system | Vendored files match the lock | unit | `scripts/proof-guards.test.ts` ✓ |
| design-system | App renders with the accent | e2e | `e2e/fingerprint.test.ts` [desktop/phone] ✓ |
| design-system | App pages load nothing from other origins | e2e | `e2e/fingerprint.test.ts` [desktop/phone] ✓ |
| design-system | Redesign mockups are hidden without the test flag | unit | `src/routes/__mockups/redesign/redesign-guard.test.ts` ✓ |
| design-system | Every mockup screen is shot at three widths | e2e | `e2e/redesign-shots.test.ts` [desktop] ✓ |
| design-system | Worst-case data switches the fixtures | e2e | `e2e/redesign-shots.test.ts` [desktop] ✓ |
| design-system | Every mockup photo is credited | unit | `src/routes/__mockups/redesign/credits.test.ts` ✓ |
| design-system | Rue signs off wireframes and hi-fi | manual | manual, see checklist |
| design-system | Icon files are served | e2e | `e2e/icons.test.ts` [desktop/phone] ✓ |
| design-system | Head carries the icon links | e2e | `e2e/icons.test.ts` [desktop/phone] ✓ |
| design-system | Icon reads at small sizes | manual | manual, see checklist |
| design-system | Contract strings stay | unit | `src/lib/copy.test.ts` ✓ |
| design-system | New strings are in the contract | unit | `src/lib/copy.test.ts` ✓ |
| design-system | Every dialog traps focus and returns it | e2e | `e2e/dialogs.test.ts` [desktop/phone] ✓ |
| design-system | Close control and outside click close every dialog | e2e | `e2e/dialogs.test.ts` [desktop/phone] ✓ |
| design-system | Dialogs are bottom sheets on the phone and cards from 768 px | e2e | `e2e/dialogs.test.ts` [desktop/phone] ✓ |
| design-system | Menus open clear of the phone bar | e2e | `e2e/plan-phone.test.ts` [phone] ✓ |
| design-system | Status notices are announced without taking focus | e2e | `e2e/dialogs.test.ts` [desktop/phone] ✓ |
| design-system | No horizontal page scroll from 320 to 1920 | e2e | `e2e/a11y-floor.test.ts` [desktop] ✓ |
| design-system | Controls meet the target sizes | e2e | `e2e/a11y-floor.test.ts` [desktop] ✓ |
| design-system | Focus is visible and not obscured | e2e | `e2e/a11y-floor.test.ts` [desktop] ✓ |
| design-system | Reduced motion removes movement | e2e | `e2e/a11y-floor.test.ts` [desktop] ✓ |
| design-system | WCAG 2.2 AA review passes | manual | manual, see checklist |
| design-system | Chrome and reading text show the default cursor | e2e | `e2e/chrome-cursor.test.ts` [desktop] ✓ |
| design-system | Fields keep the text cursor | e2e | `e2e/chrome-cursor.test.ts` [desktop] ✓ |
| design-system | Only fields and the user's own writing are selectable | e2e | `e2e/chrome-cursor.test.ts` [desktop] ✓ |
| design-system | Old style files are gone | unit | `scripts/no-old-styles.test.ts` ✓ |
| design-system | Proof runs check-slop without a baseline | unit | `scripts/no-old-styles.test.ts` ✓ |
| design-system | Pages load no external resources | e2e | `e2e/redesign-shots.test.ts` [desktop] ✓ |
| design-system | Display and text fonts load from the app | e2e | `e2e/fingerprint.test.ts` [desktop/phone] ✓ |
| design-system | Menus and dialogs open softly | e2e | `e2e/overlay-motion.test.ts` [desktop] ✓ |
| design-system | Reduced motion opens menus and dialogs instantly | e2e | `e2e/overlay-motion.test.ts` [desktop] ✓ |
| design-system | A new list item settles in | e2e | `e2e/overlay-motion.test.ts` [desktop] ✓ |
| design-system | Clearing checked items at the page end moves no row to buy | e2e | `e2e/list-check.test.ts` [phone] ✓ |
| design-system | Press states show on an iPhone | manual | manual, see checklist |
| design-system | Reduced motion makes transitions instant | unit | `src/lib/motion.test.ts` ✓ |
| design-system | Motion animates only transform and opacity | unit | `src/lib/motion.test.ts` ✓ |
| eating-out | Spot pages render on the fingerprint | e2e | `e2e/spots-shell.test.ts` [desktop/phone] ✓ |
| eating-out | Spot pages keep their behaviour | e2e | `e2e/spots-shell.test.ts` [desktop/phone] ✓ |
| eating-out | Contract covers Eating Out | unit | `scripts/contract.test.ts` ✓ |
| eating-out | Product names five areas | unit | `scripts/contract.test.ts` ✓ |
| eating-out | Spot search keeps its placeholder whole at every width | e2e | `e2e/spots-filters.test.ts` [desktop] ✓ |
| eating-out | Default segment follows what exists | unit | `src/lib/spots/query.test.ts` ✓ |
| eating-out | Visited is the default segment | e2e | `e2e/spots-list.test.ts` [desktop/phone] ✓ |
| eating-out | Want to go opens when nothing is visited | e2e | `e2e/spots-list.test.ts` [desktop/phone] ✓ |
| eating-out | Empty Eating Out invites the first spot | e2e | `e2e/spots-list.test.ts` [desktop/phone] ✓ |
| eating-out | Empty side shows a short line | e2e | `e2e/spots-list.test.ts` [desktop/phone] ✓ |
| eating-out | Eating Out view survives reload and back | e2e | `e2e/spots-filters.test.ts` [desktop/phone] ✓ |
| eating-out | Phone page carries Add spot | e2e | `e2e/spots-list.test.ts` [phone] ✓ |
| eating-out | Maps link is built from name, address and city | unit | `src/lib/spots/format.test.ts` ✓ |
| eating-out | Spot page shows hero, panel, rows and actions | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | Spot page without photo shows the placeholder hero | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | Missing address, website and notes hide their rows | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | External links open in a new tab | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | Spot page makes no external requests | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | Unknown spot answers 404 | e2e | `e2e/spots-page.test.ts` [desktop/phone] ✓ |
| eating-out | Delete a spot from its page | e2e | `e2e/spots-delete.test.ts` [desktop/phone] ✓ |
| harness | Proof prints test names and passes | manual | manual, see checklist |
| harness | Proof fails on a failing check | manual | manual, see checklist |
| harness | Proof-full runs e2e on an isolated database | manual | manual, see checklist |
| harness | Proof runs the fingerprint guards | unit | `scripts/proof-guards.test.ts` ✓ |
| home | Home shows the today dashboard | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | Nothing planned this week | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | Empty list and no favourite on Home | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | No recipes shows the welcome state | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | Long titles stay inside the dashboard | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | Top spots stay on the dashboard | e2e | `e2e/home-states.test.ts` [desktop/phone] ✓ |
| home | Dashboard prefers today's dinner | unit | `src/lib/server/home.test.ts` ✓ |
| home | Dashboard falls back to the first recipe entry of today | unit | `src/lib/server/home.test.ts` ✓ |
| home | Hero shows today's planned recipe | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Nothing planned today shows the newest recipe | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Empty archive shows the welcome hero | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | This week lists the seven days | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Shopping list shows open count and first items | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Empty list says List is empty | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Favourite shows the most recently favourited recipe | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | No favourites invites to favourite | e2e | `e2e/home.test.ts` [desktop/phone] ✓ |
| home | Dashboard matches the signed-off hi-fi | manual | manual, see checklist |
| home | Top spots query returns the four best visited spots | unit | `src/lib/server/spots.test.ts` ✓ |
| home | Home shows Top spots after Recently added | e2e | `e2e/home-spots.test.ts` [desktop/phone] ✓ |
| home | Fewer than three visited spots shows what exists | e2e | `e2e/home-spots.test.ts` [desktop/phone] ✓ |
| home | No visited spot hides Top spots | e2e | `e2e/home-spots.test.ts` [desktop/phone] ✓ |
| home | Top spots lay out in two columns on phone and three on desktop | e2e | `e2e/home-spots.test.ts` [desktop/phone] ✓ |
| meal-plan | Empty week offers an add control in every slot | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Slot with five entries stays readable | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Entry of a deleted recipe reads as text | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Picker shows the plate and No times for a bare recipe | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Every drag has a Move to alternative on the desktop | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Days are stacked on the phone | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | Tablet width stacks the days in one column | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | Picker is hidden on touch at desktop width | e2e | `e2e/plan-states.test.ts` [desktop/phone] ✓ |
| meal-plan | Today is marked and first in view | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | Past week starts at Monday | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | Empty days are compact | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | A day turns compact once its last entry is gone | e2e | `e2e/plan-phone.test.ts` [phone] ✓ |
| meal-plan | Phone plan works without drag | e2e | `e2e/plan-phone.test.ts` [desktop/phone] ✓ |
| meal-plan | Plus on Plan opens the Add dialog for today | e2e | `e2e/plan-add.test.ts` [desktop/phone] ✓ |
| meal-plan | Plus on another week targets Monday Dinner | e2e | `e2e/plan-add.test.ts` [desktop/phone] ✓ |
| meal-plan | Plan entry from the Home sheet opens the Add dialog | e2e | `e2e/plan-add.test.ts` [desktop/phone] ✓ |
| meal-plan | Week query returns entries in day, slot and position order | unit | `src/lib/server/plan.test.ts` ✓ |
| meal-plan | Week shows Monday to Sunday with four slots | e2e | `e2e/plan.test.ts` [desktop/phone] ✓ |
| meal-plan | Today is highlighted | e2e | `e2e/plan.test.ts` [desktop/phone] ✓ |
| meal-plan | Previous, next and This week | e2e | `e2e/plan.test.ts` [desktop/phone] ✓ |
| meal-plan | Empty week shows add affordances | e2e | `e2e/plan.test.ts` [desktop/phone] ✓ |
| meal-plan | Phone stacks the days and desktop shows the grid | e2e | `e2e/plan.test.ts` [desktop/phone] ✓ |
| navigation | Active area is derived for sub-routes | unit | `src/lib/nav.test.ts` ✓ |
| navigation | One Main navigation at every width | e2e | `e2e/nav.test.ts` [desktop/phone] ✓ |
| navigation | Only the sticky top bar sits out the page fade | e2e | `e2e/transitions.test.ts` [desktop] ✓ |
| navigation | Navigation reports the scrolled state | e2e | `e2e/nav.test.ts` [desktop/phone] ✓ |
| navigation | Scrolled navigation keeps an opaque card | e2e | `e2e/nav.test.ts` [desktop/phone] ✓ |
| navigation | Content never sits under the navigation | e2e | `e2e/nav.test.ts` [desktop/phone] ✓ |
| navigation | Focused control is not hidden by the navigation | e2e | `e2e/nav.test.ts` [desktop/phone] ✓ |
| navigation | Top bar shows brand, five areas and the recipe actions | e2e | `e2e/nav.test.ts` [desktop] ✓ |
| navigation | Top bar fits from 1024 to 1280 px | e2e | `e2e/nav-fit.test.ts` [desktop/phone] ✓ |
| navigation | Top bar looks like the signed-off hi-fi | manual | manual, see checklist |
| navigation | Phone bar shows five pills and the round add button | e2e | `e2e/phone-bar.test.ts` [phone] ✓ |
| navigation | Current area pill is marked on the phone | e2e | `e2e/phone-bar.test.ts` [phone] ✓ |
| navigation | Phone bar fits at 320 px | e2e | `e2e/phone-bar.test.ts` [phone] ✓ |
| navigation | Phone bar hides while a text field has focus | e2e | `e2e/phone-bar.test.ts` [phone] ✓ |
| navigation | Phone bar respects the safe areas | manual | manual, see checklist |
| navigation | Plus on Recipes pages opens Add recipe | e2e | `e2e/context-add.test.ts` [phone] ✓ |
| navigation | Plus on Eating Out pages opens Add spot | e2e | `e2e/context-add.test.ts` [phone] ✓ |
| navigation | Plus on Home opens the choice sheet | e2e | `e2e/context-add.test.ts` [phone] ✓ |
| navigation | Choice sheet closes on Escape, outside tap and back | e2e | `e2e/context-add.test.ts` [phone] ✓ |
| navigation | Plus is hidden on the recipe form | e2e | `e2e/context-add.test.ts` [phone] ✓ |
| navigation | Recipe actions are reachable on every recipe-side screen on the phone | e2e | `e2e/header.test.ts` [phone] ✓ |
| navigation | Tablet width uses the phone posture | e2e | `e2e/phone-bar.test.ts` [phone] ✓ |
| navigation | Search recipes on the phone focuses the field | e2e | `e2e/header.test.ts` [phone] ✓ |
| navigation | Phone pill on an edited form asks first | e2e | `e2e/shell-guard.test.ts` [phone] ✓ |
| navigation | Top bar actions on an edited form ask first | e2e | `e2e/shell-guard.test.ts` [desktop] ✓ |
| navigation | Unedited form leaves without asking | e2e | `e2e/shell-guard.test.ts` [desktop/phone] ✓ |
| navigation | Header actions per area | unit | `src/lib/nav.test.ts` ✓ |
| navigation | Eating Out header shows spot actions | e2e | `e2e/header.test.ts` [desktop] ✓ |
| navigation | Header follows client-side navigation | e2e | `e2e/header.test.ts` [desktop] ✓ |
| navigation | Phone offers the spot actions on Eating Out | e2e | `e2e/header.test.ts` [phone] ✓ |
| recipe-detail | Cook view shows every part on the phone | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Long ingredient lines wrap in the cook view | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Scaled fractions and ranges read in the cook view | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Recipe without image and times in the cook view | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Ingredients and method side by side from 768 px | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Unknown recipe shows Recipe not found | e2e | `e2e/cook-view.test.ts` [desktop/phone] ✓ |
| recipe-detail | Cooking from the phone reads well | manual | manual, see checklist |
| recipe-detail | Recipe page requests a wake lock | e2e | `e2e/wake-lock.test.ts` [desktop/phone] ✓ |
| recipe-detail | Leaving the recipe page releases the wake lock | e2e | `e2e/wake-lock.test.ts` [desktop/phone] ✓ |
| recipe-detail | Wake lock is requested again after the page was hidden | e2e | `e2e/wake-lock.test.ts` [desktop/phone] ✓ |
| recipe-detail | Missing wake lock API changes nothing | e2e | `e2e/wake-lock.test.ts` [desktop/phone] ✓ |
| recipe-detail | Denied wake lock shows no error | e2e | `e2e/wake-lock.test.ts` [desktop/phone] ✓ |
| recipe-detail | Screen stays on while cooking | manual | manual, see checklist |
| recipe-detail | Card and recipe page share the hero image | e2e | `e2e/recipe-motion.test.ts` [desktop/phone] ✓ |
| recipe-detail | Reduced motion skips the shared element | e2e | `e2e/recipe-motion.test.ts` [desktop/phone] ✓ |
| recipe-detail | Shared photo looks smooth | manual | manual, see checklist |
| recipe-import | Import states render at three widths | e2e | `e2e/import-states.test.ts` [desktop/phone] ✓ |
| recipe-import | Long link and title stay usable in the import | e2e | `e2e/import-states.test.ts` [desktop/phone] ✓ |
| recipes | Recipe form has one Save recipe | e2e | `e2e/form-states.test.ts` [desktop/phone] ✓ |
| recipes | Save stays reachable in a long form | e2e | `e2e/form-states.test.ts` [desktop/phone] ✓ |
| recipes | HEIC photo the server cannot read is rejected | e2e | `e2e/form-states.test.ts` [desktop/phone] ✓ |
| recipes | Fifty ingredient lines stay usable | e2e | `e2e/form-states.test.ts` [desktop/phone] ✓ |
| recipes | A new recipe form starts with one line, the plate and four suggestions | e2e | `e2e/recipe-form.test.ts` [phone] ✓ |
| recipes | An edited recipe without a title keeps a neutral plate | e2e | `e2e/recipe-form.test.ts` [desktop/phone] ✓ |
| recipes | Restored draft offers Discard draft on the new form | e2e | `e2e/form-states.test.ts` [desktop/phone] ✓ |
| release | Package and lockfile carry 0.4.0 | unit | ✗ gap: no passing test named "Scenario: Package and lockfile carry 0.4.0" |
| release | Release v0.4.0 published | manual | manual, see checklist |
| shopping-list | Empty list shows Nothing to buy | e2e | `e2e/list-states.test.ts` [desktop/phone] ✓ |
| shopping-list | Only checked items | e2e | `e2e/list-states.test.ts` [desktop/phone] ✓ |
| shopping-list | Eighty items in nine aisles stay usable | e2e | `e2e/list-states.test.ts` [desktop/phone] ✓ |
| shopping-list | Long names and amounts wrap | e2e | `e2e/list-states.test.ts` [desktop/phone] ✓ |
| shopping-list | Item targets are thumb-sized on the phone | e2e | `e2e/list-states.test.ts` [phone] ✓ |
| shopping-list | Ticking off one-handed feels right in the shop | manual | manual, see checklist |
| shopping-list | Plus on List focuses the add field | e2e | `e2e/list-add.test.ts` [phone] ✓ |
| shopping-list | List item from the Home sheet focuses the add field | e2e | `e2e/list-add.test.ts` [phone] ✓ |
| tags | No tags shows the empty state | e2e | `e2e/tags-states.test.ts` [desktop/phone] ✓ |
| tags | Long tag names wrap in the manager | e2e | `e2e/tags-states.test.ts` [desktop/phone] ✓ |
| tags | Merge reports both names | e2e | `e2e/tags-states.test.ts` [desktop/phone] ✓ |
| tags | New tag created while editing a recipe | e2e | `e2e/recipe-form.test.ts` [desktop/phone] ✓ |
| tags | Duplicate tag name reuses the existing tag | unit | `src/lib/server/tags.test.ts` ✓ |

## Manual checklist (run: `npm run dev` then http://localhost:5173)

- [ ] [archive] Featured matches the signed-off hi-fi (manual (visual judgement by Rue at gate 7))
- [ ] [design-system] Rue signs off wireframes and hi-fi (manual (human gate))
- [ ] [design-system] Icon reads at small sizes (manual (visual judgement at gate 5))
- [ ] [design-system] WCAG 2.2 AA review passes (manual (review at gate 7))
- [ ] [design-system] Press states show on an iPhone (manual (real iPhone: Playwright WebKit does not reproduce iOS Safari :active))
- [ ] [harness] Proof prints test names and passes (manual (infrastructure; proven by running it, its output is the evidence every other unit relies on))
- [ ] [harness] Proof fails on a failing check (manual (infrastructure; proven once in U1 with a deliberate raw colour and a deliberate vendored edit, then reverted))
- [ ] [harness] Proof-full runs e2e on an isolated database (manual (infrastructure; proven by running it in U1))
- [ ] [home] Dashboard matches the signed-off hi-fi (manual (visual judgement by Rue at gate 7))
- [ ] [navigation] Top bar looks like the signed-off hi-fi (manual (visual judgement by Rue at gate 7))
- [ ] [navigation] Phone bar respects the safe areas (manual (real hardware: Playwright cannot emulate safe-area insets))
- [ ] [recipe-detail] Cooking from the phone reads well (manual (real hardware and kitchen use, Rue at gate 7))
- [ ] [recipe-detail] Screen stays on while cooking (manual (real hardware: the lock's effect is only observable on a device))
- [ ] [recipe-detail] Shared photo looks smooth (manual (visual judgement by Rue at gate 7))
- [ ] [release] Release v0.4.0 published (manual (runs on GitHub after the ship-time tag push))
- [ ] [shopping-list] Ticking off one-handed feels right in the shop (manual (real hardware and feel, Rue at gate 7))

## Diffstat

```
 440 files changed, 37974 insertions(+), 16463 deletions(-)
```

## Screenshots (test-results/, not committed)

Files: `test-results/shots/redesign/<screen>-<width>-<normal|worst>.png` (336 PNGs).

## Review

### Verify round 1 fixer (83de935..31618eb)

22 finding groups fixed: unload prompt and data loss, Week scroll, Home sheet history, Featured focus, paging/back, list focus, dock pill rollback, save capsule vs dock, CategoryMenu sheet and Tab trap, disabled save, import draft flag, hideOnType, import alert scroll, plan header sticky, manifest, visual items, MODIFIED deltas, weak tests. Extra bug found and fixed: Enter in the list item editor deleted the item.

Declined: the entry options popover stays a non-modal ARIA menu (taste for Rue).

### Gate-7 polish pass (0195826..0a2e74b)

Chrome cursor, creation motion, soft menus and sheets, hi-fi fixes, including the root cause of the Shell main subgrid problem.

### Round 2

Reviewer: the Home "+" sheet animated its close under reduced motion; fixed (3145801). Nav, dialogs, recipe-form and archive tests restored or pinned (25b5e53).

Design pass: selection family rule (b8997e2); touchstart and 44 px brand (797c9e9); check-off at most 260 ms and form rows without height animation (479efe0); new form with one line, the plate and 4 suggestions (772b38a); spots search row (bba47ea); top bar view transition only from 1100 px (e43a72e); plan FLIP on the page (a3fcacf).

### Round 3

Reviewer and design pass: menus clear of the phone bar, Delete was untappable (bcaa12f); list, tags, eating-out and recipes rows FLIP on the page, one level (a020b80); plan day compact after the outro (0e4b891); 16:9 empty plate and "N" only on new (6d5ffa1); short pages below 1024 (ebc556e); picker plate and "No times" (bbeab40); reduced-motion sampling (9e0eed7); scenarios for the gate-7 fixes, iOS press states manual (b0d4ae3).

Known open in the app: Back pressed during the view transition into a recipe can end on the wrong page (the test waits; app edge case).

### Final proof:full

Red at 36c796a: a real bug. The 16:9 plate rule (`:not(:has(img))`) resized the frame under the pointer when a pasted link previewed on Save, so Save never posted. Fixed in 96e8bec (the frame follows hasImage); rerun green at fe1f678.

### Open for Rue at Gate 7 (taste, as built)

- Entry options popover vs modal.
- Stage photos for List, Tags, Import and New recipe.
- Phone recipe/spot rail "···".
- Facts cards: Favourites and "Your archive".
- "Open per aisle" on phone.
- Card press scale.
- Check-off travel vs fade.
- Dialogs solid vs glass.
- Frame fills the viewport below 1024 on short pages vs the hi-fi short frame.
- Vendored DESIGN.md menus-instant line (Design-System request).
