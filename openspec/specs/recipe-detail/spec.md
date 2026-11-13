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
While the page scrolls, the hero image SHALL move slower than the content and zoom slightly (parallax). Card → recipe
page and back SHALL use a shared-element view transition of the hero image (`view-transition-name: recipe-hero-<id>`
on both the card image and the hero). Under reduced motion there SHALL be no parallax and no shared element.

#### Scenario: Hero moves on scroll
- **WHEN** the recipe page is scrolled 200 px
- **THEN** the hero image's computed transform differs from its transform before scrolling
- **proof:** e2e

#### Scenario: Reduced motion keeps the hero still
- **WHEN** reduced motion is emulated and the page is scrolled 200 px
- **THEN** the hero image's computed transform is `none`
- **proof:** e2e

#### Scenario: Card and recipe page share the hero image
- **WHEN** a card in the archive is clicked
- **THEN** `document.startViewTransition` is called, the card image carried `view-transition-name: recipe-hero-<id>` and the hero on the recipe page carries the same name
- **proof:** e2e

#### Scenario: Reduced motion skips the shared element
- **WHEN** reduced motion is emulated and a card is clicked
- **THEN** `document.startViewTransition` is not called and neither image has a `view-transition-name`
- **proof:** e2e

#### Scenario: Hero parallax and shared element look smooth
- **WHEN** Rue opens a recipe from the archive, scrolls and goes back in the running app
- **THEN** the photo carries over between card and hero and the parallax feels calm
- **proof:** manual (visual judgement by Rue)

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

