# meal-plan Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Week view
`/plan?week=<monday>` SHALL show one week Monday–Sunday (default: the week containing today) with the slots Breakfast,
Lunch, Dinner and Snacks per day, any number of entries per slot in position order, today highlighted
(`data-today`), and the controls previous week, next week and "This week". Each empty slot SHALL show an add
affordance. On phone the days SHALL be stacked vertically; at 1280 the week SHALL be a grid with the days as rows and
the four slots as columns (gate 4, "Desktop week states"), the first day starting inside the viewport and every day
left of the recipe rail. (Verify round 1: the old "seven days start at the same top edge" described the earlier
columns layout, which gate 4 replaced with rows.)

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
- **THEN** on phone each day starts below the previous one; on desktop each day starts below the previous one as a row whose four slots sit side by side at one top edge, the first day starts inside the viewport, and every day fits the viewport width left of the recipe rail
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

### Requirement: Desktop week states
From the posture switch (1024 px) `/plan` SHALL show the shown week as 7 days × 4 slots, the days as rows and the slots as columns (gate 4), with the recipe picker aside as the drag source (hidden on touch devices, where the add controls and menus do the job), the slot Add dialog, the entry options (Change servings or Edit text, Move to…, Delete), Copy week, Previous week / Next week / This week and `?week=`, with the behaviour of the existing plan requirements, styled with fingerprint roles only. Every state SHALL stay readable without horizontal page scroll: an empty week, a slot with five or more entries, long free text and entries whose recipe was deleted (shown as text). Every drag SHALL keep its Move to… alternative.

#### Scenario: Empty week offers an add control in every slot
- **WHEN** an empty week is opened at 1280×800
- **THEN** 28 slots are shown, each with an add control named "Add to <Weekday> <Slot>", and the recipe picker named "Recipes" is visible
- **proof:** e2e

#### Scenario: Slot with five entries stays readable
- **WHEN** Wednesday Dinner holds five recipe entries with 120-character titles and one free text of 200 characters, at 1280×800 and at 1024×768
- **THEN** all six entries and their "Options for <title>" controls are visible inside the Wednesday column, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Entry of a deleted recipe reads as text
- **WHEN** a planned recipe is deleted and `/plan` is opened at 1280×800
- **THEN** its entry shows the recipe's title as free text with "Edit text" in its options
- **proof:** e2e

#### Scenario: Picker shows the plate and No times for a bare recipe
- **WHEN** at 1280×800 the archive holds "Weeknight dal" with no photo and no times and "Village salad" with 10 minutes
- **THEN** the picker shows "Weeknight dal" with the plate of its first letter "W" (the Recipes list's monogram, signed hi-fi) and "No times", and "Village salad" with "10 min" (verify round 3)
- **proof:** e2e

#### Scenario: Every drag has a Move to alternative on the desktop
- **WHEN** at 1280×800 an entry's options are opened by keyboard and "Move to…" moves it to Friday Lunch
- **THEN** the entry is in Friday Lunch after a reload, without any pointer drag
- **proof:** e2e

### Requirement: Plan on the phone
Below the posture switch (phones and tablets, 768–1023 px included, gate 4) `/plan` SHALL stack the seven days vertically in one column, each day with its four slots, today marked with `aria-current="date"` and scrolled to the top of the view on load when the shown week contains today (otherwise the view starts at Monday). An empty day SHALL render compact (shorter than a day with one entry) while still offering its four add controls. A day whose last entry is deleted or moved away SHALL keep its layout until that entry has faded out, and only then turn compact, its add controls settling into their places; under reduced motion it turns compact at once (verify round 3). Every action SHALL be reachable through menus and dialogs; no action SHALL need a drag.

#### Scenario: Days are stacked on the phone
- **WHEN** `/plan` is opened at 390×844
- **THEN** the seven days appear top to bottom in Monday-to-Sunday order, each day's left edge at the same x, and no day sits beside another
- **proof:** e2e

#### Scenario: Tablet width stacks the days in one column
- **WHEN** `/plan` is opened at 768×1024 and at 1023×768
- **THEN** the seven days appear top to bottom in one column with the same left edge, and no recipe picker is shown
- **proof:** e2e

#### Scenario: Picker is hidden on touch at desktop width
- **WHEN** `/plan` is opened at 1280×800 in a touch context (coarse pointer)
- **THEN** no recipe picker is shown and every slot still offers its "Add to <Weekday> <Slot>" control
- **proof:** e2e

#### Scenario: Today is marked and first in view
- **WHEN** the test clock is set to a Thursday and `/plan` is opened at 390×844
- **THEN** Thursday carries `aria-current="date"` and its heading is inside the viewport's top third without scrolling by the user
- **proof:** e2e

#### Scenario: Past week starts at Monday
- **WHEN** `/plan?week=<a date four weeks back>` is opened at 390×844
- **THEN** no day carries `aria-current="date"` and the page is scrolled to the top with Monday visible
- **proof:** e2e

#### Scenario: Empty days are compact
- **WHEN** a week with entries only on Tuesday is opened at 390×844
- **THEN** Monday's height is less than Tuesday's, and Monday still offers the four add controls "Add to Monday Breakfast" … "Add to Monday Snacks"
- **proof:** e2e

#### Scenario: A day turns compact once its last entry is gone
- **WHEN** at 375×812 the only entry of Sunday is deleted from its options menu, once with motion and once with reduced motion
- **THEN** in no frame do Sunday's add controls overlap each other; with motion Sunday keeps its full layout in every frame while the entry fades and is compact from the first frame without it, ending with its four add controls; with reduced motion the entry is gone and the day is compact right after the delete
- **proof:** e2e

#### Scenario: Phone plan works without drag
- **WHEN** at 390×844 a recipe entry is added through an add control, its servings changed, moved with "Move to…" to Saturday Dinner and deleted from its options menu
- **THEN** each step is reflected after a reload and no step used a drag
- **proof:** e2e

### Requirement: Context add on Plan
The phone bar's "+" on `/plan`, and `/plan?add=1` (the Home choice sheet's "Plan entry"), SHALL open the existing Add dialog for today's Dinner when the shown week contains today, otherwise for Monday Dinner of the shown week; the dialog stays bound to that one slot (no day or meal choice inside it). After opening from `?add=1` the flag SHALL be removed from the URL (history replaced) so a reload does not reopen the dialog.

#### Scenario: Plus on Plan opens the Add dialog for today
- **WHEN** the test clock is set to a Wednesday and the "+" is tapped on `/plan` at 390×844
- **THEN** the dialog named "Add to Wednesday Dinner" opens with the choice "Recipe" or "Free text"
- **proof:** e2e

#### Scenario: Plus on another week targets Monday Dinner
- **WHEN** `/plan?week=<next week's Monday>` is opened at 390×844 and the "+" is tapped
- **THEN** the dialog named "Add to Monday Dinner" opens and adding "Pizza night" puts it into next week's Monday Dinner
- **proof:** e2e

#### Scenario: Plan entry from the Home sheet opens the Add dialog
- **WHEN** at 390×844 the "+" is tapped on `/`, "Plan entry" chosen, and after the dialog appeared the page is reloaded
- **THEN** `/plan` is shown with the Add dialog for today's Dinner; after the reload the URL has no `add` parameter and no dialog is open
- **proof:** e2e

