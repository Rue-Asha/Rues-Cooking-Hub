## ADDED Requirements

### Requirement: Recipe fields and validation
A recipe SHALL have a title (required, not blank), description, hero image, source URL, servings (integer, default 2,
at least 1), prep and cook minutes (whole numbers ≥ 0 or empty), tags, ingredient sections, step sections, notes
(Markdown) and a favourite flag. The server SHALL reject invalid input with field messages from `src/lib/copy.ts`
("Title is required", "Servings must be at least 1", "Enter whole minutes, 0 or more") and store nothing.

#### Scenario: Recipe saved with all fields
- **WHEN** a recipe with every field set, two ingredient sections and two step sections is created and read back
- **THEN** every field, section title, line order and tag comes back as entered, ingredient lines with their original text and parse
- **proof:** unit

#### Scenario: Server rejects invalid recipe input
- **WHEN** a recipe is created with a blank title, with servings 0, or with prep or cook minutes that are negative or not whole
- **THEN** creation fails with the field message for `title`, `servings`, `prepMinutes` or `cookMinutes` and no recipe is stored
- **proof:** unit

#### Scenario: Empty title blocks saving the form
- **WHEN** the form is saved with an empty title
- **THEN** "Title is required" is shown at the title field, the page stays on the form and the archive is unchanged
- **proof:** e2e

#### Scenario: Servings below 1 are rejected in the form
- **WHEN** the form is saved with servings 0
- **THEN** "Servings must be at least 1" is shown at the servings field and nothing is saved
- **proof:** e2e

#### Scenario: New recipe defaults to 2 servings
- **WHEN** "Start from scratch" opens the form
- **THEN** the servings field holds 2
- **proof:** e2e

### Requirement: Manual creation form
Recipes → "Add recipe" → "Start from scratch" SHALL open an empty form at `/recipes/new/form`. Ingredients and steps
SHALL be entered as sections, each with an optional title ("For the sauce") and lines; a section with no lines SHALL be
dropped on save. Save SHALL store the recipe and open its page `/recipes/<id>`. Leaving the form with unsaved changes
SHALL ask "Discard changes?" with "Keep editing" and "Discard".

#### Scenario: Recipe created from scratch
- **WHEN** a title, two ingredient sections ("For the dough", "For the sauce") with lines and one step section are entered and saved
- **THEN** the browser is at `/recipes/<id>`, and the edit page of that recipe shows both sections in order with their lines
- **proof:** e2e

#### Scenario: Empty section is dropped on save
- **WHEN** a recipe is saved with an ingredient section that has a title but no lines
- **THEN** the stored recipe has no such section
- **proof:** unit

#### Scenario: Leaving with unsaved changes asks first
- **WHEN** the title is typed into the form and the Plan nav item is clicked
- **THEN** "Discard changes?" appears; "Keep editing" stays on the form with the title kept, "Discard" opens Plan
- **proof:** e2e

#### Scenario: Leaving without changes does not ask
- **WHEN** the empty form is opened and the Plan nav item is clicked
- **THEN** Plan opens without a dialog
- **proof:** e2e

### Requirement: Markdown notes and steps
Notes and step lines SHALL be Markdown, rendered with raw HTML disabled: HTML in the source SHALL appear as text, no
script or event handler from it SHALL run, and only `http`, `https` and `mailto` links SHALL become links.

#### Scenario: Notes render Markdown
- **WHEN** notes `**Crispy** edges, see [this](https://example.com)` are rendered
- **THEN** the output has a `strong` element and an `https` link
- **proof:** unit

#### Scenario: Unsafe link schemes stay text
- **WHEN** notes `[x](javascript:alert(1))` are rendered
- **THEN** the output contains no `a` element with a `javascript:` href
- **proof:** unit

#### Scenario: Script in notes is not executed
- **WHEN** a recipe's notes contain `<script>window.__pwned=1</script><img src=x onerror="window.__pwned=2">` and its page is opened
- **THEN** `window.__pwned` is undefined and the markup is visible as text
- **proof:** e2e

### Requirement: Recipe images
A recipe image SHALL come from an uploaded file or an image URL and SHALL be stored downscaled (long side at most
1600 px, at most 200 KB) as a BLOB in the `images` table, served at `GET /images/<id>` with
`Cache-Control: public, max-age=31536000, immutable`. Files that are not images, or larger than 15 MB, SHALL be
rejected with "That file isn't an image" or "Images can be at most 15 MB" (the size check also runs in the browser
before upload). Replacing a recipe's image, or "Remove image" in the form, SHALL delete the old image row; without an image the
placeholder shows. An image URL that cannot be downloaded
SHALL save the recipe without image and show "Saved without image: the image couldn't be downloaded."; when the
recipe being edited already had an image, that image SHALL stay and the notice SHALL say so: "The new image couldn't
be downloaded; the previous image was kept." A recipe's source URL SHALL be stored in the normalised form of the
import (fragment dropped, host lowercased, percent-encoded), whatever way it was entered.

#### Scenario: Uploaded image is stored downscaled
- **WHEN** a 3000×2000 photo-like JPEG is stored
- **THEN** the stored image's long side is at most 1600 px and its size at most 200 KB
- **proof:** unit

#### Scenario: Image from a URL is stored
- **WHEN** an image URL served by a local test server is stored
- **THEN** an image row exists with the downscaled bytes
- **proof:** unit

#### Scenario: Non-image file is rejected by the server
- **WHEN** a text file's bytes are stored as an image
- **THEN** storing fails with the reason `not-image` and no row is written
- **proof:** unit

#### Scenario: Image is served with caching headers
- **WHEN** `GET /images/<id>` is requested for a stored image
- **THEN** the response is 200 with an `image/*` content type and `Cache-Control: public, max-age=31536000, immutable`, and an unknown id answers 404
- **proof:** e2e

#### Scenario: Image upload from the form
- **WHEN** a JPEG is chosen in the form's image field and the recipe is saved
- **THEN** the edit page shows the stored image from `/images/<id>`
- **proof:** e2e

#### Scenario: Non-image file is rejected in the form
- **WHEN** a `.txt` file is chosen in the image field and saved
- **THEN** "That file isn't an image" is shown and the recipe is not saved
- **proof:** e2e

#### Scenario: Oversize file is rejected in the form
- **WHEN** a 16 MB file is chosen in the image field
- **THEN** "Images can be at most 15 MB" is shown before any upload and Save stays possible without the image
- **proof:** e2e

#### Scenario: Replacing the image removes the old blob
- **WHEN** a recipe with an image is updated with a new image
- **THEN** the recipe points at the new image and the old image row no longer exists
- **proof:** unit

#### Scenario: Removing the image deletes its blob
- **WHEN** a recipe with an image is updated with no image
- **THEN** the recipe has no image and the old image row no longer exists
- **proof:** unit

#### Scenario: Remove image shows the placeholder
- **WHEN** "Remove image" is pressed on the edit page of a recipe with an image and the recipe is saved
- **THEN** the edit page shows the ImagePlaceholder and the old `/images/<id>` answers 404
- **proof:** e2e

#### Scenario: Recipe saved without image when its image URL fails
- **WHEN** a recipe is saved from the form with an image URL that answers 404
- **THEN** the recipe is stored without image and "Saved without image: the image couldn't be downloaded." is shown
- **proof:** e2e

#### Scenario: Edit keeps the old image when a new image URL fails
- **WHEN** a recipe with an image is edited, its image link set to one that answers 404, and saved
- **THEN** the recipe still points at its old image and "The new image couldn't be downloaded; the previous image was kept." is shown
- **proof:** e2e

### Requirement: Edit and delete
Recipe → Edit SHALL open `/recipes/<id>/edit` with the form prefilled; Save SHALL update the recipe. Delete SHALL ask
for confirmation naming how many plan entries use the recipe; on confirm the recipe and its image SHALL be deleted, each
of its plan entries SHALL become a free-text entry with the recipe's title, the shopping list SHALL stay unchanged, and
the archive SHALL open. A recipe in no plan entry SHALL get a plain confirm.

#### Scenario: Edit changes are saved
- **WHEN** the title, servings and an ingredient line are changed on the edit page and saved
- **THEN** reopening the edit page shows the new values
- **proof:** e2e

#### Scenario: Deleted recipe's plan entries become free text
- **WHEN** a recipe used by three plan entries is deleted
- **THEN** the result reports 3 converted entries, and those entries now have no recipe and the recipe's title as text, at the same date, slot and position
- **proof:** unit

#### Scenario: Deleting a recipe leaves the shopping list unchanged
- **WHEN** a recipe whose ingredients are on the shopping list is deleted
- **THEN** every shopping item, its amounts and its checked state are unchanged
- **proof:** unit

#### Scenario: Delete names the plan entries that use the recipe
- **WHEN** Delete is chosen on a recipe used by 2 plan entries and confirmed
- **THEN** the dialog says "Delete “<title>”? It's used in 2 plan entries; they'll stay in the plan as text.", and after confirming the archive opens without the recipe
- **proof:** e2e

#### Scenario: Recipe in no plan entry gets a plain confirm
- **WHEN** Delete is chosen on a recipe used by no plan entry
- **THEN** the dialog says only "Delete “<title>”?"
- **proof:** e2e
