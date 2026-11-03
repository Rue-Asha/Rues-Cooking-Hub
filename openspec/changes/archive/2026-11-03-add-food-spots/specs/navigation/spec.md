## MODIFIED Requirements

### Requirement: Area navigation
The app SHALL offer five areas, Home (`/`), Recipes (`/recipes`), Plan (`/plan`), List (`/list`) and Eating Out
(`/eating-out`, map-pin icon), in this order, in a floating glass pill nav at the top on viewports at least 1024 px
wide and in a floating pill tab bar at the bottom below that. A small decorative divider SHALL sit between List and
Eating Out in both layouts; it SHALL be `aria-hidden`, not focusable and not a link. The current area SHALL be marked
with `aria-current="page"`, also on pages below it (`/recipes/12` marks Recipes, `/eating-out/3/edit` marks Eating
Out), and the sliding active pill SHALL sit exactly behind the marked link. After the page is scrolled more than 48 px
the nav SHALL carry `data-compact` and shrink; back at the top it SHALL lose it. The compact tab bar SHALL show icons
only (labels faded out, icons centred, the bar narrower but wide enough for five 44 px targets and the divider), its
links keeping their names; under reduced motion the change SHALL be instant. On phones 320 px and wider the five
labels SHALL fit the tab bar without overflow and every link SHALL be at least 44×44 px. Content SHALL never sit under
the nav.

#### Scenario: Desktop shows the top pill nav
- **WHEN** any area is opened at 1280×800
- **THEN** the nav with Home, Recipes, Plan, List and Eating Out is at the top of the viewport and no tab bar is shown
- **proof:** e2e

#### Scenario: Phone shows the bottom tab bar
- **WHEN** any area is opened at 390×844
- **THEN** the tab bar with the five areas is at the bottom of the viewport and no top nav is shown
- **proof:** e2e

#### Scenario: Active area is marked
- **WHEN** the active area is derived for `/`, `/recipes/12`, `/recipes/new/form`, `/plan`, `/list`, `/eating-out`, `/eating-out/new`, `/eating-out/3` and `/eating-out/3/edit`
- **THEN** it is home, recipes, recipes, plan, list and four times eating-out
- **proof:** unit

#### Scenario: Nav marks the open area
- **WHEN** `/plan` and then `/eating-out` are opened
- **THEN** only the Plan item, and then only the Eating Out item, carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Nav marks Eating Out on its sub-pages
- **WHEN** `/eating-out/new` is opened
- **THEN** only the Eating Out item carries `aria-current="page"` and Home does not
- **proof:** e2e

#### Scenario: Divider sits between List and Eating Out
- **WHEN** any area is opened, in the top nav at 1280×800 and in the tab bar at 390×844
- **THEN** the nav has exactly five links, one divider element between the List and the Eating Out link (by position), the divider is `aria-hidden="true"` and contains no link, and pressing Tab with focus on List moves focus to Eating Out
- **proof:** e2e

#### Scenario: Active pill lands on Eating Out
- **WHEN** `/eating-out` is opened at 1280×800 and at 390×844, and on the phone the page is then scrolled 200 px
- **THEN** in each state the active pill's left edge and width match the Eating Out link's within 1 px
- **proof:** e2e

#### Scenario: Five labels fit the phone tab bar
- **WHEN** a page is opened at 390×844 and at 320×640
- **THEN** at both widths the tab bar's list and the document have `scrollWidth` at most their `clientWidth`, every label is fully visible inside its link (its `scrollWidth` at most the link's width), no two links overlap, and every link is at least 44×44 px
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
- **WHEN** a page is scrolled 200 px down at 390×844 and then back to the top, and the same at 320×640
- **THEN** after the first scroll the tab bar is narrower than before at 390 and no wider at 320, its labels are invisible, each icon sits at its item's vertical centre, the open area's pill still sits behind its icon, the links keep the names Home, Recipes, Plan, List and Eating Out, every link is at least 44×44 px and nothing overflows the bar; after the second the labels are visible and the bar has its full width again
- **proof:** e2e

#### Scenario: Reduced motion shrinks the tab bar instantly
- **WHEN** reduced motion is emulated and a page is scrolled 200 px down at 390×844
- **THEN** the tab bar is icons-only and narrower within two animation frames of the scroll
- **proof:** e2e

#### Scenario: Nav shrink looks calm
- **WHEN** Rue scrolls the running app on phone and desktop
- **THEN** the nav shrinks and grows smoothly without jumping content, and the divider reads as a quiet separator, not a sixth item
- **proof:** manual (visual judgement by Rue)

## ADDED Requirements

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
