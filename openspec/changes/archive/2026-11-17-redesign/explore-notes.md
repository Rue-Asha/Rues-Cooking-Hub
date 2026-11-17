# Explore notes: redesign (gate 3), running log

Decisions from the explore dialogue with Rue, recorded as they are made. scope.md is written from this.

## Usage (Rue, 2026-11-14)
- Phone in the kitchen: recipe open while cooking (read, scale).
- Phone while shopping: tick off the list.
- Desktop: plan the week, import and edit recipes.
- Biggest pain apart from the look: navigation.
  - Phone: search and add are missing (the bottom bar shows only the areas; contract §5 / gate-1 #8 require brand, "Add recipe" and "Search recipes" at every width).
  - Desktop: the centred pill top bar doesn't suit planning on the desktop.

## Decisions (Rue, 2026-11-14)
- Eating Out (food spots) stays out of this redesign; a later change of its own. The contract today omits it (stale "12 of 12 routes"); the redesign must keep its routes working but doesn't restyle them in scope. (Open: how its nav entry behaves meanwhile.)
- Home stays a today dashboard (today's meal, week, what to buy, favourite, recently added; gate-1 #2 kept).
- Cook view: keep read + scale (J3 as today) and add keep-screen-awake while a recipe is open.

## Explorer findings
- Contract: 15 jobs (J1–J15), 12 routes, entities recipe/tag/plan entry/shopping item; link chain recipe → plan entry → ("Add from plan") → list item.
- Nav today: ≥1024 fixed glass top bar (brand, centred PillNav of 5 areas, search + add); <1024 bottom tab bar with the 5 areas only; compact after 48 px scroll; area-aware header actions; hero view transitions.
- Allow-listed data-*: data-hydrated, data-drop-target, data-compact, data-column, data-page-header, data-section-heading.

## Round 2 (Rue, 2026-11-14)
- Desktop nav: "the top bar can basically stay as it is" (said after naming the desktop top bar a pain in round 1; clarified in round 3).
- Phone nav like Notes: area pills + a separate round "+" button; search as its own pill.

## Round 3 (Rue, 2026-11-14)
- Desktop top bar: structure stays (brand, area links, search, add); only the look changes onto the fingerprint.
- Eating Out: carried along minimally. Its nav entry stays, its pages move onto the new shared components without IA work or own wireframes; its own redesign is a later change.

## Round 4 (Rue, 2026-11-14)
- Phone bar pills: Home · Recipes · Plan · List · Spots, plus the round "+"; search as an icon on Recipes (not a pill).
- Round "+" is context-dependent: Recipes → add recipe, Plan → plan entry, List → list item, Spots → add spot (Home: open, see round 5).
- Conflict to settle: gate-1 #8 / contract §5 require brand, "Add recipe" and "Search recipes" at every width (round 5).

## Round 5 (Rue, 2026-11-14)
- Gate-1 #8 holds: brand, "Add recipe" and "Search recipes" stay reachable at every width and on every screen. The context "+" (Recipes → recipe, Plan → plan entry, List → list item, Spots → spot) is in addition, so the phone needs search and add-recipe reachable outside the bar (exact place at gate 4; confirm the reading at Gate 0).
- Home "+": a choice sheet (recipe, plan entry, list item).
- Plan on phone: days stacked vertically, slots per day, today marked at the top.

## Round 6 (Rue, 2026-11-14)
- The redesign adds Eating Out to the functional contract, minimally: job J16 and the four spot routes (data, actions, copy) so nav and e2e rest on it; no spot redesign.
- Appetite: like Notes, several sessions in phases (gate 4 wireframes, gate 5 hi-fi, then the build in waves).
