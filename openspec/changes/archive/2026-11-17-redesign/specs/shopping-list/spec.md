## ADDED Requirements

### Requirement: List states and one-handed use
`/list` SHALL show the add field, "Add from plan", To buy grouped by the nine aisles, the "Checked N" group, the item editor, the category menu and "Clear checked" with the behaviour of the existing list requirements (deletes immediate, gate-1 #3), styled with fingerprint roles only. Every state SHALL stay readable without horizontal page scroll down to 320 px: empty list, only checked items, 80+ items, long names and amounts. On the phone each item's checkbox, name (edit) and category control SHALL be at least 44×44 px so the list can be ticked off one-handed.

#### Scenario: Empty list shows Nothing to buy
- **WHEN** `/list` is opened with no items at 390×844
- **THEN** "Nothing to buy" and its hint are shown, the Checked group says "Tick things off as you shop; they gather here." and "Clear checked" is disabled
- **proof:** e2e

#### Scenario: Only checked items
- **WHEN** a list whose three items are all checked is opened at 390×844
- **THEN** "Nothing to buy" is shown, the Checked group is named "Checked 3" and "Clear checked" is enabled
- **proof:** e2e

#### Scenario: Eighty items in nine aisles stay usable
- **WHEN** 80 items spread over all nine categories are seeded and `/list` is opened at 320×640 and 1280×800
- **THEN** the nine groups appear in aisle order with their counts, the last item can be scrolled into view above the phone bar and checked, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Long names and amounts wrap
- **WHEN** an item with a 120-character name and the amount "1 cup + 200 g + 3 tbsp + 2 pinches" is shown at 320×640
- **THEN** the full name and amount are visible within the item's row width and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Item targets are thumb-sized on the phone
- **WHEN** a list with items is opened at 390×844
- **THEN** every item's checkbox target, edit control and "Move <name> to another category" control is at least 44×44 px
- **proof:** e2e

#### Scenario: Ticking off one-handed feels right in the shop
- **WHEN** Rue ticks off a real list on the phone with one hand
- **THEN** each tick lands on the intended item and the moved item is easy to follow
- **proof:** manual (real hardware and feel, Rue at gate 7)

### Requirement: Context add on List
The "Add an item" field SHALL sit in the page flow under the page title, with no second bar docked to the viewport (gate 4, placement A). The phone bar's "+" on `/list` SHALL focus that field without opening a dialog and without changing the URL. `/list?add=1` (the Home choice sheet's "List item") SHALL focus the field on arrival and remove the flag from the URL (history replaced).

#### Scenario: Plus on List focuses the add field
- **WHEN** at 390×844 the "+" is tapped on `/list`
- **THEN** the "Add an item" field has focus, no dialog is open, the URL is unchanged, the field follows the page heading in reading order and is not fixed to the viewport, and the phone bar is hidden while the field has focus
- **proof:** e2e

#### Scenario: List item from the Home sheet focuses the add field
- **WHEN** at 390×844 the "+" is tapped on `/`, "List item" chosen, "2 l oat milk" typed and Enter pressed
- **THEN** `/list` is shown without an `add` parameter, the field had focus on arrival, and "oat milk" with "2 l" is in the list
- **proof:** e2e
