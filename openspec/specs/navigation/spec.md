# navigation Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
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

### Requirement: Page transitions
Navigation between areas SHALL animate through `document.startViewTransition` when the browser supports it and
reduced motion is not requested; otherwise it SHALL navigate instantly without error.

#### Scenario: Area change uses a view transition
- **WHEN** the user goes from Home to Recipes via the nav
- **THEN** `document.startViewTransition` is called once for that navigation
- **proof:** e2e

#### Scenario: Browser without View Transitions navigates instantly
- **WHEN** `document.startViewTransition` is undefined and the user goes from Home to Plan
- **THEN** the Plan page is shown and no page error is logged
- **proof:** e2e

#### Scenario: Reduced motion skips the page transition
- **WHEN** reduced motion is emulated and the user goes from Home to List
- **THEN** `document.startViewTransition` is not called and the List page is shown
- **proof:** e2e

#### Scenario: Page transition looks calm
- **WHEN** Rue moves between the four areas in the running app
- **THEN** the transition reads as one smooth movement, not a flash
- **proof:** manual (visual judgement by Rue)

### Requirement: Area-aware header actions
The desktop header actions SHALL depend on the area: on `/eating-out` and every page below it they SHALL read "Search
spots" (→ `/eating-out#search`) and "Add spot" (→ `/eating-out/new`); everywhere else they SHALL stay "Search recipes"
(→ `/recipes`) and "Add recipe" (→ `/recipes/new`). They SHALL update on client-side navigation without a reload. The
phone layout has no header.

#### Scenario: Header actions per area
- **WHEN** the header actions are derived for the areas home, recipes, plan, list and eating-out
- **THEN** the first four give "Search recipes" → `/recipes` and "Add recipe" → `/recipes/new`, and eating-out gives "Search spots" → `/eating-out#search` and "Add spot" → `/eating-out/new`
- **proof:** unit

#### Scenario: Eating Out header shows spot actions
- **WHEN** `/eating-out` and then `/plan` are opened at 1280×800
- **THEN** on Eating Out the header shows "Search spots" and "Add spot" with their hrefs and no recipe actions, and on Plan "Search recipes" and "Add recipe"
- **proof:** e2e

#### Scenario: Header follows client-side navigation
- **WHEN** at 1280×800 `/recipes` is opened, a marker is set on `window`, and the Eating Out nav item is clicked
- **THEN** the header shows "Search spots" and "Add spot" and the marker is still set (no reload)
- **proof:** e2e

### Requirement: Desktop header fits at 1024 px
At every desktop width from 1024 px the brand, the five-item nav pill with its divider and the header actions SHALL sit
side by side without overlapping, with either set of header actions (recipe or spot actions), and the page SHALL not
scroll horizontally.

#### Scenario: Desktop header fits at 1024 px
- **WHEN** `/plan` and `/eating-out` are opened at 1024×768
- **THEN** on both pages the brand's right edge is at most the nav pill's left edge, the pill's right edge is at most the header actions' left edge, the divider lies inside the pill, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

### Requirement: Search recipes focuses the search field
Choosing the navigation's "Search recipes" action SHALL open `/recipes` and put focus in the "Search recipes" field of the archive, also when `/recipes` is already open.

#### Scenario: Search action focuses the field
- **WHEN** "Search recipes" is chosen from Home, and again while on `/recipes`
- **THEN** each time `/recipes` is shown and the search field has focus
- **proof:** e2e

