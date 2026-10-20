# shopping-list Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Manual items
`/list` SHALL be the one shopping list. A typed line SHALL be parsed like an ingredient line (`2 l milk` → name `milk`,
amount 2 l) and added as a manual item; empty input SHALL add nothing; a line whose name key equals an open manual item's
(ignoring case, singular/plural folded) SHALL merge its amount into that item. An item's name and amount (free text such as `200 g` or
`1 cup + 200 g`) SHALL be editable; an amount that cannot be read SHALL be refused with "Enter an amount like 200 g".
Items SHALL be deletable.

#### Scenario: Manual item is parsed
- **WHEN** `2 l milk` is added
- **THEN** an open manual item named `milk` with the amount 2 l exists
- **proof:** unit

#### Scenario: Empty input adds nothing
- **WHEN** `` and `   ` are added
- **THEN** the list is unchanged
- **proof:** unit

#### Scenario: Same manual name merges amounts
- **WHEN** `500 ml milk` is added while the open manual item `Milk` has 1 l
- **THEN** there is still one milk item, with the amount 1.5 l
- **proof:** unit

#### Scenario: Add a manual item
- **WHEN** `2 l milk` is typed into the add field and Enter is pressed
- **THEN** the list shows "milk" with "2 l" under Other, and the field is empty again
- **proof:** e2e

#### Scenario: Edit an item's name and amount
- **WHEN** an item is edited to name "oat milk" and amount `1 l + 500 ml`, then another to amount `lots`
- **THEN** the first shows "oat milk" with "1.5 l", and the second shows "Enter an amount like 200 g" and keeps its amount
- **proof:** e2e

#### Scenario: Delete an item
- **WHEN** an item's delete control is pressed
- **THEN** the item is gone, also after a reload
- **proof:** e2e

### Requirement: Add from plan
"Add from plan" SHALL ask for a date range (default: the current week Monday–Sunday) and add the ingredients of every
recipe entry in the range, each line's quantity scaled by entry servings / recipe servings. Free-text entries SHALL
contribute nothing. Lines SHALL merge by name key (ignoring case, singular and plural folded: `1 onion` + `2 onions` → 3 onions, shown with
the longest name seen); equal units SHALL sum; the metric families g/kg and ml/l
SHALL sum within the family (shown in kg or l from 1000 g / 1000 ml); other units SHALL stay as separate amounts on one
line ("1 cup + 200 g flour"); a line without quantity SHALL appear once without amount and add nothing to an amount.
Plan amounts for a name that has an open manual item SHALL merge into that item (its manual part kept, the plan part
shown with it). Running it again SHALL replace every open plan-derived item and recalculate the plan part of open
manual items; manual parts and checked items SHALL stay, and a name already present as a checked item with a plan
contribution SHALL not be added again. A range with no recipe entries SHALL report "Nothing planned in this range" and
change nothing.

#### Scenario: Ingredients scale by entry servings
- **WHEN** a 2-serving recipe with `200 g flour` and `3 eggs` is planned with 4 servings and aggregated
- **THEN** the items are flour 400 g and eggs 6
- **proof:** unit

#### Scenario: Equal names and units merge
- **WHEN** two planned recipes contribute `2 tbsp Olive oil` and `1 tbsp olive oil`
- **THEN** there is one olive oil item with 3 tbsp
- **proof:** unit

#### Scenario: Metric family amounts sum
- **WHEN** contributions are `500 g flour` + `1 kg flour` and `250 ml milk` + `1 l milk` and `300 g sugar` + `200 g sugar`
- **THEN** the items show flour 1.5 kg, milk 1.25 l and sugar 500 g
- **proof:** unit

#### Scenario: Mixed units stay on one line
- **WHEN** contributions are `1 cup flour` and `200 g flour`
- **THEN** there is one flour item whose amounts read "1 cup + 200 g"
- **proof:** unit

#### Scenario: Singular and plural names fold to one line
- **WHEN** contributions are `1 onion`, `2 onions`, `1 tomato` and `2 Tomatoes`
- **THEN** there is one "onions" item with 3 and one "Tomatoes" item with 3
- **proof:** unit

#### Scenario: Line without quantity appears once without amount
- **WHEN** two recipes contribute `salt` and one contributes `1 tsp salt`
- **THEN** there is one salt item with the amount 1 tsp, and with only the two quantity-less lines there is one salt item without amount
- **proof:** unit

#### Scenario: Add from plan adds scaled, merged items
- **WHEN** the current week holds two recipe entries sharing `flour` and the list is filled from the plan
- **THEN** the result reports the number of added items and each is an open plan-derived item with the merged amount and its remembered category or Other
- **proof:** unit

#### Scenario: Free-text entries contribute nothing
- **WHEN** the range holds one recipe entry and the free-text entry "Pizza night"
- **THEN** only the recipe's ingredients are added
- **proof:** unit

#### Scenario: Regenerating replaces open plan items
- **WHEN** the list was filled from a plan with Lasagne, the plan entry is changed to Curry and the list is filled again
- **THEN** no open plan-derived item from Lasagne remains and Curry's ingredients are there
- **proof:** unit

#### Scenario: Manual and checked items survive regenerating
- **WHEN** the list holds a manual item, a checked plan-derived item and an open plan-derived item, and it is filled from the plan again
- **THEN** the manual and the checked item are unchanged and only the open plan-derived item was replaced
- **proof:** unit

#### Scenario: Checked plan item is not re-added
- **WHEN** plan-derived "flour" is checked and the list is filled again from a plan that still needs flour
- **THEN** there is exactly one flour item, the checked one
- **proof:** unit

#### Scenario: Empty range changes nothing
- **WHEN** the list holds open plan-derived items and is filled from a range with only free-text entries
- **THEN** the result is "nothing planned" and every item is unchanged
- **proof:** unit

#### Scenario: Plan amounts merge into a manual item with the same name
- **WHEN** an open manual item "milk" with 1 l exists and the plan contributes `500 ml milk`
- **THEN** there is one milk item showing 1.5 l, with the manual part 1 l and the plan part 500 ml
- **proof:** unit

#### Scenario: Regenerating recalculates the plan part of a manual item
- **WHEN** that milk item exists, the plan is changed to contribute `250 ml milk` and the list is filled again
- **THEN** there is still one milk item, showing 1.25 l, with the manual part 1 l unchanged
- **proof:** unit

#### Scenario: Add from plan for the shown week
- **WHEN** "Add from plan" is opened, the default range (current week) confirmed, with Lasagne (2 servings, `200 g flour`) planned with 4 servings
- **THEN** the list shows "400 g flour" among the added items
- **proof:** e2e

#### Scenario: Merged item shows its manual and plan parts
- **WHEN** the list holds manual "milk" 1 l, the plan contributes `500 ml milk`, the list is filled from the plan and the milk item's edit is opened
- **THEN** the list shows one "milk" with "1.5 l", and the edit shows amount "1 l" with "From plan: 500 ml"
- **proof:** e2e

#### Scenario: Empty range reports nothing planned
- **WHEN** "Add from plan" is confirmed for a range with no recipe entries while the list has items
- **THEN** "Nothing planned in this range" is shown and the list is unchanged
- **proof:** e2e

### Requirement: Categories
Items SHALL be grouped under the fixed categories Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks,
Household, Other, in that order; empty categories SHALL be hidden. A new item SHALL go to the category last chosen for
its name (ignoring case), else Other. Moving an item to a category SHALL remember that choice for its name.

#### Scenario: New item uses the remembered category
- **WHEN** "milk" was last moved to Dairy & Eggs and `1 l Milk` is added
- **THEN** the new item is in Dairy & Eggs
- **proof:** unit

#### Scenario: Unknown item goes to Other
- **WHEN** an item whose name was never categorised is added
- **THEN** it is in Other
- **proof:** unit

#### Scenario: Category memory ignores case
- **WHEN** "Äpfel" is moved to Produce and `3 äpfel` is added later
- **THEN** the new item is in Produce
- **proof:** unit

#### Scenario: List grouped by category with empty ones hidden
- **WHEN** the list holds items in Produce and Other only
- **THEN** exactly the headings Produce and Other are shown, in that order
- **proof:** e2e

#### Scenario: Moving an item to a category remembers it
- **WHEN** "milk" is moved to Dairy & Eggs, deleted, and `milk` is added again
- **THEN** the new milk item appears under Dairy & Eggs
- **proof:** e2e

### Requirement: Check off
Checking an item SHALL fill its checkbox, strike its text and move it into a "Checked" section at the bottom of the
list (with a slide animation); unchecking SHALL return it to its category. "Clear checked" SHALL delete every checked
item and SHALL be disabled when nothing is checked. Under reduced motion the item SHALL move without sliding.

#### Scenario: Clear checked removes all checked items
- **WHEN** two of four items are checked and checked items are cleared
- **THEN** two items remain, both open
- **proof:** unit

#### Scenario: Check off moves the item to Checked
- **WHEN** "milk" is checked
- **THEN** "milk" is struck through inside the "Checked" section, which is the last section of the list
- **proof:** e2e

#### Scenario: Uncheck restores the item
- **WHEN** a checked "milk" from Dairy & Eggs is unchecked
- **THEN** it is back under Dairy & Eggs, not struck through
- **proof:** e2e

#### Scenario: Clear checked is disabled with nothing checked
- **WHEN** the list has only open items
- **THEN** "Clear checked" is disabled, and after checking one item it is enabled and removes it
- **proof:** e2e

#### Scenario: Reduced motion checks off without sliding
- **WHEN** reduced motion is emulated and an item is checked
- **THEN** it is in the Checked section and no animation is running on it
- **proof:** e2e

#### Scenario: Check-off animation feels satisfying
- **WHEN** Rue checks off items in the running app
- **THEN** fill, strike-through and the slide to Checked read as one movement
- **proof:** manual (visual judgement by Rue)

### Requirement: Recipe to list journey
The archive, plan and list SHALL work together so that an imported recipe, edited, tagged and planned with 4 servings,
ends up on the list scaled, merged and grouped by category.

#### Scenario: Imported recipe reaches the list scaled and grouped
- **WHEN** a fixture recipe (6 servings) is imported, its title edited and its servings set to 2, tagged "Weeknight", found via the Weeknight chip and via an ingredient search, added to today's Dinner with 4 servings, and the list filled from the plan after "flour" was remembered as Pantry
- **THEN** the list shows the recipe's ingredients at twice their amounts, "flour" under Pantry and the rest under Other
- **proof:** e2e

