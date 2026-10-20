## ADDED Requirements

### Requirement: Read a recipe from a page
`readRecipe(url)` SHALL fetch an `http`/`https` URL on the server (timeout 10 s, at most 5 MB read, redirects followed)
and read the first schema.org `Recipe` from the page's JSON-LD, also inside `@graph` and in arrays, skipping scripts
that are not valid JSON. It SHALL map `name`, `description`, `recipeYield` (first whole number → servings, else 2),
`prepTime`/`cookTime` (ISO 8601 durations → minutes; only `totalTime` → cook minutes), `recipeIngredient` (one
untitled section), `recipeInstructions` (strings, `HowToStep`s, `HowToSection`s as titled step sections), `image`
(string, object or array; relative URLs resolved against the page), `recipeCategory` and `keywords` (strings split on
commas, or arrays; trimmed, de-duplicated ignoring case) as tag names, and the URL itself as source URL. HTML entities and
tags in text SHALL be decoded and stripped.

#### Scenario: Recipe is read from saved real pages
- **WHEN** each saved real-site fixture in `fixtures/import/` is read
- **THEN** each yields a title, at least one ingredient line, at least one step, servings and the values recorded for it in `fixtures/import/expected.json`
- **proof:** unit

#### Scenario: Recipe found inside @graph
- **WHEN** a page's JSON-LD is a `@graph` holding a WebPage, an Organization and a Recipe with `@type: ["Recipe"]`
- **THEN** the Recipe's fields are read
- **proof:** unit

#### Scenario: HowToSection becomes step sections
- **WHEN** `recipeInstructions` holds two `HowToSection`s named "Dough" and "Filling" with `HowToStep`s
- **THEN** the draft has two step sections with those titles and the steps' text in order
- **proof:** unit

#### Scenario: ISO 8601 durations become minutes
- **WHEN** `PT1H30M`, `PT45M`, `P0DT0H20M` and `soon` are converted
- **THEN** they give 90, 45, 20 and null
- **proof:** unit

#### Scenario: recipeYield becomes servings
- **WHEN** `recipeYield` is `"4 servings"`, `["6", "6 portions"]`, `8` or missing
- **THEN** servings are 4, 6, 8 and 2
- **proof:** unit

#### Scenario: Categories and keywords become tag names
- **WHEN** a Recipe has `recipeCategory: "Dessert"` and `keywords: "baking, Dessert,  quick "`
- **THEN** the draft's tag names are Dessert, baking and quick
- **proof:** unit

#### Scenario: Relative image URL is resolved
- **WHEN** the Recipe's `image` is `{ "url": "/img/pie.jpg" }` on `https://example.com/r/pie`
- **THEN** the draft's image URL is `https://example.com/img/pie.jpg`
- **proof:** unit

### Requirement: Import fallback
`readRecipe` SHALL return a fallback draft when the page is unreachable, answers with an error status, times out, is
larger than the limit or holds no Recipe data: the source URL and, if the HTML could be read, the title from
`og:title` (else `<title>`) and the image URL from `og:image`. A URL that is not `http`/`https` SHALL be invalid.

#### Scenario: Page without Recipe data falls back to meta tags
- **WHEN** a page with `og:title` "Grandma's Pie", `og:image` and no Recipe JSON-LD is read
- **THEN** the result is a fallback with that title, that image URL and the source URL
- **proof:** unit

#### Scenario: Unreachable page is a fallback
- **WHEN** a URL whose server refuses the connection is read
- **THEN** the result is a fallback with only the source URL
- **proof:** unit

#### Scenario: Blocked page is a fallback
- **WHEN** the page answers 403
- **THEN** the result is a fallback with only the source URL
- **proof:** unit

#### Scenario: Slow page times out
- **WHEN** a page does not answer within the timeout (the test passes 200 ms; the default is 10 000 ms)
- **THEN** the result is a fallback with only the source URL, returned shortly after the timeout
- **proof:** unit

#### Scenario: Oversized page is a fallback
- **WHEN** a page streams more than 5 MB
- **THEN** reading stops at the limit and the result is a fallback
- **proof:** unit

#### Scenario: Only http and https URLs are fetched
- **WHEN** `file:///etc/passwd`, `ftp://x.org/r` and `not a url` are read
- **THEN** each result is invalid and no request is made
- **proof:** unit

### Requirement: Import flow
Recipes → "Add recipe" (`/recipes/new`) SHALL offer a URL field with "Import" and a "Start from scratch" link. Import
SHALL show "Reading the page…" while the server works, then the recipe form prefilled with the draft (the editable
preview, ingredient parses and the draft's tags shown; a tag name equal to an existing tag ignoring case uses that tag,
others are created on Save); Save SHALL store it like a manual recipe, downloading the image URL. A fallback
SHALL show "Couldn't read a recipe from this page" above the form prefilled with the fallback draft. An invalid URL
SHALL show "Enter a valid web address (http or https)" at the field. A URL already stored as a recipe's source URL
SHALL show "Already in your archive" with a link to that recipe and "Import anyway".

#### Scenario: Import shows an editable preview
- **WHEN** the URL of a recipe fixture page is imported, the title is changed in the preview and Save is pressed
- **THEN** the stored recipe has the changed title, the fixture's ingredients, steps, servings, times, source URL and its image
- **proof:** e2e

#### Scenario: Imported tags reuse existing tags
- **WHEN** a fixture page with `recipeCategory: "dessert"` and `keywords: "Weeknight"` is imported and saved
- **THEN** the preview showed the tags Dessert and Weeknight, the recipe carries the existing Dessert tag and a new Weeknight tag, and the tag list holds one Dessert
- **proof:** e2e

#### Scenario: Import failure opens the prefilled manual form
- **WHEN** the URL of a fixture page without Recipe data is imported
- **THEN** "Couldn't read a recipe from this page" is shown with the form prefilled with the URL, the page's og:title and image URL
- **proof:** e2e

#### Scenario: Invalid URL shows an inline error
- **WHEN** `recipe pie` is entered and Import is pressed
- **THEN** "Enter a valid web address (http or https)" is shown at the field and no form opens
- **proof:** e2e

#### Scenario: Known URL offers the existing recipe
- **WHEN** a URL that is already a recipe's source URL is imported
- **THEN** "Already in your archive" links to that recipe, and "Import anyway" opens the preview
- **proof:** e2e

#### Scenario: Known URL matches however the source was saved
- **WHEN** recipes are saved by hand with source `https://example.com/rezepte/käsespätzle`, `http://example.com` and `https://Example.com/pie/#steps`, and those URLs are looked up as an import would normalise them
- **THEN** each lookup finds the recipe saved with it
- **proof:** unit

#### Scenario: Image download failure saves without image
- **WHEN** a fixture page whose image URL answers 404 is imported and saved
- **THEN** the recipe is stored without image and "Saved without image: the image couldn't be downloaded." is shown
- **proof:** e2e

#### Scenario: Importing a real recipe URL
- **WHEN** Rue imports a recipe from a real recipe site in the running app
- **THEN** the preview shows its title, ingredients with parses, steps and image, and Save stores it
- **proof:** manual (needs the internet and a real site; tests never hit the network)
