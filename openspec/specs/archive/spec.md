# archive Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Archive grid
`/recipes` SHALL show every recipe matching the current filters as a card: hero image (or the designed placeholder),
title (clamped to 2 lines), 2–3 lines of description (clamped to 3), total time (prep + cook; none when both are empty)
and tags. Cards SHALL enter staggered (each card's entrance delay larger than the previous one's). With no recipes at
all the page SHALL show an empty state with "Add your first recipe". Each card SHALL link to `/recipes/<id>`.

#### Scenario: Cards show image, title, description, time and tags
- **WHEN** a recipe with image, description, prep 10 and cook 20 minutes and tags Dessert and Baking is in the archive
- **THEN** its card shows the image, the title, the description, "30 min" and both tags
- **proof:** e2e

#### Scenario: Empty archive invites the first recipe
- **WHEN** `/recipes` is opened with no recipes
- **THEN** the empty state shows "Add your first recipe" linking to `/recipes/new`, and no grid, filter row or featured stack
- **proof:** e2e

#### Scenario: Card without description shows title and meta
- **WHEN** a recipe without description is in the archive
- **THEN** its card shows title, time and tags and no empty description block
- **proof:** e2e

#### Scenario: Long titles and descriptions are clamped
- **WHEN** a recipe has a 120-character title and a 600-character description
- **THEN** the card's title is at most 2 lines high and the description at most 3 lines high
- **proof:** e2e

#### Scenario: Card without image shows the placeholder
- **WHEN** a recipe without image is in the archive
- **THEN** its card shows the ImagePlaceholder in the image area
- **proof:** e2e

#### Scenario: Recipe without times shows no time on its card
- **WHEN** a recipe has neither prep nor cook minutes
- **THEN** its card has no time element
- **proof:** e2e

#### Scenario: Cards enter staggered
- **WHEN** `/recipes` is opened with five recipes
- **THEN** each card's entrance animation starts later than the previous card's
- **proof:** e2e

#### Scenario: Reduced motion shows cards without entrance animation
- **WHEN** `/recipes` is opened with reduced motion emulated
- **THEN** no card has a running entrance animation and all cards are fully visible
- **proof:** e2e

#### Scenario: Card entrance looks lively and calm
- **WHEN** Rue opens the archive in the running app
- **THEN** the staggered entrance reads as lively without delaying use
- **proof:** manual (visual judgement by Rue)

### Requirement: Featured stack
The archive header SHALL show "Featured": the 7 most recently added recipes (newest first) as a stacked card carousel
with a `01/07` counter, prev/next arrows, swipe on touch and Left/Right arrow keys when the stack has focus. It SHALL
show what exists when there are fewer (`01/03`), hide when there are none, show no arrows for a single recipe, and not
change with the filters.

#### Scenario: Featured query returns the seven newest recipes
- **WHEN** nine recipes with distinct creation times exist
- **THEN** `featuredRecipes()` returns the seven newest, newest first
- **proof:** unit

#### Scenario: Featured stack shows the seven newest
- **WHEN** `/recipes` is opened with nine recipes
- **THEN** the stack shows `01/07` and the newest recipe in front
- **proof:** e2e

#### Scenario: Featured with fewer than seven counts what exists
- **WHEN** `/recipes` is opened with three recipes
- **THEN** the counter shows `01/03`
- **proof:** e2e

#### Scenario: Single featured recipe has no arrows
- **WHEN** `/recipes` is opened with one recipe
- **THEN** the stack shows `01/01` and no prev/next arrows
- **proof:** e2e

#### Scenario: Arrows and keyboard step through the stack
- **WHEN** next is clicked once and then ArrowRight and ArrowLeft are pressed with the stack focused (desktop)
- **THEN** the counter shows `02/07`, then `03/07`, then `02/07`, and the front card changes each time
- **proof:** e2e

#### Scenario: Swipe steps through the stack on phone
- **WHEN** the stack is swiped from right to left on the phone project
- **THEN** the counter shows `02/07`
- **proof:** e2e

#### Scenario: Featured stack ignores the filters
- **WHEN** a tag filter that matches one recipe is active
- **THEN** the stack still shows the seven newest
- **proof:** e2e

#### Scenario: Featured stack looks like a coverflow
- **WHEN** Rue steps through the stack in the running app
- **THEN** cards behind the front card peek with depth and the step animates smoothly
- **proof:** manual (visual judgement by Rue)

### Requirement: Filters
A chip row SHALL list the tags; selecting several SHALL show recipes having all of them. A "Favourites" toggle SHALL
show only favourites. A live count ("12 recipes", "1 recipe") SHALL follow every change. With no match the page SHALL
show "No recipes match" and "Clear filters". The filter state (tags, favourites, search, sort) SHALL live in the URL
(`?tags=<ids>&fav=1&q=<text>&sort=<newest|title|time>`) so back/forward and reload restore it. Cards that stay
SHALL glide to their new positions (FLIP).

#### Scenario: Several tags show recipes having all of them
- **WHEN** recipes tagged {Dessert, Baking}, {Dessert} and {Baking} exist and the chips Dessert and Baking are selected
- **THEN** only the first recipe is shown and the count says "1 recipe"
- **proof:** e2e

#### Scenario: Tag filter requires all tags on the server
- **WHEN** `listRecipes` is asked for two tag ids
- **THEN** it returns only recipes carrying both
- **proof:** unit

#### Scenario: Favourites-only toggle
- **WHEN** two of five recipes are favourites and "Favourites" is switched on
- **THEN** only those two are shown and the count says "2 recipes"
- **proof:** e2e

#### Scenario: No match offers to clear filters
- **WHEN** the selected filters match no recipe and "Clear filters" is pressed
- **THEN** "No recipes match" was shown, and afterwards every recipe is shown and the URL has no filter parameters
- **proof:** e2e

#### Scenario: Filter state survives reload and back
- **WHEN** Dessert is selected, then Favourites, then the page is reloaded and Back is pressed
- **THEN** after the reload both filters are still active, and after Back only Dessert is
- **proof:** e2e

#### Scenario: Filtered cards glide to new positions
- **WHEN** a tag chip is selected so that a card that stays moves to another grid position
- **THEN** that card has a running transform animation right after the change
- **proof:** e2e

#### Scenario: Reduced motion filters without gliding
- **WHEN** reduced motion is emulated and a tag chip is selected
- **THEN** no card has a running animation after the change
- **proof:** e2e

#### Scenario: Filter gliding looks smooth
- **WHEN** Rue changes filters and sort in the running app
- **THEN** cards glide without flicker or overlap
- **proof:** manual (visual judgement by Rue)

### Requirement: Search
A search field SHALL search title, description, ingredient names and tag names, case-insensitively including non-ASCII
letters (`spätzle` finds "Käse-Spätzle"), combined with the tag filter (AND). An empty query SHALL show all recipes;
no match SHALL show the same empty state as the filters.

#### Scenario: Search covers title, description, ingredients and tags
- **WHEN** recipes match "lemon" once in a title, once in a description, once in an ingredient name and once in a tag name only
- **THEN** a search for "lemon" returns all four
- **proof:** unit

#### Scenario: Search ignores case for umlauts
- **WHEN** a recipe titled "Käse-Spätzle" exists and `spätzle`, `SPÄTZLE` and `Spätzle` are searched
- **THEN** each search returns it
- **proof:** unit

#### Scenario: Empty search returns all recipes
- **WHEN** the query is empty or only spaces
- **THEN** every recipe is returned
- **proof:** unit

#### Scenario: Search combines with the tag filter
- **WHEN** "lemon" is searched with the tag Dessert selected
- **THEN** only recipes matching "lemon" and tagged Dessert are returned
- **proof:** unit

#### Scenario: Search from the archive
- **WHEN** `spätzle` is typed into the search field
- **THEN** the grid shows only "Käse-Spätzle", the count says "1 recipe" and the URL carries `q=spätzle`
- **proof:** e2e

#### Scenario: Search without match shows the empty state
- **WHEN** a word no recipe contains is searched
- **THEN** "No recipes match" and "Clear filters" are shown
- **proof:** e2e

### Requirement: Sort
The archive SHALL sort by newest (default), title A–Z (case- and accent-aware) or total time (ascending, recipes
without time last).

#### Scenario: Newest first by default
- **WHEN** recipes are listed without a sort
- **THEN** they come newest first
- **proof:** unit

#### Scenario: Sort by title
- **WHEN** "Banana bread", "apple pie" and "Äpfel im Schlafrock" are sorted by title
- **THEN** the order is "Äpfel im Schlafrock", "apple pie", "Banana bread" (Ä sorts as A, case is ignored)
- **proof:** unit

#### Scenario: Sort by total time puts recipes without time last
- **WHEN** recipes with 45, 15 and no minutes are sorted by total time
- **THEN** the order is 15, 45, then the one without time
- **proof:** unit

#### Scenario: Sort choice in the archive
- **WHEN** "Title A–Z" is chosen in the sort control
- **THEN** the cards are in title order and the URL carries `sort=title`
- **proof:** e2e

### Requirement: Favourites
A heart toggle on each card and on the recipe page SHALL switch the favourite flag (`aria-pressed`), record when it
was favourited and animate.

#### Scenario: Favourite toggles on a card
- **WHEN** the heart on a card is pressed and the page is reloaded
- **THEN** the heart is `aria-pressed="true"` after the reload, and pressing it again clears it
- **proof:** e2e

#### Scenario: Favourite toggle feels alive
- **WHEN** Rue toggles a favourite on a card and on a recipe page in the running app
- **THEN** the heart animates on and off
- **proof:** manual (visual judgement by Rue)

