## MODIFIED Requirements

### Requirement: Mockups before feature UI
Static mockups of Home, Recipes, Recipe detail, Import (preview and fallback form), Plan, List and Eating Out SHALL
exist at `/__mockups/<screen>` (404 unless `COOKING_HUB_TEST=1`), built from the shared components with fixture data
and free-licence food photos in `static/mockups/` whose source URL, author and licence are listed in
`static/mockups/CREDITS.txt`, and `npm run shots:mockups` SHALL write their screenshots at 390×844 and 1280×800 to
`test-results/shots/mockups/<project>-<screen>.png`. The Eating Out mockup (`/__mockups/eating-out`) SHALL show the
list (segment, filters, cards with score badges and ranks), the spot page, the add form, the Mark visited sheet and
the Home "Top spots" row, using about six CC0 restaurant/café photos stored locally. All main screens SHALL follow one
alignment rule (design.md → Visual brief). No unit that builds feature UI SHALL start before Rue approved the mockups;
no unit that builds Eating Out UI SHALL start before Rue approved the Eating Out mockup.

#### Scenario: Mockup screenshots are produced for both viewports
- **WHEN** `npm run shots:mockups` runs
- **THEN** it writes one screenshot per screen and project (16 files: 8 screens × phone and desktop)
- **proof:** e2e

#### Scenario: Every mockup photo is credited
- **WHEN** the files in `static/mockups/` are compared with `CREDITS.txt`
- **THEN** every image file has a line with its source URL, author and licence
- **proof:** unit

#### Scenario: Mockup routes are hidden without the test flag
- **WHEN** the mockup route guard runs while `COOKING_HUB_TEST` is not `1`
- **THEN** it responds 404
- **proof:** unit

#### Scenario: Main screens share one alignment rule
- **WHEN** each mockup screen is measured at 390 and 1280
- **THEN** the page header and every section heading start at the content column's left edge, and the column is centred within 1px
- **proof:** e2e

#### Scenario: Eating Out mockup loads only local resources
- **WHEN** `/__mockups/eating-out` is opened and has settled
- **THEN** every request goes to the app's own origin and every spot photo comes from `/mockups/`
- **proof:** e2e

#### Scenario: Rue approves the mockups
- **WHEN** Rue reviews the phone and desktop screenshots, the desktop judged as seriously as the phone
- **THEN** Rue approves them, and only then do feature UI units start
- **proof:** manual (taste stop; visual judgement by Rue)

#### Scenario: Requested changes revise the mockups
- **WHEN** Rue asks for changes to the mockups
- **THEN** the mockups are revised and shown again until Rue approves; the build waits, which is not a failure
- **proof:** manual (taste stop; visual judgement by Rue)
