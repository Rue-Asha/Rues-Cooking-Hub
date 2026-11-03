# home Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Bento dashboard
`/` SHALL show a bento dashboard: a hero tile with today's planned recipe (the first Dinner recipe entry of today, else
the first recipe entry of today by slot and position) as a full-bleed photo with a serif headline; a "This week" tile
with the seven days of the current week and their entries (thumbnail or title); a "Shopping list" tile with the number
of open items and the first three open items; a "Favourite" tile with the most recently favourited recipe. Each tile
SHALL link to its area (hero → the recipe, This week → `/plan`, Shopping list → `/list`, Favourite → the recipe).
Without a recipe planned today the hero SHALL show the newest recipe with "Plan your day" (→ `/plan`); with an empty
archive the hero SHALL be a welcome with "Add your first recipe" (→ `/recipes/new`); without favourites the tile SHALL
say "Tap the heart on a recipe to keep it here"; with no open items the list tile SHALL say "List is empty".

#### Scenario: Dashboard prefers today's dinner
- **WHEN** today has a Lunch recipe entry and a Dinner recipe entry
- **THEN** `dashboard()` returns the Dinner recipe as the hero
- **proof:** unit

#### Scenario: Dashboard falls back to the first recipe entry of today
- **WHEN** today has a free-text Breakfast entry, a Lunch recipe entry and a Snacks recipe entry, and no Dinner
- **THEN** `dashboard()` returns the Lunch recipe as the hero
- **proof:** unit

#### Scenario: Hero shows today's planned recipe
- **WHEN** `/` is opened with "Lasagne" planned for today's Dinner
- **THEN** the hero shows Lasagne's photo and title and links to `/recipes/<id>`
- **proof:** e2e

#### Scenario: Nothing planned today shows the newest recipe
- **WHEN** `/` is opened with recipes but no recipe entry today
- **THEN** the hero shows the newest recipe with "Plan your day" linking to `/plan`
- **proof:** e2e

#### Scenario: Empty archive shows the welcome hero
- **WHEN** `/` is opened with no recipes
- **THEN** the hero is the welcome with "Add your first recipe" linking to `/recipes/new`
- **proof:** e2e

#### Scenario: This week tile lists the seven days
- **WHEN** `/` is opened with entries on Monday and Thursday of the current week
- **THEN** the tile shows Mon–Sun, the two days with their entries and the others empty, and links to `/plan`
- **proof:** e2e

#### Scenario: Shopping tile shows open count and first items
- **WHEN** the list has five open items and one checked item
- **THEN** the tile shows "5 open" and the first three open items, and links to `/list`
- **proof:** e2e

#### Scenario: Empty list tile says List is empty
- **WHEN** the list has no open items
- **THEN** the tile shows "List is empty"
- **proof:** e2e

#### Scenario: Favourite tile shows the most recently favourited recipe
- **WHEN** two recipes were favourited at different times
- **THEN** the tile shows the one favourited last and links to it
- **proof:** e2e

#### Scenario: No favourites invites to favourite
- **WHEN** no recipe is a favourite
- **THEN** the tile shows "Tap the heart on a recipe to keep it here"
- **proof:** e2e

#### Scenario: Dashboard looks like the approved mockup
- **WHEN** Rue opens Home on phone and desktop in the running app
- **THEN** the bento matches the approved Home mockup, with the desktop using its width
- **proof:** manual (visual judgement by Rue)

### Requirement: Top spots
`/` SHALL show a "Top spots" section after "Recently added" with the up to four highest-scored Visited spots (score
descending, equal scores by name) as spot cards with their score badge and no rank, and an "All spots" link to
`/eating-out`; it SHALL be hidden when no spot is Visited. The section SHALL carry no `data-tile`, so the bento keeps
exactly its four tiles, and SHALL lay out like "Recently added" (two columns on phone, one row of four on desktop).

#### Scenario: Top spots query returns the four best visited spots
- **WHEN** six Visited spots with scores 9.50, 8.75 "Zeta", 8.75 "beta", 8.10, 7.00, 6.00 and one Want to go spot exist
- **THEN** `topSpots(4)` returns 9.50, "beta", "Zeta", 8.10 in that order, without the Want to go spot
- **proof:** unit

#### Scenario: Home shows Top spots after Recently added
- **WHEN** `/` is opened with two recipes and five Visited spots
- **THEN** a "Top spots" section follows the "Recently added" section, shows four spot cards in score order each with its badge and no rank, has an "All spots" link to `/eating-out`, and the page still has exactly four `[data-tile]` elements
- **proof:** e2e

#### Scenario: Fewer than four visited spots shows what exists
- **WHEN** `/` is opened with two Visited spots and one Want to go spot
- **THEN** "Top spots" shows exactly the two Visited spots
- **proof:** e2e

#### Scenario: No visited spot hides Top spots
- **WHEN** `/` is opened with only Want to go spots
- **THEN** there is no "Top spots" heading and no spot card on the page
- **proof:** e2e

#### Scenario: Top spots row lays out like Recently added
- **WHEN** `/` is opened with four Visited spots at 390×844 and at 1280×800
- **THEN** on phone the cards form two columns of two, on desktop one row of four, the section heading starts at the column's left edge, and the document has no horizontal overflow
- **proof:** e2e

#### Scenario: Top spots look like the approved mockup
- **WHEN** Rue opens Home with Visited spots on phone and desktop
- **THEN** the "Top spots" row matches the approved Eating Out mockup's Home row
- **proof:** manual (visual judgement by Rue at Gate 2)

