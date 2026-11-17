## ADDED Requirements

### Requirement: Eating Out on the shared shell
The four Eating Out pages (`/eating-out`, `/eating-out/new`, `/eating-out/[id]`, `/eating-out/[id]/edit`) SHALL render inside the new shell and SHALL use the new shared components and fingerprint roles only, with no IA change: their behaviour SHALL stay as the existing eating-out requirements state (want/visited, score, ranks, search and filters, sort, Mark visited, photo transition), and the suite proving those requirements SHALL stay green.

#### Scenario: Spot pages render on the fingerprint
- **WHEN** each of the four spot pages is opened at 390×844 and 1280×800 with the seeded spots
- **THEN** each shows its contract heading, the Main navigation marks Eating Out, the document carries the app accent (`data-accent="rosemary"`), the `h1` uses the fingerprint display font and body text the fingerprint UI font, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Spot pages keep their behaviour
- **WHEN** at 390×844 a spot "Ramen Bar" is added as Want, found with "Search spots", marked visited with a score of 8.5, and then opened from the list
- **THEN** the spot page shows "Ramen Bar" as Visited with "8.50" after a reload, and the existing `e2e/spots-*.test.ts` files stay green with changes limited to roles, names or posture helpers the new shell demands
- **proof:** e2e

### Requirement: Eating Out in the functional contract
`docs/functional-contract.md` SHALL describe Eating Out minimally: job J16 (keep a list of food spots to try and visited ones with a score), section 4 entries for `/eating-out`, `/eating-out/new`, `/eating-out/[id]` and `/eating-out/[id]/edit` (data shown, actions, required states), their English copy in the copy list, the navigation entry ("Eating Out", "Search spots", "Add spot", phone pill "Spots"), and a route coverage line reading 16 of 16. `PRODUCT.md` SHALL name five areas.

#### Scenario: Contract covers Eating Out
- **WHEN** `docs/functional-contract.md` is read
- **THEN** it contains "J16.", a section heading for each of the four spot routes, the strings "Search spots" and "Add spot" in the copy list, a coverage table row per spot route, and "16 of 16 covered"
- **proof:** unit

#### Scenario: Product names five areas
- **WHEN** `PRODUCT.md` is read
- **THEN** its operating context names five areas including Eating Out
- **proof:** unit

## MODIFIED Requirements

### Requirement: Eating Out list
`/eating-out` SHALL show a "Visited | Want to go" segment with the number of matching spots on each side and the
spots of the chosen side as cards in a grid like the recipe archive (four columns on desktop, two on phone). Without a
`status` in the URL the segment SHALL be Visited, unless no spot is Visited and at least one is Want to go, then Want
to go. With no spots at all the page SHALL show an empty state (serif heading "Start your list", a short text and an
"Add spot" button to `/eating-out/new`, on the family EmptyState without an image like every other empty state of the
redesign) and no segment, filters or grid. With spots but none on the
chosen side it SHALL show a short line ("No visited spots yet." / "Nothing on your want-to-go list yet.") with "Add
spot". Segment, search, filters and sort SHALL live in the URL (`?status=&q=&tags=&city=&price=&sort=`) so reload and
back/forward restore them. Below 1024 px the page header SHALL carry an "Add spot" button. From 768 to 1023 px the spot search SHALL take its own row above the sort and city selects, so its placeholder is never cut off; from 1024 px it sits beside them (Rue, gate 7).

#### Scenario: Spot search keeps its placeholder whole at every width
- **WHEN** `/eating-out` with one visited spot in Berlin is opened at 375, 768, 1024 and 1280 px wide
- **THEN** the search placeholder "Search spots, areas or tags" fits its field at each width; at 768 the search spans the row above the sort and city selects, and at 1024 and 1280 it sits on one row with them (`SpotFilters.svelte`)
- **proof:** e2e

#### Scenario: Default segment follows what exists
- **WHEN** the default status is derived for totals {visited 2, want 1}, {visited 0, want 2} and {visited 0, want 0}
- **THEN** it is `visited`, `want` and `visited`
- **proof:** unit

#### Scenario: Visited is the default segment
- **WHEN** `/eating-out` is opened with two Visited spots and one Want to go spot
- **THEN** Visited is selected, the segment reads "Visited 2" and "Want to go 1", and two cards are shown
- **proof:** e2e

#### Scenario: Want to go opens when nothing is visited
- **WHEN** `/eating-out` is opened with two Want to go spots and no Visited spot
- **THEN** Want to go is selected and both cards are shown
- **proof:** e2e

#### Scenario: Empty Eating Out invites the first spot
- **WHEN** `/eating-out` is opened with no spots
- **THEN** the heading "Start your list", its short text and an "Add spot" link to `/eating-out/new` are shown, and no segment, filter row or grid
- **proof:** e2e

#### Scenario: Empty side shows a short line
- **WHEN** only Want to go spots exist and the Visited side is chosen
- **THEN** "No visited spots yet." and an "Add spot" link to `/eating-out/new` are shown and no grid
- **proof:** e2e

#### Scenario: Eating Out view survives reload and back
- **WHEN** Want to go is chosen, then the tag chip Brunch, then Name sort, then the page is reloaded and Back is pressed
- **THEN** after the reload Want to go, Brunch and Name are still active, and after Back only Want to go and Brunch are
- **proof:** e2e

#### Scenario: Phone page carries Add spot
- **WHEN** `/eating-out` is opened on the phone project with spots
- **THEN** a visible "Add spot" link to `/eating-out/new` is in the page header
- **proof:** e2e

### Requirement: Spot page
`/eating-out/<id>` SHALL show a full-bleed hero photo (the placeholder hero without one) with a glass info panel
holding name, score badge (Visited only), price level, spot tags and "Neighbourhood, City"; below it an Address row with
"Open in Maps" (only with an address), a Website row (only with a website), and the notes (only with notes, rendered
like recipe notes); and the actions Edit, Delete and, on Want to go spots, "Mark visited". Edit and Delete SHALL sit in
the "More spot actions" menu beside the page's actions (approved by Rue 2026-11-16, gate 7). "Open in Maps" SHALL link to
`https://www.google.com/maps/search/?api=1&query=` plus the URL-encoded name, address and city (those that exist,
joined by ", "). Both links SHALL open in a new tab with `rel` containing `noopener`; the page itself SHALL make no
request to another origin. Delete SHALL ask "Delete “<name>”?" and on confirm delete the spot and open `/eating-out`.
The page SHALL show no rank. An unknown id SHALL answer 404.

#### Scenario: Maps link is built from name, address and city
- **WHEN** `mapsUrl` gets name "Café Müller", address "Hauptstraße 5" and city "Berlin", and then the same without city, and then without address
- **THEN** it returns `https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20M%C3%BCller%2C%20Hauptstra%C3%9Fe%205%2C%20Berlin`, the same without `%2C%20Berlin`, and nothing
- **proof:** unit

#### Scenario: Spot page shows hero, panel, rows and actions
- **WHEN** a Visited spot with photo, score 8.75, price 3, tags Brunch and Coffee, neighbourhood, city, address, website and notes is opened
- **THEN** the hero photo, the panel with name, "8.75", "€€€", both tags and "Neighbourhood, City", the Address row with "Open in Maps", the Website row, the notes and the "More spot actions" menu offering Edit and Delete are shown, and no "Mark visited" and no rank
- **proof:** e2e

#### Scenario: Spot page without photo shows the placeholder hero
- **WHEN** a spot without photo is opened
- **THEN** the hero area shows the ImagePlaceholder
- **proof:** e2e

#### Scenario: Missing address, website and notes hide their rows
- **WHEN** a Want to go spot with only a name and a city is opened
- **THEN** there is no Address row, no "Open in Maps", no Website row and no notes block, and "Mark visited" is shown
- **proof:** e2e

#### Scenario: External links open in a new tab
- **WHEN** a spot with address and website is opened
- **THEN** "Open in Maps" has the `mapsUrl` href, the website link has the stored URL, and both have `target="_blank"` and a `rel` containing `noopener`
- **proof:** e2e

#### Scenario: Spot page makes no external requests
- **WHEN** a spot with photo, address and website is opened and the page has settled
- **THEN** every request the page made went to the app's own origin
- **proof:** e2e

#### Scenario: Unknown spot answers 404
- **WHEN** `/eating-out/999999` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: Delete a spot from its page
- **WHEN** Delete is chosen in the "More spot actions" menu of a spot and confirmed
- **THEN** the dialog said "Delete “<name>”?", the browser is at `/eating-out` and the spot is not listed
- **proof:** e2e

## REMOVED Requirements

### Requirement: Eating Out looks like the approved mockup
**Reason**: It names `/__mockups/eating-out`, which the cleanup unit deletes, and the old design system (tokens, Card, Chip, GlassPanel, Sheet). The Eating Out pages get no own hi-fi (S15); "Eating Out on the shared shell" takes its place with the fingerprint roles and design.md → "Family moves per surface", and Rue judges them at gate 7 with the other screens.
**Migration**: Its manual scenario "Eating Out matches the approved mockup" had no automated test; the Gate 2 evidence shots that served it retire with it: "Eating Out list screenshot" (`e2e/spots-list.test.ts`), "Spot page screenshot" (`e2e/spots-page.test.ts`) and "Spot form screenshot" (`e2e/spots-form.test.ts`) are deleted by the Eating Out unit (21.2), "Home Top spots screenshot" (`e2e/home-spots.test.ts`) by the Home unit (22.2). The mockup's own test `e2e/mockup-eating-out.test.ts` goes with "Mockups before feature UI" (cleanup unit, 23.2).
