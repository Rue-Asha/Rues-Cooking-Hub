## ADDED Requirements

### Requirement: Tag manager states
`/recipes/tags` SHALL show the tag list with counts, rename (a rename onto an existing name merges, with the status "Merged <from> into <into>") and the delete dialog, with the behaviour of the existing tag manager requirement, styled with fingerprint roles only. It SHALL stay readable without horizontal page scroll down to 320 px with no tags and with long names.

#### Scenario: No tags shows the empty state
- **WHEN** every tag is deleted and `/recipes/tags` is opened at 390×844
- **THEN** the context label reads "0 tags", the empty state "No tags yet" with "Tags are added while you edit a recipe." (gate 5) and the link "All recipes" is shown, and no list item exists
- **proof:** e2e

#### Scenario: Long tag names wrap in the manager
- **WHEN** a tag with a 60-character name is shown and its rename form opened at 320×640
- **THEN** the full name, "Rename <name>" and "Delete <name>" are reachable, the rename field shows the name, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Merge reports both names
- **WHEN** "Desserts" is renamed to "dessert" while "Dessert" exists
- **THEN** the status reads "Merged Desserts into Dessert" and one tag "Dessert" remains with both tags' recipes
- **proof:** e2e

## MODIFIED Requirements

### Requirement: Free tags
Tags SHALL be free names, seeded with Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad and Baking. Tags SHALL
be created while editing a recipe by typing a name; a name equal to an existing tag ignoring case (including non-ASCII
letters) SHALL reuse that tag. The form's tag field SHALL suggest at most four existing tags not yet chosen, those
matching what is typed (signed hi-fi, verify round 2).

#### Scenario: New tag created while editing a recipe
- **WHEN** "Weeknight" is typed into the form's tag field, confirmed and the recipe saved
- **THEN** the recipe's edit page shows the tag Weeknight, and typing "Wee" into the tag field of a new recipe suggests Weeknight
- **proof:** e2e

#### Scenario: Duplicate tag name reuses the existing tag
- **WHEN** tags `dessert` and `KÄSE` are ensured while Dessert and Käse exist
- **THEN** the existing Dessert and Käse are returned and no tag is added
- **proof:** unit
