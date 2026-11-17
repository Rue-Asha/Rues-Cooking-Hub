# recipe-detail Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Recipe page
`/recipes/<id>` SHALL show a full-bleed hero image (or the placeholder hero) with a glass info panel holding title,
times (prep, cook, total; none shown when empty), servings, tags, the favourite toggle and a "Source" link (only when
there is a source URL), then the ingredients and steps by section (section titles as headings, each ingredient line as
its original text) and the rendered notes, with the actions Edit, Delete and "Add to plan". An unknown id SHALL answer
404.

#### Scenario: Recipe page shows hero, info panel, sections and notes
- **WHEN** a recipe with image, source URL, times, servings 4, two tags, two ingredient sections, steps and notes is opened
- **THEN** the hero image, the panel with title, "Prep 10 min · Cook 20 min · 30 min total", "4 servings", both tags, the heart and "Source", both section headings with their lines, the steps and the rendered notes are shown
- **proof:** e2e

#### Scenario: Recipe page without image shows the placeholder hero
- **WHEN** a recipe without image is opened
- **THEN** the hero area shows the ImagePlaceholder
- **proof:** e2e

#### Scenario: Recipe page without source URL shows no source link
- **WHEN** a recipe without source URL is opened
- **THEN** the info panel has no "Source" link
- **proof:** e2e

#### Scenario: Recipe without times shows no times on its page
- **WHEN** a recipe without prep and cook minutes is opened
- **THEN** the info panel shows no time line
- **proof:** e2e

#### Scenario: Unknown recipe answers 404
- **WHEN** `/recipes/999999` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: Favourite toggles on the recipe page
- **WHEN** the heart in the info panel is pressed and the page is reloaded
- **THEN** the heart is `aria-pressed="true"` and the recipe shows under the archive's Favourites filter
- **proof:** e2e

### Requirement: Hero motion
The recipe photo SHALL be the page's stage and SHALL not move while the page scrolls (no parallax; the hi-fi's motion is press scale, pill glide and the card settle on a full load only). Archive → recipe page and back SHALL use a shared-element view transition of the recipe photo (`view-transition-name: recipe-hero-<id>` on both the archive photo and the stage photo). Under reduced motion there SHALL be no shared element.

#### Scenario: Card and recipe page share the hero image
- **WHEN** a recipe in the archive list is opened
- **THEN** `document.startViewTransition` is called, the archive photo carried `view-transition-name: recipe-hero-<id>` and the stage photo on the recipe page carries the same name
- **proof:** e2e

#### Scenario: Reduced motion skips the shared element
- **WHEN** reduced motion is emulated and a recipe in the archive list is opened
- **THEN** `document.startViewTransition` is not called and neither photo has a `view-transition-name`
- **proof:** e2e

#### Scenario: Shared photo looks smooth
- **WHEN** Rue opens a recipe from the archive and goes back in the running app
- **THEN** the photo carries over between the archive and the stage
- **proof:** manual (visual judgement by Rue at gate 7)

### Requirement: Add to plan from a recipe
"Add to plan" on the recipe page SHALL open a dialog with day (default today), slot (default Dinner) and servings
(default the recipe's servings, at least 1); confirming SHALL add a recipe entry at the end of that slot and offer a
link to that week in the plan.

#### Scenario: Add to plan from the recipe
- **WHEN** "Add to plan" is pressed on a 2-serving recipe, Wednesday of the current week, Dinner and 4 servings are chosen and confirmed
- **THEN** the plan for that week shows the recipe in Wednesday's Dinner slot with 4 servings
- **proof:** e2e

#### Scenario: Servings below 1 are rejected when adding from the recipe
- **WHEN** servings 0 are entered in the "Add to plan" dialog and confirmed
- **THEN** "Servings must be at least 1" is shown and no entry is added
- **proof:** e2e

### Requirement: Servings scaling on the recipe page
The recipe page SHALL offer a servings control labelled "Scale to servings" (group "Scale recipe"), starting at the recipe's servings, with "Scale down" and "Scale up" (one serving each) and, while the value differs from the recipe's servings, "Reset to N servings". Values SHALL be whole numbers of at least 1; anything else SHALL NOT be applied and SHALL show "Servings must be at least 1". Scaling SHALL be a view only: it multiplies each ingredient line's quantity by chosen servings divided by the recipe's servings, shows "for N" with the chosen servings and updates without reload, stores nothing, resets on reload, and does not change the "Add to plan" default. A scaled line SHALL read quantity (at most two decimals, trailing zeros dropped), unit, name and note; a range line SHALL keep both ends and scale both; a line without readable quantity SHALL stay unchanged; at the recipe's own servings every line SHALL show its original text. Steps, notes and times SHALL NOT be scaled.

#### Scenario: Scaling a line doubles its quantity
- **WHEN** the line "200 g flour" of a 2-serving recipe is scaled to 4 servings
- **THEN** it reads "400 g flour"
- **proof:** unit

#### Scenario: Scaling rounds to two decimals
- **WHEN** "1 cup milk" of a 3-serving recipe is scaled to 1 serving
- **THEN** it reads "0.33 cup milk"
- **proof:** unit

#### Scenario: Scaling a range scales both ends
- **WHEN** the line "2-3 cloves garlic" of a 2-serving recipe is scaled to 4 servings
- **THEN** it reads "4–6 cloves garlic"
- **proof:** unit

#### Scenario: Lines without quantity and the recipe's own servings stay unchanged
- **WHEN** "salt to taste" is scaled to 6 servings, and "200 g flour" is scaled to the recipe's own servings
- **THEN** both return their original text
- **proof:** unit

#### Scenario: Invalid scale target leaves the line unchanged
- **WHEN** "200 g flour" is scaled to 0 or a non-whole target
- **THEN** it returns its original text
- **proof:** unit

#### Scenario: Unprintable scaled amounts leave the line unchanged
- **WHEN** a line is scaled so its amount would round to 0 or print in exponent notation, or the recipe's servings are invalid
- **THEN** it returns its original text
- **proof:** unit

#### Scenario: Scale control updates the ingredients
- **WHEN** "Scale up" is pressed twice on a 2-serving recipe with "200 g flour"
- **THEN** the ingredients heading reads "for 4", the line reads "400 g flour" and "Reset to 2 servings" is shown; reloading shows the original text and "for 2"
- **proof:** e2e

#### Scenario: Invalid scale value is rejected
- **WHEN** 0 is entered in "Scale to servings"
- **THEN** "Servings must be at least 1" is shown and the ingredients stay as before
- **proof:** e2e

### Requirement: No planned status on the recipe page
The recipe page SHALL NOT show whether or when the recipe is planned; the only route to the plan from the page is "Add to plan".

#### Scenario: Planned recipe shows no planned status
- **WHEN** a recipe planned for tomorrow's Dinner is opened
- **THEN** neither "Planned" nor "Not planned yet" nor "Pick a day" is shown, and "Add to plan" is
- **proof:** e2e

### Requirement: Cook view on the phone
`/recipes/[id]` SHALL be a phone-first cook view showing the image (or the placeholder), tags, favourite toggle, title, times, servings with "Scale to servings", ingredients, method, notes and source, with "Add to plan", and "Edit" and "Delete recipe" in the "More recipe actions" menu (approved by Rue 2026-11-16, gate 7), with the behaviour of the existing recipe page requirements, styled with fingerprint roles only. The order (gate 4) SHALL be photo with title, the facts and servings bar with "Add to plan", then ingredients, then method and notes; on the phone the scale control and the ingredients SHALL be reachable without passing the method, and from 768 px ingredients and method SHALL sit side by side in two columns. Each state SHALL stay readable without horizontal page scroll down to 320 px: no image, no times, very long ingredient lines, scaled fractions and ranges; an unknown id SHALL answer 404 with a plain card "Recipe not found", "This recipe doesn't exist, or it was deleted." and a link "Back to recipes" to `/recipes` inside the app shell (gate 4; client markup only, the status stays 404).

#### Scenario: Cook view shows every part on the phone
- **WHEN** a recipe with image, two tags, times, 4 servings, two ingredient sections, three steps, notes and a source is opened at 390×844
- **THEN** image, tags, favourite toggle, title, "Prep 10 min · Cook 20 min · 30 min total", "Scale to servings", the ingredients, "Method", "Notes", "Source" and "Add to plan" are present, the "More recipe actions" menu offers "Edit" and "Delete recipe", and the "Scale to servings" group comes before "Method" in reading order
- **proof:** e2e

#### Scenario: Long ingredient lines wrap in the cook view
- **WHEN** a recipe whose ingredient lines are 200 characters long, one an unbroken 60-character word, is opened at 320×640
- **THEN** every line is fully visible inside the ingredients column and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Scaled fractions and ranges read in the cook view
- **WHEN** a 2-serving recipe with "1/2 tsp salt" and "2–3 cloves garlic" is scaled to 3 servings at 390×844
- **THEN** the lines read "0.75 tsp salt" and "3–4.5 cloves garlic" and "for 3" is shown
- **proof:** e2e

#### Scenario: Recipe without image and times in the cook view
- **WHEN** a recipe without image and without times is opened at 390×844 and 1280×800
- **THEN** the placeholder "No photo yet" is shown, no times line exists, and the layout keeps the scale control and ingredients in place
- **proof:** e2e

#### Scenario: Ingredients and method side by side from 768 px
- **WHEN** a recipe with ingredients and steps is opened at 768×1024 and 1280×800, and at 390×844
- **THEN** at the first two sizes the "Ingredients" and "Method" sections' tops are within 8 px of each other and they do not overlap; at 390×844 "Method" starts below "Ingredients"
- **proof:** e2e

#### Scenario: Unknown recipe shows Recipe not found
- **WHEN** `/recipes/999999` is opened at 390×844
- **THEN** the response status is 404, the Main navigation is present, and "Recipe not found" with a link "Back to recipes" to `/recipes` is shown
- **proof:** e2e

#### Scenario: Cooking from the phone reads well
- **WHEN** Rue cooks from a recipe on the phone in the kitchen
- **THEN** ingredients and steps are readable at arm's length and the scale control is easy to hit
- **proof:** manual (real hardware and kitchen use, Rue at gate 7)

### Requirement: Screen stays awake on the recipe page
While a recipe page is open and visible the app SHALL hold a Screen Wake Lock (`navigator.wakeLock.request('screen')`), release it when the page is left, and request it again when the page becomes visible after being hidden. Where the API is missing or the request is denied the page SHALL work as before and show no error. The lock is client-only; no server, load or action code changes.

#### Scenario: Recipe page requests a wake lock
- **WHEN** a recipe page is opened with a stubbed `navigator.wakeLock`
- **THEN** `request` was called once with `'screen'`
- **proof:** e2e

#### Scenario: Leaving the recipe page releases the wake lock
- **WHEN** a recipe page holding a stubbed wake lock is left via the Recipes link
- **THEN** the sentinel's `release` was called once and no new request was made on `/recipes`
- **proof:** e2e

#### Scenario: Wake lock is requested again after the page was hidden
- **WHEN** on a recipe page with a stubbed wake lock the document's visibility switches to hidden (the stub's sentinel fires `release`) and back to visible
- **THEN** `request('screen')` has been called twice
- **proof:** e2e

#### Scenario: Missing wake lock API changes nothing
- **WHEN** a recipe page is opened with `navigator.wakeLock` undefined
- **THEN** the page renders its title and ingredients and no page error is logged
- **proof:** e2e

#### Scenario: Denied wake lock shows no error
- **WHEN** a recipe page is opened with a stubbed `navigator.wakeLock.request` that rejects with `NotAllowedError`
- **THEN** no page error is logged and no alert or status text appears
- **proof:** e2e

#### Scenario: Screen stays on while cooking
- **WHEN** Rue leaves a recipe open on the phone longer than its auto-lock time
- **THEN** the screen stays on, and turns off as usual after leaving the recipe page
- **proof:** manual (real hardware: the lock's effect is only observable on a device)

