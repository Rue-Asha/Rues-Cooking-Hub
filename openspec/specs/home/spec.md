# home Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Top spots
`/` SHALL show a "Top spots" section after "Recently added" with the up to three highest-scored Visited spots (score descending, equal scores by name) as spot cards with their score and no rank, and an "All spots" link to `/eating-out`; it SHALL be hidden when no spot is Visited. The section SHALL lay out in two columns on phone and three columns on desktop (Rue, 2026-11-16, as in the hi-fi; not one row of four).

#### Scenario: Top spots query returns the four best visited spots
- **WHEN** six Visited spots with scores 9.50, 8.75 "Zeta", 8.75 "beta", 8.10, 7.00, 6.00 and one Want to go spot exist
- **THEN** `topSpots(4)` returns 9.50, "beta", "Zeta", 8.10 in that order, without the Want to go spot
- **proof:** unit

#### Scenario: Home shows Top spots after Recently added
- **WHEN** `/` is opened with two recipes and five Visited spots
- **THEN** a "Top spots" section follows the "Recently added" section, shows three spot cards in score order each with its score and no rank, and has an "All spots" link to `/eating-out`
- **proof:** e2e

#### Scenario: Fewer than three visited spots shows what exists
- **WHEN** `/` is opened with two Visited spots and one Want to go spot
- **THEN** "Top spots" shows exactly the two Visited spots
- **proof:** e2e

#### Scenario: No visited spot hides Top spots
- **WHEN** `/` is opened with only Want to go spots
- **THEN** there is no "Top spots" heading and no spot card on the page
- **proof:** e2e

#### Scenario: Top spots lay out in two columns on phone and three on desktop
- **WHEN** `/` is opened with three Visited spots at 390×844 and at 1280×800
- **THEN** on phone the cards form two columns, on desktop one row of three, and the document has no horizontal overflow
- **proof:** e2e

### Requirement: Today dashboard
`/` SHALL show the today dashboard: today's recipe (the first Dinner recipe entry of today, else the first recipe entry of today by slot and position) with its photo and title; a "This week" section with the seven days of the current week and their entries (thumbnail or title); a "Shopping list" section with the number of open items and the first three open items; a "Favourite" section with the most recently favourited recipe. Each section SHALL link to its area (today's recipe → the recipe, This week → `/plan`, Shopping list → `/list`, Favourite → the recipe). Without a recipe planned today the newest recipe SHALL take today's place with "Plan your day" (→ `/plan`); with an empty archive the dashboard SHALL show the welcome with "Add your first recipe" (→ `/recipes/new`); without favourites the Favourite section SHALL say "Tap the heart on a recipe to keep it here"; with no open items the Shopping list section SHALL say "List is empty".

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
- **THEN** today's recipe shows Lasagne's photo and title and links to `/recipes/<id>`
- **proof:** e2e

#### Scenario: Nothing planned today shows the newest recipe
- **WHEN** `/` is opened with recipes but no recipe entry today
- **THEN** today's place shows the newest recipe with "Plan your day" linking to `/plan`
- **proof:** e2e

#### Scenario: Empty archive shows the welcome hero
- **WHEN** `/` is opened with no recipes
- **THEN** the dashboard shows the welcome with "Add your first recipe" linking to `/recipes/new`
- **proof:** e2e

#### Scenario: This week lists the seven days
- **WHEN** `/` is opened with entries on Monday and Thursday of the current week
- **THEN** "This week" shows Mon–Sun, the two days with their entries and the others empty, and links to `/plan`
- **proof:** e2e

#### Scenario: Shopping list shows open count and first items
- **WHEN** the list has five open items and one checked item
- **THEN** the Shopping list section shows "5 open" and the first three open items, and links to `/list`
- **proof:** e2e

#### Scenario: Empty list says List is empty
- **WHEN** the list has no open items
- **THEN** the Shopping list section shows "List is empty"
- **proof:** e2e

#### Scenario: Favourite shows the most recently favourited recipe
- **WHEN** two recipes were favourited at different times
- **THEN** the Favourite section shows the one favourited last and links to it
- **proof:** e2e

#### Scenario: No favourites invites to favourite
- **WHEN** no recipe is a favourite
- **THEN** the Favourite section shows "Tap the heart on a recipe to keep it here"
- **proof:** e2e

#### Scenario: Dashboard matches the signed-off hi-fi
- **WHEN** Rue opens Home at 375, 768 and 1280 px wide in the running app
- **THEN** it matches the gate-5 hi-fi `/__mockups/redesign/hifi/home` (with the checkpoint A fingerprint 2.0.0)
- **proof:** manual (visual judgement by Rue at gate 7)

### Requirement: Today dashboard states
`/` SHALL stay the today dashboard, its sections in this order (gate 4): today's recipe as the hero, "This week", the list preview, "Favourite", "Recently added", "Top spots". It shows today's weekday and date, the greeting "What's cooking, Rue?" with the summary sentence, today's recipe, "This week", the shopping list preview with the first three open items, "Favourite" and "Recently added" (up to four), with the behaviour of the existing Home requirements (the "Top spots" row included and kept, Rue at Gate 1), styled with fingerprint roles only. Each state SHALL stay readable without horizontal page scroll down to 320 px: nothing planned today, nothing planned this week, an empty list, no favourite, no recipes at all (welcome with "Add your first recipe"), and overlong titles.

#### Scenario: Home shows the today dashboard
- **WHEN** a seeded archive with today's Dinner planned, five open list items, a favourite and six recipes is opened at `/` at 390×844 and 1280×800
- **THEN** the greeting heading "What's cooking, Rue?", the summary sentence, today's recipe labelled "Tonight · Dinner", "This week" with seven days, the first three open items, the favourite recipe and four recipes under "Recently added" are shown, the sections in that order in reading order
- **proof:** e2e

#### Scenario: Nothing planned this week
- **WHEN** recipes exist but the current week has no entries
- **THEN** the newest recipe takes today's place with "Plan your day", all seven days read "Nothing planned", and the summary sentence reads "0 meals planned this week, N things to buy."
- **proof:** e2e

#### Scenario: Empty list and no favourite on Home
- **WHEN** recipes exist, the list is empty and no recipe is a favourite
- **THEN** the list preview says "List is empty" and the Favourite section says "Tap the heart on a recipe to keep it here" and links to `/recipes`
- **proof:** e2e

#### Scenario: No recipes shows the welcome state
- **WHEN** `/` is opened with an empty archive at 390×844
- **THEN** "Every recipe worth keeping, in one place" and "Add your first recipe" (→ `/recipes/new`) are shown, and there is no "Recently added" and no favourite recipe
- **proof:** e2e

#### Scenario: Long titles stay inside the dashboard
- **WHEN** today's recipe, the favourite and the four recently added recipes have 120-character titles and 600-character descriptions, at 320×640, 768×1024 and 1280×800
- **THEN** every title is visible (wrapped or shortened with its full text on the recipe page) inside its section, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Top spots stay on the dashboard
- **WHEN** `/` is opened on the rebuilt dashboard at 390×844 and at 1280×800 with recipes and three Visited spots seeded
- **THEN** a "Top spots" section after "Recently added" shows the three spots in score order, each linking to its spot page, with an "All spots" link to `/eating-out`
- **proof:** e2e

