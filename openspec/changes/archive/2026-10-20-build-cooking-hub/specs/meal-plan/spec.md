## ADDED Requirements

### Requirement: Week view
`/plan?week=<monday>` SHALL show one week Monday–Sunday (default: the week containing today) with the slots Breakfast,
Lunch, Dinner and Snacks per day, any number of entries per slot in position order, today highlighted
(`data-today`), and the controls previous week, next week and "This week". Each empty slot SHALL show an add
affordance. On phone the days SHALL be stacked vertically; at 1280 the full 7-day grid SHALL be visible next to the
recipe rail.

#### Scenario: Week query returns entries in day, slot and position order
- **WHEN** entries are added on Tuesday Dinner (two), Monday Snacks and Monday Breakfast and the week is read
- **THEN** they come Monday Breakfast, Monday Snacks, Tuesday Dinner 1, Tuesday Dinner 2, each with recipe title or text and servings
- **proof:** unit

#### Scenario: Week shows Monday to Sunday with four slots
- **WHEN** `/plan` is opened with today set to Wednesday 2026-10-21
- **THEN** the days Mon 19 Oct to Sun 25 Oct are shown, each with Breakfast, Lunch, Dinner and Snacks
- **proof:** e2e

#### Scenario: Today is highlighted
- **WHEN** `/plan` is opened with today set to Wednesday 2026-10-21
- **THEN** only Wednesday carries `data-today`
- **proof:** e2e

#### Scenario: Previous, next and This week
- **WHEN** next week is pressed, then previous twice, then "This week"
- **THEN** the URL's `week` is 2026-10-26, 2026-10-19, 2026-10-12 and finally 2026-10-19 again, with the matching days shown
- **proof:** e2e

#### Scenario: Empty week shows add affordances
- **WHEN** a week without entries is opened
- **THEN** every one of the 28 slots shows an add control
- **proof:** e2e

#### Scenario: Phone stacks the days and desktop shows the grid
- **WHEN** `/plan` is opened on phone and on desktop
- **THEN** on phone each day starts below the previous one; on desktop all seven days start at the same top edge within the viewport width, next to the recipe rail
- **proof:** e2e

### Requirement: Plan entries
An entry SHALL be either a recipe with servings (at least 1; default the recipe's servings) or a non-empty free text,
added from a slot's add control (recipe picker with search, or free text) and appended at the end of the slot. An entry's
servings or text SHALL be editable and an entry deletable. Empty free text SHALL be rejected with "Enter a recipe or some
text" and servings below 1 with "Servings must be at least 1".

#### Scenario: Empty free text is rejected
- **WHEN** a free-text entry with text "  " is added
- **THEN** adding fails with the message for `text` and nothing is stored
- **proof:** unit

#### Scenario: Servings below 1 are rejected in the plan
- **WHEN** a recipe entry with servings 0 is added, or an entry is updated to servings 0
- **THEN** the call fails with "Servings must be at least 1" and nothing changes
- **proof:** unit

#### Scenario: Entry servings and text can be edited
- **WHEN** a recipe entry's servings are set to 6 and a free-text entry's text to "Leftover soup"
- **THEN** the week shows 6 servings and "Leftover soup"
- **proof:** unit

#### Scenario: Add a recipe entry with the picker
- **WHEN** Tuesday Dinner's add control is used, "lasagne" is searched in the picker, the 2-serving Lasagne picked and servings set to 4
- **THEN** Tuesday Dinner shows Lasagne with 4 servings, and the picker had preselected 2 servings
- **proof:** e2e

#### Scenario: Add a free-text entry
- **WHEN** "Pizza night" is added as free text to Friday Dinner
- **THEN** Friday Dinner shows "Pizza night"
- **proof:** e2e

#### Scenario: Empty free text shows an error
- **WHEN** an empty free text is added
- **THEN** "Enter a recipe or some text" is shown and the slot stays empty
- **proof:** e2e

#### Scenario: Edit and delete an entry
- **WHEN** an entry's servings are changed to 3 from its menu and another entry is deleted
- **THEN** the first shows 3 servings after a reload and the second is gone
- **proof:** e2e

### Requirement: Moving entries
On desktop a recipe SHALL be draggable from the recipe rail onto a slot (new entry, recipe servings), and entries
SHALL be draggable between slots and days and to another position within a slot; the slot under the pointer SHALL be
highlighted (`data-drop-target`). A drop outside any slot SHALL return the entry to its origin and save nothing. Every
entry SHALL have a "Move to…" menu (day of the shown week + slot, appended at the end) on phone and desktop, reachable
by keyboard.

#### Scenario: Moving an entry reorders the slot
- **WHEN** the third entry of a slot is moved to position 0 of the same slot
- **THEN** the slot's order is third, first, second with positions 0, 1, 2
- **proof:** unit

#### Scenario: Drag a recipe from the rail onto a slot
- **WHEN** on desktop the recipe "Lasagne" is dragged from the rail onto Thursday Lunch
- **THEN** Thursday Lunch shows Lasagne with the recipe's servings, also after a reload
- **proof:** e2e

#### Scenario: Drag an entry to another day
- **WHEN** on desktop an entry is dragged from Monday Dinner to Saturday Lunch
- **THEN** it shows in Saturday Lunch and no longer in Monday Dinner, also after a reload
- **proof:** e2e

#### Scenario: Reorder entries within a slot
- **WHEN** on desktop the second of two entries in a slot is dropped onto the first
- **THEN** their order is swapped, also after a reload
- **proof:** e2e

#### Scenario: Drop target is highlighted
- **WHEN** on desktop an entry is dragged over Sunday Breakfast
- **THEN** Sunday Breakfast carries `data-drop-target` and no other slot does
- **proof:** e2e

#### Scenario: Drop outside a slot changes nothing
- **WHEN** on desktop an entry is dragged and dropped on the page header
- **THEN** the entry is still in its original slot and position after a reload
- **proof:** e2e

#### Scenario: Move to moves an entry on phone
- **WHEN** on phone "Move to…" is chosen on a Monday Dinner entry and Thursday + Breakfast are picked
- **THEN** the entry shows at the end of Thursday Breakfast, also after a reload
- **proof:** e2e

#### Scenario: Move to is the keyboard alternative on desktop
- **WHEN** on desktop an entry's menu is opened with the keyboard only and "Move to…" Friday + Snacks is chosen
- **THEN** the entry shows in Friday Snacks
- **proof:** e2e

### Requirement: Copy week
"Copy week" SHALL copy every entry of a source week (default: the week before the shown one) into the shown week, same
weekday and slot, appended after existing entries. A source week without entries SHALL report "Nothing to copy" and
change nothing; if the shown week has entries, a confirm SHALL come first.

#### Scenario: Copy week appends after existing entries
- **WHEN** a week with three entries is copied into a week that has one entry in the same slot as one of them
- **THEN** the target has four entries, the copied one after the existing one in that slot
- **proof:** unit

#### Scenario: Copy from an empty week changes nothing
- **WHEN** an empty week is copied
- **THEN** the result is 0 copied and the target is unchanged
- **proof:** unit

#### Scenario: Copy the previous week
- **WHEN** "Copy week" is used on an empty week whose previous week has two entries
- **THEN** both entries appear on the same weekdays and slots of the shown week
- **proof:** e2e

#### Scenario: Copy into a week with entries asks first
- **WHEN** "Copy week" is used on a week that has entries
- **THEN** a confirm appears; after confirming, the copied entries are appended after the existing ones
- **proof:** e2e

#### Scenario: Nothing to copy
- **WHEN** "Copy week" is used while the previous week is empty
- **THEN** "Nothing to copy" is shown and the week is unchanged
- **proof:** e2e
