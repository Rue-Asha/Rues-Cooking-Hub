## ADDED Requirements

### Requirement: Import states on every width
`/recipes/new` SHALL show every import state (initial, reading, preview, fallback, duplicate, invalid link, restored draft) with the behaviour of the existing import requirements, styled with fingerprint roles only, and stay usable without horizontal page scroll down to 320 px with overlong input.

#### Scenario: Import states render at three widths
- **WHEN** the reading, preview, fallback, duplicate and invalid states are produced with the fixture pages at 390×844, 768×1024 and 1280×800
- **THEN** each shows its status or alert text from the contract ("Reading the page…", "Read from <host>", "Couldn't read a recipe from this page", "Already in your archive", "Enter a valid web address (http or https)") and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Long link and title stay usable in the import
- **WHEN** a 400-character link is pasted and the fixture page yields a 120-character title, at 320×640
- **THEN** the link field, the "Already in your archive" or "Read from <host>" status and the preview's title are fully reachable and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e
