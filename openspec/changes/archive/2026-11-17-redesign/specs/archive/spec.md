## ADDED Requirements

### Requirement: Archive states
`/recipes` SHALL show Featured (the seven newest, ignoring filters), the tag and Favourites filters (AND), search, sort (Newest first, Title A–Z, Total time) with URL state, the favourite toggle, "Manage tags" and an "Add recipe" primary pill in the page head (kept at gate 4 in addition to the shell's "Add recipe" and the "+"), with the behaviour of the existing archive requirements, styled with fingerprint roles only. Each state SHALL stay readable without horizontal page scroll down to 320 px: no recipes, filters matching nothing, 100+ recipes, long titles and many tags.

#### Scenario: No recipes shows Start your archive
- **WHEN** `/recipes` is opened with an empty archive at 390×844 and 1280×800
- **THEN** "Start your archive" and "Add your first recipe" (→ `/recipes/new`) are shown, and no Featured, filters or list
- **proof:** e2e

#### Scenario: Filters matching nothing offer Clear filters
- **WHEN** the tag Dessert and the search "lentil" match no recipe
- **THEN** "No recipes match" with "Try fewer tags or a different word." and "Clear filters" are shown, and "Clear filters" restores every recipe and removes all filter parameters from the URL
- **proof:** e2e

#### Scenario: A hundred recipes stay usable
- **WHEN** 120 recipes are seeded and `/recipes` is opened at 390×844 and 1280×800
- **THEN** Featured shows `01 / 07`, the count reads "120 recipes", the list shows 24 recipes with "Showing 24 of 120" and "Show 24 more", after "Show 24 more" four times the last recipe can be scrolled into view and opened, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Long titles and many tags stay in the layout
- **WHEN** recipes with 120-character titles and 600-character descriptions and 40 tags with 30-character names are seeded, at 320×640, 768×1024 and 1280×800
- **THEN** every tag filter is reachable after "Show all 40 tags" (wrapped, never scrolling the page sideways), every title is visible wrapped or shortened, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Recipes head keeps Add recipe and Manage tags
- **WHEN** `/recipes` is opened with recipes at 390×844 and 1280×800
- **THEN** the page head (outside the Main navigation and the phone top strip) holds a link "Add recipe" to `/recipes/new` and a link "Manage tags" to `/recipes/tags`
- **proof:** e2e

### Requirement: Tag filter shows eight tags first
With more than eight tags the archive's tag filter SHALL show the Favourites chip and the first eight tags, plus any selected tag outside them kept visible in its position (Gate 5), followed by a "Show all N tags" button (`aria-expanded="false"`); activating it SHALL show every tag and turn into "Show fewer tags" (`aria-expanded="true"`). With eight tags or fewer every tag SHALL be shown and no toggle exists. The toggle SHALL change no filter and no URL parameter (gate 4 addition, client-only).

#### Scenario: More than eight tags collapse behind Show all
- **WHEN** `/recipes` is opened with 40 tags at 390×844 and 1280×800
- **THEN** the filter group shows Favourites and eight tag chips and a button "Show all 40 tags" with `aria-expanded="false"`; after activating it 40 tag chips and "Show fewer tags" with `aria-expanded="true"` are shown and the URL is unchanged
- **proof:** e2e

#### Scenario: A selected tag outside the first eight stays visible
- **WHEN** `/recipes?tag=<the 20th tag>` is opened with 40 tags
- **THEN** the collapsed filter shows Favourites, the eight first tags, then the selected tag as a pressed chip in its place in the tag order (Gate 5), then "Show all 40 tags"; no other tag after the eighth is shown
- **proof:** e2e

#### Scenario: Eight tags or fewer show no toggle
- **WHEN** `/recipes` is opened with eight tags
- **THEN** all eight tag chips are shown and there is no "Show all" button
- **proof:** e2e

### Requirement: Recipe list pages by 24
The archive's recipe list SHALL show the first 24 recipes of the current filter and sort; while more exist it SHALL show "Showing X of N" and a "Show M more" button (M the smaller of 24 and the rest) that appends the next recipes and keeps focus on a sensible place in the list. Changing a filter, the search or the sort SHALL start again at 24. Paging is client-only: load functions and URL parameters are unchanged (gate 4 addition).

#### Scenario: List shows 24 and more on request
- **WHEN** `/recipes` is opened with 30 recipes at 390×844 and 1280×800 and "Show 6 more" is activated
- **THEN** first 24 recipes are listed with "Showing 24 of 30" and "Show 6 more", then 30 recipes with no "Show … more" button, and the URL is unchanged
- **proof:** e2e

#### Scenario: A filter change starts at 24 again
- **WHEN** with 60 recipes "Show 24 more" is activated, then the sort is changed to Title A–Z
- **THEN** 24 recipes are listed again with "Showing 24 of 60"
- **proof:** e2e

## RENAMED Requirements

- FROM: `### Requirement: Archive grid`
- TO: `### Requirement: Archive list`

## MODIFIED Requirements

### Requirement: Archive list
`/recipes` SHALL show every recipe matching the current filters as a row in the list "Recipes": its photo (or the plate with the title's initial, "No photo yet"), title (clamped to 2 lines), description (clamped to 2 lines), total time (prep + cook; none when both are empty) and tags. Time and tags share one line: the tags that do not fit it give way to a "+n" chip (read as "n more tags"), so a phone row at 390 px shows one tag and "+1" where a wider row shows two (Rue's P4, gate 7). The page's sections SHALL settle in on a full page load only, never on in-app navigation, and only fade under reduced motion (fingerprint settle); rows SHALL not enter one by one. With no recipes at all the page SHALL show an empty state with "Add your first recipe". Each row SHALL link to `/recipes/<id>`.

#### Scenario: Rows show photo, title, description, time and tags
- **WHEN** a recipe with image, description, prep 10 and cook 20 minutes and tags Dessert and Baking is in the archive
- **THEN** its row shows the photo, the title, the description, "30 min" and both tags at 1280×800, and at 390×844 the first tag and "+1" on the one meta line
- **proof:** e2e

#### Scenario: Empty archive invites the first recipe
- **WHEN** `/recipes` is opened with no recipes
- **THEN** the empty state shows "Add your first recipe" linking to `/recipes/new`, and no list, filter row or Featured
- **proof:** e2e

#### Scenario: Row without description shows title and meta
- **WHEN** a recipe without description is in the archive
- **THEN** its row shows title, time and tags and no empty description block
- **proof:** e2e

#### Scenario: Long titles and descriptions are clamped
- **WHEN** a recipe has a 120-character title and a 600-character description
- **THEN** the row's title is at most 2 lines high and the description at most 2 lines high
- **proof:** e2e

#### Scenario: Row without image shows the plate
- **WHEN** a recipe without image is in the archive
- **THEN** its row shows the plate with the title's initial, named "No photo yet", in the photo's place
- **proof:** e2e

#### Scenario: Recipe without times shows no time in its row
- **WHEN** a recipe has neither prep nor cook minutes
- **THEN** its row has no time element
- **proof:** e2e

### Requirement: Featured stack
The archive SHALL show "Featured": the 7 most recently added recipes (newest first), one at a time in a card with its photo, title, description, time and tags, a position counter (`01 / 07`), "Previous recipe" and "Next recipe" buttons, swipe on touch and Left/Right arrow keys when Featured has focus. It SHALL show what exists when there are fewer (`01 / 03`), hide when there are none, show no buttons for a single recipe, and not change with the filters.

#### Scenario: Featured query returns the seven newest recipes
- **WHEN** nine recipes with distinct creation times exist
- **THEN** `featuredRecipes()` returns the seven newest, newest first
- **proof:** unit

#### Scenario: Featured stack shows the seven newest
- **WHEN** `/recipes` is opened with nine recipes
- **THEN** Featured shows `01 / 07` and the newest recipe
- **proof:** e2e

#### Scenario: Featured with fewer than seven counts what exists
- **WHEN** `/recipes` is opened with three recipes
- **THEN** the counter shows `01 / 03`
- **proof:** e2e

#### Scenario: Single featured recipe has no arrows
- **WHEN** `/recipes` is opened with one recipe
- **THEN** Featured shows `01 / 01` and no "Previous recipe" or "Next recipe" button
- **proof:** e2e

#### Scenario: Arrows and keyboard step through the stack
- **WHEN** "Next recipe" is clicked once and then ArrowRight and ArrowLeft are pressed with Featured focused (desktop)
- **THEN** the counter shows `02 / 07`, then `03 / 07`, then `02 / 07`, and the shown recipe changes each time
- **proof:** e2e

#### Scenario: Swipe steps through the stack on phone
- **WHEN** Featured is swiped from right to left on the phone project
- **THEN** the counter shows `02 / 07`
- **proof:** e2e

#### Scenario: Featured stack ignores the filters
- **WHEN** a tag filter that matches one recipe is active
- **THEN** Featured still shows the seven newest
- **proof:** e2e

#### Scenario: Featured matches the signed-off hi-fi
- **WHEN** Rue steps through Featured at 375 and 1280 px wide in the running app
- **THEN** it matches the gate-5 hi-fi `/__mockups/redesign/hifi/recipes`: one recipe at a time, no stacked cards behind it
- **proof:** manual (visual judgement by Rue at gate 7)
