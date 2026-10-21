## ADDED Requirements

### Requirement: Free tags
Tags SHALL be free names, seeded with Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad and Baking. Tags SHALL
be created while editing a recipe by typing a name; a name equal to an existing tag ignoring case (including non-ASCII
letters) SHALL reuse that tag.

#### Scenario: New tag created while editing a recipe
- **WHEN** "Weeknight" is typed into the form's tag field, confirmed and the recipe saved
- **THEN** the recipe's edit page shows the tag Weeknight, and the tag field of a new recipe suggests Weeknight
- **proof:** e2e

#### Scenario: Duplicate tag name reuses the existing tag
- **WHEN** tags `dessert` and `KÄSE` are ensured while Dessert and Käse exist
- **THEN** the existing Dessert and Käse are returned and no tag is added
- **proof:** unit

### Requirement: Tag manager
`/recipes/tags` SHALL list every tag with the number of recipes using it and allow rename and delete. Renaming to a
name another tag already has (ignoring case) SHALL merge the two: every recipe of the renamed tag gets the existing tag,
the renamed tag is deleted, and the existing tag keeps its name. Deleting a
tag in use SHALL ask "Delete tag “<name>”? It's used by <n> recipes." and remove it from those recipes; an unused tag
SHALL be deleted after a plain confirm.

#### Scenario: Rename a tag
- **WHEN** Snack is renamed to Snacks in the tag manager
- **THEN** the list and every recipe that had Snack show Snacks
- **proof:** e2e

#### Scenario: Renaming onto an existing name merges the tags
- **WHEN** Side (on recipes A and B) is renamed to `dessert` while Dessert is on recipes B and C
- **THEN** Side no longer exists, Dessert is on A, B and C once each, and the result names Dessert as the tag merged into
- **proof:** unit

#### Scenario: Rename onto an existing tag merges them in the manager
- **WHEN** Side is renamed to `Dessert` in the tag manager
- **THEN** the list shows one Dessert whose count includes Side's recipes and no Side
- **proof:** e2e

#### Scenario: Deleting a tag in use names the count
- **WHEN** Delete is chosen for a tag used by 4 recipes and confirmed
- **THEN** the dialog says "Delete tag “<name>”? It's used by 4 recipes." and afterwards the tag is gone from the list
- **proof:** e2e

#### Scenario: Deleted tag is removed from its recipes
- **WHEN** a tag used by two recipes is deleted
- **THEN** both recipes still exist without that tag, and a search for the tag's name no longer finds them by it
- **proof:** unit
