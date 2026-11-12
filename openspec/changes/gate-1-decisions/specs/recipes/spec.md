## ADDED Requirements

### Requirement: Local draft of an unsaved recipe
A new or imported recipe form with edits SHALL keep a draft in the browser (one draft, the form's fields and image link, not a chosen photo file). Opening `/recipes/new` or `/recipes/new/form` while a draft exists SHALL show the form prefilled from it with the status "Restored your unsaved draft" and a "Discard draft" action. A successful save, "Discard draft" and "Discard" in the discard dialog SHALL clear the draft. A form equal to its starting state SHALL keep no draft. Unavailable browser storage SHALL leave the form working without a draft and without an error. Recipes being edited SHALL have no draft.

#### Scenario: Draft round-trips through storage
- **WHEN** a draft with a title, an ingredient section and an image link is saved and loaded
- **THEN** the loaded draft equals the saved one
- **proof:** unit

#### Scenario: Unreadable or unavailable storage yields no draft
- **WHEN** the stored value is not valid JSON, has another version, or the storage throws
- **THEN** loading returns no draft, saving does not throw
- **proof:** unit

#### Scenario: Clearing removes the draft
- **WHEN** a draft is saved and then cleared
- **THEN** loading returns no draft
- **proof:** unit

#### Scenario: Unchanged form keeps no draft
- **WHEN** a form equal to its starting state is checked for keeping
- **THEN** it is not worth keeping, and a form with a changed title is
- **proof:** unit

#### Scenario: Draft survives a reload
- **WHEN** a title is typed into the new recipe form and the page is reloaded
- **THEN** the form shows that title and "Restored your unsaved draft"
- **proof:** e2e

#### Scenario: Save and discard clear the draft
- **WHEN** a restored draft is saved, and separately "Discard draft" is pressed on another restored draft
- **THEN** reopening `/recipes/new/form` shows an empty form without the status in both cases
- **proof:** e2e

#### Scenario: Imported preview survives a reload
- **WHEN** a recipe is imported, its title edited and the page reloaded
- **THEN** `/recipes/new` shows the "Recipe preview" form with the edited title and "Restored your unsaved draft"
- **proof:** e2e
