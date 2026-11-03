## ADDED Requirements

### Requirement: Spot storage
Spots SHALL be stored in SQLite through the migration `migrations/0003_food_spots.sql` in their own tables (`spots`,
`spot_tags`, `spot_tag_links`, design.md → Contracts), with a spot-tag vocabulary of their own that starts empty; the
recipe `tags` table, recipe tags and the recipe tag manager (rename, merge, delete, counts) SHALL be unaffected. A spot
SHALL have a name (required, not blank), a status `want` or `visited`, a score only and always when Visited, an
optional price level 1–4, optional city, neighbourhood, address, website, notes and photo, 0..n spot tags and a
creation time; duplicate names SHALL be allowed. Deleting a spot SHALL delete its photo row and its tag links. A spot
tag used by no spot SHALL be deleted, so it no longer appears as a filter chip or a suggestion.

#### Scenario: Migration keeps existing recipe data
- **WHEN** a database with migrations 0001 and 0002 applied and a recipe with two tags, an image and a plan entry is opened by the app
- **THEN** `0003_food_spots.sql` is recorded as applied, the tables `spots`, `spot_tags` and `spot_tag_links` exist, and the recipe, its tags, its image row and the plan entry are unchanged
- **proof:** unit

#### Scenario: Spot tags stay apart from recipe tags
- **WHEN** a spot is saved with the tags "Brunch" and "soup" while the recipe tag Soup exists
- **THEN** the recipe tags are still exactly the eight starter tags with unchanged counts, the spot tags are "Brunch" and "soup", and neither list contains the other's names
- **proof:** unit

#### Scenario: Spot tag names are reused ignoring case
- **WHEN** spot tags `brunch` and `KÄSE` are ensured while the spot tags Brunch and Käse exist
- **THEN** the existing Brunch and Käse are returned and no spot tag is added
- **proof:** unit

#### Scenario: Duplicate spot names are allowed
- **WHEN** two spots named "Five Guys" are created, one in Berlin and one in Hamburg
- **THEN** both are stored with different ids
- **proof:** unit

#### Scenario: Deleting a spot removes its photo and tag links
- **WHEN** a spot with a photo and the tags Brunch and Coffee is deleted while another spot also carries Coffee
- **THEN** the spot, its image row and its tag links are gone, Coffee still exists and Brunch no longer exists
- **proof:** unit

#### Scenario: Unused spot tag drops out
- **WHEN** the only spot tagged "Brunch" is edited to carry no tags
- **THEN** "Brunch" is neither among the tag facets nor among the spot-tag suggestions
- **proof:** unit

#### Scenario: Invalid spot rows are refused by the database
- **WHEN** a spot row with status `visited` and no score, or with status `want` and a score, or with price 5 is inserted directly
- **THEN** SQLite rejects the insert with a CHECK constraint error
- **proof:** unit

### Requirement: Score input and display
A score SHALL be entered as a decimal number from 1.00 to 10.00 with at most two decimals, accepting a dot or a comma
as decimal separator, SHALL be stored exactly as integer hundredths (8.75 → 875) and SHALL always be displayed with
two decimals and a dot ("9.00", "8.75"). Out-of-range, over-precise, non-numeric or (for a Visited spot) empty input
SHALL be rejected with an inline message while the form keeps its other values. The score field SHALL bring up the
decimal keyboard on phones (`inputmode="decimal"`).

#### Scenario: Valid scores parse to hundredths
- **WHEN** `parseScore` reads "8.75", "8,75", "10", "1", " 9.5 " and "10.00"
- **THEN** it returns 875, 875, 1000, 100, 950 and 1000
- **proof:** unit

#### Scenario: Invalid scores are rejected
- **WHEN** `parseScore` reads "0.99", "10.01", "8.755", "abc", "8.", ",5" and ""
- **THEN** each is rejected, "" as empty and the others as invalid
- **proof:** unit

#### Scenario: Scores display with two decimals and a dot
- **WHEN** `formatScore` formats 900, 875, 1000 and 810
- **THEN** it returns "9.00", "8.75", "10.00" and "8.10"
- **proof:** unit

#### Scenario: Score is stored without drift
- **WHEN** a Visited spot is saved from a form with score "8,75" and read back
- **THEN** its stored score column holds the integer 875 and the spot formats as "8.75"
- **proof:** unit

#### Scenario: Score field uses the decimal keyboard
- **WHEN** Visited is chosen in the add form
- **THEN** the score field is shown with `inputmode="decimal"`
- **proof:** e2e

#### Scenario: Invalid score keeps the other values
- **WHEN** the add form is saved with name "Café Müller", city "Berlin", status Visited and score "10.01"
- **THEN** "Enter a score from 1.00 to 10.00, at most two decimals" is shown at the score field, name and city are still filled, and no spot is stored
- **proof:** e2e

### Requirement: Add spot form
`/eating-out/new` SHALL show a form with name (required), a status segment "Want to go | Visited" (default Want to go),
a score field shown only while Visited is chosen, spot tags (TagInput suggesting spot tags only), city, neighbourhood,
address, website, price level (€ … €€€€, clearable), notes and photo (the recipe ImageField: upload, URL, remove), and
Save SHALL store the spot and open `/eating-out/<id>`. The server SHALL reject a blank name ("Name is required"), a
Visited spot without score ("Visited spots need a score") and a website that is not an http(s) URL ("Enter a valid web
address (http or https)") and store nothing. Photo errors SHALL be the recipe ones: "That file isn't an image",
"Images can be at most 15 MB" (checked in the browser before upload), and a photo URL that cannot be downloaded SHALL
save the spot without photo and show "Saved without image: the image couldn't be downloaded.". Leaving the form with
unsaved changes SHALL ask "Discard changes?" with "Keep editing" and "Discard".

#### Scenario: Spot created with all fields
- **WHEN** name, status Visited with score "9", tags Brunch and Coffee, city, neighbourhood, address, an https website, price €€, notes and an uploaded JPEG are entered and saved
- **THEN** the browser is at `/eating-out/<id>`, and that spot's edit page shows every value as entered, the score as "9.00" and the stored photo
- **proof:** e2e

#### Scenario: New spot defaults to Want to go
- **WHEN** `/eating-out/new` is opened
- **THEN** "Want to go" is the selected status and no score field is visible
- **proof:** e2e

#### Scenario: Score field appears only for Visited
- **WHEN** Visited is chosen and then Want to go again
- **THEN** the score field is visible after the first choice and hidden after the second
- **proof:** e2e

#### Scenario: Server rejects invalid spot input
- **WHEN** a spot is saved from a form with a blank name, with status Visited and no score, or with the website "example.com" or "ftp://example.com"
- **THEN** the result carries the field message for `name`, `score` or `website` and no spot is stored
- **proof:** unit

#### Scenario: Empty name blocks saving a spot
- **WHEN** the add form is saved with an empty name
- **THEN** "Name is required" is shown at the name field, the page stays on the form and no spot exists
- **proof:** e2e

#### Scenario: Visited without score is rejected in the form
- **WHEN** the add form is saved with a name, status Visited and an empty score
- **THEN** "Visited spots need a score" is shown at the score field and no spot exists
- **proof:** e2e

#### Scenario: Website must be http or https
- **WHEN** the add form is saved with a name and the website "example.com"
- **THEN** "Enter a valid web address (http or https)" is shown at the website field and no spot exists
- **proof:** e2e

#### Scenario: Price level can be cleared
- **WHEN** €€ is chosen, then the price is cleared, and the spot is saved
- **THEN** the spot's edit page shows no price level selected
- **proof:** e2e

#### Scenario: Spot tag field suggests spot tags only
- **WHEN** the spot tag Brunch exists, the recipe tags are the starter tags, and "s" and then "b" are typed into the spot tag field
- **THEN** no suggestion for "s" is a recipe tag (no Soup, Salad, Side, Snack) and "b" suggests Brunch but not Breakfast or Baking
- **proof:** e2e

#### Scenario: Spot photo errors match the recipe form
- **WHEN** a `.txt` file is chosen as photo and saved, then a 16 MB file is chosen, then a photo URL that answers 404 is saved
- **THEN** "That file isn't an image" is shown and nothing is saved; "Images can be at most 15 MB" is shown before any upload; the spot is saved without photo and "Saved without image: the image couldn't be downloaded." is shown
- **proof:** e2e

#### Scenario: Leaving the spot form with unsaved changes asks first
- **WHEN** a name is typed into the add form and the Plan nav item is clicked
- **THEN** "Discard changes?" appears; "Keep editing" stays on the form with the name kept, "Discard" opens Plan
- **proof:** e2e

#### Scenario: Leaving the untouched spot form does not ask
- **WHEN** the empty add form is opened and the Plan nav item is clicked
- **THEN** Plan opens without a dialog
- **proof:** e2e

### Requirement: Edit spot
`/eating-out/<id>/edit` SHALL show the add form prefilled with the spot, and Save SHALL update it and open its page.
Switching a Visited spot to Want to go SHALL clear its score on save; switching a Want to go spot to Visited SHALL
require a score. "Remove image" SHALL delete the old image row. The edit page and its save SHALL answer 404 for an
unknown or deleted spot.

#### Scenario: Spot edit changes are saved
- **WHEN** name, city and price of a spot are changed on its edit page and saved
- **THEN** reopening the edit page shows the new values
- **proof:** e2e

#### Scenario: Switching to Want to go clears the score
- **WHEN** a Visited spot with score 8.75 is switched to Want to go on its edit page and saved
- **THEN** reopening its edit page shows Want to go selected, and choosing Visited there shows an empty score field
- **proof:** e2e

#### Scenario: Switching to Visited requires a score
- **WHEN** a Want to go spot is switched to Visited on its edit page and saved with an empty score
- **THEN** "Visited spots need a score" is shown and the spot is still Want to go
- **proof:** e2e

#### Scenario: Removing the spot photo deletes the image
- **WHEN** a spot with a photo is updated with "Remove image"
- **THEN** the spot has no photo and its old image row no longer exists
- **proof:** unit

#### Scenario: Editing a deleted spot answers 404
- **WHEN** a spot is deleted and its `/eating-out/<id>/edit` is opened
- **THEN** the response status is 404
- **proof:** e2e

### Requirement: Eating Out list
`/eating-out` SHALL show a "Visited | Want to go" segment with the number of matching spots on each side and the
spots of the chosen side as cards in a grid like the recipe archive (four columns on desktop, two on phone). Without a
`status` in the URL the segment SHALL be Visited, unless no spot is Visited and at least one is Want to go, then Want
to go. With no spots at all the page SHALL show an empty state (serif heading "Start your list", a short text, an "Add
spot" button to `/eating-out/new` and the ImagePlaceholder) and no segment, filters or grid. With spots but none on the
chosen side it SHALL show a short line ("No visited spots yet." / "Nothing on your want-to-go list yet.") with "Add
spot". Segment, search, filters and sort SHALL live in the URL (`?status=&q=&tags=&city=&price=&sort=`) so reload and
back/forward restore them. Below 1024 px the page header SHALL carry an "Add spot" button.

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
- **THEN** the heading "Start your list", the placeholder and an "Add spot" link to `/eating-out/new` are shown, and no segment, filter row or grid
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

### Requirement: Spot cards
A spot card SHALL show the photo at 5/4 (the ImagePlaceholder without one), the name (clamped to two lines), at most
two spot tags as small chips, "Neighbourhood, City" with whichever parts exist (no text and no stray comma when neither
exists), the price level as € signs when set, and on Visited cards a score badge ("8.75"); Want to go cards SHALL have
no badge. Each card SHALL link to `/eating-out/<id>`. Cards SHALL fit the grid at every width down to 320 px without
horizontal overflow.

#### Scenario: Location text joins what exists
- **WHEN** `locationText` gets (Mitte, Berlin), (Mitte, none), (none, Berlin) and (none, none)
- **THEN** it returns "Mitte, Berlin", "Mitte", "Berlin" and nothing
- **proof:** unit

#### Scenario: Visited card shows photo, name, tags, location, price and score
- **WHEN** a Visited spot with photo, tags Brunch, Coffee and Vegan, neighbourhood Mitte, city Berlin, price 2 and score 8.75 is listed
- **THEN** its card shows the photo, the name, exactly two tag chips, "Mitte, Berlin", "€€" and the badge "8.75", and links to `/eating-out/<id>`
- **proof:** e2e

#### Scenario: Sparse card shows no empty parts
- **WHEN** a Want to go spot without photo, city, neighbourhood, price and tags is listed
- **THEN** its card shows the ImagePlaceholder and the name, and no location text, comma, price, chip or badge
- **proof:** e2e

#### Scenario: Long spot names are clamped
- **WHEN** a spot has a 120-character name
- **THEN** its card title is at most two lines high and the grid has no horizontal overflow
- **proof:** e2e

#### Scenario: Spot grid fits narrow phones
- **WHEN** `/eating-out` with four Visited spots (long names, two tags, location, price, score, ranks) is opened at 390×844 and at 320×640
- **THEN** at both widths the document's and the grid's `scrollWidth` are at most their `clientWidth`, every card's badge and rank lie inside the card, and every visible button and link outside the cards is at least 44×44 px
- **proof:** e2e

### Requirement: Spot search and filters
A search field SHALL search spot name, neighbourhood, city, tag names and notes, ignoring case including non-ASCII
letters exactly like the recipe search (`müller` finds "Café Müller"; letters are not stripped of accents). Spot-tag
chips (several select spots having all of them), a city filter (single choice among the cities in use, compared
ignoring case) and a price filter (single choice €, €€, €€€ or €€€€) SHALL combine with the search by AND and apply
within the chosen segment; both segment counts SHALL reflect the search and filters. Tag chips and cities SHALL list
only values in use. A tag id, city or price in the URL that does not exist SHALL be ignored, not an error. With no
match the page SHALL show "No spots match" and "Clear filters", which clears search and filters and keeps segment and
sort. The desktop header's "Search spots" SHALL open `/eating-out` with the search field focused.

#### Scenario: Spot search covers name, neighbourhood, city, tags and notes
- **WHEN** spots match "ramen" once in the name, once in the neighbourhood, once in the city, once in a tag name and once in the notes only
- **THEN** a search for "ramen" returns all five
- **proof:** unit

#### Scenario: Spot search ignores case for umlauts
- **WHEN** a spot "Café Müller" exists and `müller`, `MÜLLER`, `CAFÉ` and `muller` are searched
- **THEN** the first three return it and `muller` does not
- **proof:** unit

#### Scenario: Spot filters combine within the segment
- **WHEN** spots are listed for Visited with city `berlin`, tag Brunch and price 2
- **THEN** only Visited spots in Berlin tagged Brunch at price 2 are returned
- **proof:** unit

#### Scenario: Segment counts follow the filters
- **WHEN** counts are taken with city Berlin while Berlin has two Visited and one Want to go spot and Hamburg one of each
- **THEN** they are visited 2 and want 1
- **proof:** unit

#### Scenario: Filters offer only values in use
- **WHEN** spots exist in "Berlin", "berlin" and "Hamburg", one of them tagged Brunch, and a spot tag Coffee is used by no spot
- **THEN** the city facets are Berlin and Hamburg once each and the tag facets are only Brunch
- **proof:** unit

#### Scenario: Stale filter values are ignored
- **WHEN** `/eating-out?status=visited&tags=999999&city=Atlantis&price=9` is opened with two Visited spots
- **THEN** the page answers 200 and both Visited spots are shown with no filter active
- **proof:** e2e

#### Scenario: Filtering by city updates cards and counts
- **WHEN** the city Berlin is chosen while Berlin has two Visited and one Want to go spot and Hamburg one Visited
- **THEN** two cards are shown, the segment reads "Visited 2" and "Want to go 1", and the URL carries `city=`
- **proof:** e2e

#### Scenario: Search from Eating Out
- **WHEN** `müller` is typed into the spot search field
- **THEN** the grid shows only "Café Müller" and the URL carries `q=müller`
- **proof:** e2e

#### Scenario: No spot match offers to clear filters
- **WHEN** the search and filters match no spot and "Clear filters" is pressed
- **THEN** "No spots match" was shown, and afterwards every spot of the segment is shown and the URL keeps only segment and sort
- **proof:** e2e

#### Scenario: Search spots focuses the spot search
- **WHEN** `/eating-out#search` is opened, and at 1280×800 "Search spots" in the header is clicked while `/eating-out` is open with focus on the page body
- **THEN** the spot search field has focus both times
- **proof:** e2e

### Requirement: Spot sort
The list SHALL sort by score (highest first; the Visited default), newest (creation time, newest first; the Want to go
default) or name (A–Z, ignoring case and accents like the recipe title sort). Equal scores SHALL be ordered by name.
Score sort SHALL NOT be offered on Want to go. Switching the segment SHALL use the target segment's default sort,
unless the URL names a sort valid for the target segment.

#### Scenario: Score sort orders ties by name
- **WHEN** Visited spots "Alpha" 8.10, "Zeta" 8.75 and "beta" 8.75 are listed by score
- **THEN** the order is "beta", "Zeta", "Alpha"
- **proof:** unit

#### Scenario: Name and newest sorts
- **WHEN** spots "bistro", "Alma" and "Café" created in that order are listed by name and by newest
- **THEN** by name the order is "Alma", "bistro", "Café", and by newest "Café", "Alma", "bistro"
- **proof:** unit

#### Scenario: Sort defaults per segment
- **WHEN** the query is parsed from `status=visited`, `status=want`, `status=want&sort=score` and `status=want&sort=name`
- **THEN** the sorts are score, newest, newest and name
- **proof:** unit

#### Scenario: Segment switch resets an invalid sort
- **WHEN** the segment is switched from Visited sorted by score, and from Visited sorted by name, to Want to go
- **THEN** the first gives newest and the second keeps name
- **proof:** unit

#### Scenario: Want to go offers no score sort
- **WHEN** Want to go is chosen and the sort control is opened
- **THEN** it offers Newest first and Name A–Z only
- **proof:** e2e

### Requirement: Spot ranks
Visited cards SHALL show a rank ("#1", "#2" …) only while the list is sorted by score, counted within the currently
filtered list with standard competition ranking (equal scores share a rank, the next rank skips: 8.75, 8.75, 8.10 →
#1, #1, #3). Want to go cards, other sorts and the spot page SHALL show no rank.

#### Scenario: Equal scores share a rank
- **WHEN** ranks are computed for the scores 875, 875, 810, 700 and 700
- **THEN** they are 1, 1, 3, 4 and 4
- **proof:** unit

#### Scenario: Ranks show while sorted by score
- **WHEN** `/eating-out` is opened with Visited spots A 8.75, B 8.75 and C 8.10
- **THEN** the cards read "#1" A, "#1" B and "#3" C in that order
- **proof:** e2e

#### Scenario: Ranks recount within the filters
- **WHEN** the city Hamburg is chosen while the best Visited spot is in Berlin
- **THEN** the first shown card reads "#1"
- **proof:** e2e

#### Scenario: Other sorts show no rank
- **WHEN** Name A–Z is chosen on Visited, and then Want to go is opened
- **THEN** no card shows a rank in either view
- **proof:** e2e

### Requirement: Spot page
`/eating-out/<id>` SHALL show a full-bleed hero photo (the placeholder hero without one) with a glass info panel
holding name, score badge (Visited only), price level, spot tags and "Neighbourhood, City"; below it an Address row with
"Open in Maps" (only with an address), a Website row (only with a website), and the notes (only with notes, rendered
like recipe notes); and the actions Edit, Delete and, on Want to go spots, "Mark visited". "Open in Maps" SHALL link to
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
- **THEN** the hero photo, the panel with name, "8.75", "€€€", both tags and "Neighbourhood, City", the Address row with "Open in Maps", the Website row, the notes, Edit and Delete are shown, and no "Mark visited" and no rank
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
- **WHEN** Delete is chosen on a spot and confirmed
- **THEN** the dialog said "Delete “<name>”?", the browser is at `/eating-out` and the spot is not listed
- **proof:** e2e

### Requirement: Spot photo transition
Opening a spot from its card SHALL use a shared-element view transition of the photo, like recipes: the card's photo
area and the spot page's hero SHALL carry the same `view-transition-name: spot-hero-<id>`, also when the spot has no
photo (the placeholder morphs the same way), and the transition SHALL run on the way back as well. Under reduced
motion there SHALL be no shared element and no view transition (instant navigation).

#### Scenario: Card and spot page share the photo
- **WHEN** a Visited spot's card with a photo is clicked in the Eating Out list
- **THEN** `document.startViewTransition` is called, the card's photo area carried `view-transition-name: spot-hero-<id>` and the hero on the spot page carries the same name
- **proof:** e2e

#### Scenario: Spot without photo morphs its placeholder
- **WHEN** the card of a spot without photo is clicked
- **THEN** `document.startViewTransition` is called and the card's placeholder area and the spot page's placeholder hero both carry `view-transition-name: spot-hero-<id>`
- **proof:** e2e

#### Scenario: Reduced motion skips the spot shared element
- **WHEN** reduced motion is emulated and a spot card is clicked
- **THEN** `document.startViewTransition` is not called, neither the card nor the hero has a `view-transition-name`, and the spot page is shown
- **proof:** e2e

#### Scenario: Spot photo carries over smoothly
- **WHEN** Rue opens a spot from the list and goes back in the running app
- **THEN** the photo (or placeholder) carries over between card and hero without a flash
- **proof:** manual (visual judgement by Rue at Gate 2)

### Requirement: Mark visited
"Mark visited" on a Want to go spot SHALL open a sheet with the score field (validation and messages as in Score input
and display); Save SHALL set the spot to Visited with that score, and Cancel SHALL change nothing. An invalid score SHALL
show the inline error in the sheet and keep it open.

#### Scenario: Mark visited stores status and score
- **WHEN** a Want to go spot is marked visited with 875 on the server, and another with an out-of-range score
- **THEN** the first is Visited with 875, and the second is refused and still Want to go without score
- **proof:** unit

#### Scenario: Mark visited from the spot page
- **WHEN** "Mark visited" is pressed on a Want to go spot, "8,75" entered and saved
- **THEN** the sheet closes, the page shows the badge "8.75" and no "Mark visited", and the spot is listed under Visited
- **proof:** e2e

#### Scenario: Invalid score keeps the sheet open
- **WHEN** "abc" is entered in the Mark visited sheet and saved
- **THEN** "Enter a score from 1.00 to 10.00, at most two decimals" is shown in the sheet, the sheet stays open and the spot is still Want to go
- **proof:** e2e

#### Scenario: Cancel leaves the spot unchanged
- **WHEN** "9" is entered in the Mark visited sheet and Cancel is pressed
- **THEN** the sheet closes, "Mark visited" is still shown and after a reload the spot is still Want to go
- **proof:** e2e

#### Scenario: Mark visited is refused for a spot that is already visited
- **WHEN** a `visit` POST with score "5" is sent to `/eating-out/<id>?/visit` for a Visited spot with score 8.75
- **THEN** the response status is 404 and the spot is still Visited with 8.75
- **proof:** e2e

### Requirement: Eating Out looks like the approved mockup
The real Eating Out list, form, spot page, Mark visited sheet and Home "Top spots" row SHALL follow the approved
`/__mockups/eating-out` and the design system (tokens, Card, Chip, GlassPanel, Sheet, motion as in the archive).

#### Scenario: Eating Out matches the approved mockup
- **WHEN** Rue compares the Gate 2 screenshots of list, form, spot page and sheet on phone and desktop with the approved mockup
- **THEN** they match it, including Rue's corrections from the mockup stop
- **proof:** manual (visual judgement by Rue at Gate 2)
