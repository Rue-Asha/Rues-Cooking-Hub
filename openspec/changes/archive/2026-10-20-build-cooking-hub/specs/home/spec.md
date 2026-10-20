## ADDED Requirements

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
