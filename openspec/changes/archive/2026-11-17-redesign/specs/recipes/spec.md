## ADDED Requirements

### Requirement: One save action on the recipe form
The recipe form (import preview, `/recipes/new/form`, `/recipes/[id]/edit`) SHALL offer exactly one "Save recipe" button and one "Cancel" in a bar that sticks to the bottom of the viewport (on the phone directly above the phone bar), reachable from anywhere in a long form (placement fixed at gate 4, copy at gate 5); while saving it SHALL read "Saving…" and be disabled. This replaces the doubled save before and after the fields.

#### Scenario: Recipe form has one Save recipe
- **WHEN** `/recipes/new/form`, a recipe's edit page and an import preview are opened at 390×844 and 1280×800
- **THEN** each exposes exactly one button named "Save recipe" and one "Cancel"
- **proof:** e2e

#### Scenario: Save stays reachable in a long form
- **WHEN** a recipe with 50 ingredient lines and 20 steps is edited at 390×844 and the page is scrolled to the middle of the ingredients
- **THEN** "Save recipe" is visible in the sticky bar at the bottom of the viewport, its rectangle does not overlap the phone bar, it can be activated without scrolling, and saving opens the recipe page
- **proof:** e2e

### Requirement: Recipe form states
The recipe form SHALL keep its behaviour (sections, live parse, photo, tags, source, notes, validation, unsaved-changes guard, local draft with "Restored your unsaved draft" and "Discard draft"), styled with fingerprint roles only, laid out in two columns from 768 px (gate 4), and stay usable without horizontal page scroll down to 320 px with 50+ ingredients and overlong text. Photo errors SHALL show at the photo field and keep the form's input.

#### Scenario: HEIC photo the server cannot read is rejected
- **WHEN** a file `photo.heic` of type `image/heic` that is not a decodable image is chosen and the recipe saved
- **THEN** "That file isn't an image" is shown at the photo field, the recipe is not saved and the other fields keep their input
- **proof:** e2e

#### Scenario: Fifty ingredient lines stay usable
- **WHEN** 50 ingredient lines of 120 characters are entered at 320×640
- **THEN** every line and its parse preview are reachable, "Add line" is still available, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: A new recipe form starts with one line, the plate and four suggestions
- **WHEN** `/recipes/new/form` is opened at 375×812 while the archive holds 12 tags
- **THEN** the ingredients hold one line with no "Remove line", its placeholder is not cut off, the empty photo is the "No photo yet" plate showing "N" (of "New recipe") in a 16:9 frame, and four tag suggestions are shown; typing part of a tag name shows at most four matching suggestions (signed hi-fi, verify rounds 2 and 3)
- **proof:** e2e

#### Scenario: An edited recipe without a title keeps a neutral plate
- **WHEN** a recipe without a photo is opened for editing and its title is cleared
- **THEN** the "No photo yet" plate shows no letter (no "N" of "New recipe"); only `/recipes/new/form` borrows the "N" while its title is empty (verify round 3)
- **proof:** e2e

#### Scenario: Restored draft offers Discard draft on the new form
- **WHEN** a title is typed on `/recipes/new/form`, the page is reloaded at 390×844
- **THEN** "Restored your unsaved draft" and "Discard draft" are shown with the typed title, and "Discard draft" empties the form
- **proof:** e2e
