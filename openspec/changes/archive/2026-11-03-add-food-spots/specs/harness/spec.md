## MODIFIED Requirements

### Requirement: Test-only routes
`POST /__test/reset`, `POST /__test/seed` and `POST /__test/clock` SHALL exist only for e2e and answer 404 unless
`COOKING_HUB_TEST=1`. Reset SHALL delete every recipe, spot, spot tag, image, plan entry, shopping item and category
memory and restore exactly the starter tags. Seed SHALL insert the recipes (with tags, sections, an optional generated
image, explicit `createdAt`/`favouritedAt`), spots (status, score in hundredths, price, city, neighbourhood, address,
website, notes, spot tags, explicit `createdAt`, and `image: true` for the generated image or a `/mockups/…` path for
a stored fixture photo), plan entries, shopping items and category memory it is given and return their ids. Clock
SHALL set the server's "today" (or clear it with `null`).

#### Scenario: Test routes answer 404 without the test flag
- **WHEN** a test route handler runs while `COOKING_HUB_TEST` is not `1`
- **THEN** it responds 404 and changes nothing
- **proof:** unit

#### Scenario: Reset leaves an empty archive with the starter tags
- **WHEN** recipes and spots with spot tags and photos were seeded and `POST /__test/reset` is called
- **THEN** no recipes, spots, spot tags, images, plan entries or shopping items remain and the tags are exactly the eight starter tags
- **proof:** e2e

#### Scenario: Seed returns the ids of what it inserted
- **WHEN** `POST /__test/seed` is called with two recipes, two spots, one plan entry and one shopping item
- **THEN** the response lists two recipe ids, two spot ids, one entry id and one item id, and those rows exist
- **proof:** e2e

#### Scenario: Seeded spots carry their photos
- **WHEN** `POST /__test/seed` is called with one spot with `image: true` and one with a `/mockups/` photo path
- **THEN** both spots have an image served by `GET /images/<id>` with status 200
- **proof:** e2e

#### Scenario: Test clock sets today
- **WHEN** the clock is set to 2026-03-04 and `today()` is read on the server
- **THEN** it returns `2026-03-04`, and after setting `null` it returns the real date again
- **proof:** unit
