## MODIFIED Requirements

### Requirement: Area navigation
The app SHALL offer four areas, Home (`/`), Recipes (`/recipes`), Plan (`/plan`) and List (`/list`), in a floating
glass pill nav at the top on viewports at least 1024 px wide and in a floating pill tab bar at the bottom below that.
At every width the navigation SHALL also offer the brand name "Rues Cooking Hub" (link to `/`), "Add recipe"
(`/recipes/new`) and "Search recipes" (`/recipes`); their presentation MAY differ by width, their availability SHALL NOT.
The current area SHALL be marked with `aria-current="page"`, also on pages below it (`/recipes/12` marks Recipes).
After the page is scrolled more than 48 px the nav SHALL carry `data-compact` and shrink; back at the top it SHALL
lose it. The compact tab bar SHALL show icons only (labels faded out, icons centred, the bar narrower), its links
keeping their names; under reduced motion the change SHALL be instant. Content SHALL never sit under the nav.

#### Scenario: Desktop shows the top pill nav
- **WHEN** any area is opened at 1280×800
- **THEN** the nav with Home, Recipes, Plan and List is at the top of the viewport and no tab bar is shown
- **proof:** e2e

#### Scenario: Phone shows the bottom tab bar
- **WHEN** any area is opened at 390×844
- **THEN** the tab bar with the four areas is at the bottom of the viewport and no top nav is shown
- **proof:** e2e

#### Scenario: Active area is marked
- **WHEN** the active area is derived for `/`, `/recipes/12`, `/recipes/new/form`, `/plan` and `/list`
- **THEN** it is home, recipes, recipes, plan and list
- **proof:** unit

#### Scenario: Nav marks the open area
- **WHEN** `/plan` is opened
- **THEN** only the Plan item carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Tablet and phone landscape use one layout without overlap
- **WHEN** a long page is opened at 768×1024 and at 844×390 and scrolled to its end
- **THEN** exactly one of the two nav layouts is shown and the last content element ends above the tab bar's top edge
- **proof:** e2e

#### Scenario: Nav shrinks on scroll
- **WHEN** a page is scrolled 200 px down and then back to the top
- **THEN** the nav carries `data-compact` after the first scroll and not after the second
- **proof:** e2e

#### Scenario: Compact tab bar shows icons only
- **WHEN** a page is scrolled 200 px down at 390×844 and then back to the top
- **THEN** after the first scroll the tab bar is narrower, its labels are invisible, each icon sits at its item's
  vertical centre, the open area's pill still sits behind its icon and the links keep the names Home, Recipes, Plan
  and List; after the second the labels are visible
  and the bar has its full width again
- **proof:** e2e

#### Scenario: Reduced motion shrinks the tab bar instantly
- **WHEN** reduced motion is emulated and a page is scrolled 200 px down at 390×844
- **THEN** the tab bar is icons-only and narrower within two animation frames of the scroll
- **proof:** e2e

#### Scenario: Nav shrink looks calm
- **WHEN** Rue scrolls the running app on phone and desktop
- **THEN** the nav shrinks and grows smoothly without jumping content
- **proof:** manual (visual judgement by Rue)

#### Scenario: Same actions at every width
- **WHEN** any area is opened at 1280×800 and at 390×844
- **THEN** in both the brand link to `/`, "Add recipe" to `/recipes/new` and "Search recipes" to `/recipes` are available besides the four areas, and exactly one navigation named "Main" is exposed
- **proof:** e2e

## ADDED Requirements

### Requirement: Search recipes focuses the search field
Choosing the navigation's "Search recipes" action SHALL open `/recipes` and put focus in the "Search recipes" field of the archive, also when `/recipes` is already open.

#### Scenario: Search action focuses the field
- **WHEN** "Search recipes" is chosen from Home, and again while on `/recipes`
- **THEN** each time `/recipes` is shown and the search field has focus
- **proof:** e2e
