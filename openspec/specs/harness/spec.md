# harness Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Proof commands
The repo SHALL provide `npm run proof` (svelte-check with `--fail-on-warnings`, build, vitest) and
`npm run proof:full` (proof plus Playwright e2e). Both SHALL print the name of every passed test (vitest
`--reporter=verbose`, Playwright `--reporter=list`) and exit non-zero on any failure. The e2e server SHALL listen on
`$PORT` (default 4173) and use a fresh database at `.e2e/$PORT.db`, removed before each run, never the dev database.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; proven by running it, its output is the evidence every other unit relies on)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error, build error or failing test is present
- **THEN** `npm run proof` and `npm run proof:full` exit non-zero
- **proof:** manual (infrastructure; proven once in U1 with a deliberately failing test, then reverted)

#### Scenario: Proof-full runs e2e on an isolated database
- **WHEN** `PORT=4701 npm run proof:full` runs
- **THEN** Playwright lists every passed e2e test by name and the server used `.e2e/4701.db`, not the dev database
- **proof:** manual (infrastructure; proven by running it in U1)

### Requirement: E2E projects and isolation
Playwright SHALL run two projects, `phone` (390×844, touch, mobile) and `desktop` (1280×800), against the built
adapter-node server (`node build`, or `node $E2E_APP_DIR/build` when `E2E_APP_DIR` is set), with
`PROTOCOL_HEADER=x-forwarded-proto`, `extraHTTPHeaders: { 'x-forwarded-proto': 'http' }`, `BODY_SIZE_LIMIT=16M` and
`COOKING_HUB_TEST=1`. Tests SHALL run with `workers: 1`; every test that reads or writes data SHALL start with the
reset helper and seed what it needs. A test that only uses `request`, or only makes sense on one device (drag & drop,
swipe, a self-set viewport), SHALL run in one project and be skipped in the other. Every e2e test SHALL wait for
`html[data-hydrated]` before interacting.

#### Scenario: Each e2e test runs on phone and desktop
- **WHEN** `npm run proof:full` runs
- **THEN** the list output shows each device-independent test once under `[phone]` and once under `[desktop]`
- **proof:** manual (suite structure; read from the proof:full list output at Gate 2)

#### Scenario: App is hydrated before tests interact
- **WHEN** any page is opened with the e2e helper
- **THEN** the helper resolves only after `html[data-hydrated]` is present
- **proof:** e2e

### Requirement: Test-only routes
`POST /__test/reset`, `POST /__test/seed` and `POST /__test/clock` SHALL exist only for e2e and answer 404 unless
`COOKING_HUB_TEST=1`. Reset SHALL delete every recipe, image, plan entry, shopping item and category memory and
restore exactly the starter tags. Seed SHALL insert the recipes (with tags, sections, an optional generated image,
explicit `createdAt`/`favouritedAt`), plan entries, shopping items and category memory it is given and return their
ids. Clock SHALL set the server's "today" (or clear it with `null`).

#### Scenario: Test routes answer 404 without the test flag
- **WHEN** a test route handler runs while `COOKING_HUB_TEST` is not `1`
- **THEN** it responds 404 and changes nothing
- **proof:** unit

#### Scenario: Reset leaves an empty archive with the starter tags
- **WHEN** data was seeded and `POST /__test/reset` is called
- **THEN** no recipes, plan entries or shopping items remain and the tags are exactly the eight starter tags
- **proof:** e2e

#### Scenario: Seed returns the ids of what it inserted
- **WHEN** `POST /__test/seed` is called with two recipes, one plan entry and one shopping item
- **THEN** the response lists two recipe ids, one entry id and one item id, and those rows exist
- **proof:** e2e

#### Scenario: Test clock sets today
- **WHEN** the clock is set to 2026-03-04 and `today()` is read on the server
- **THEN** it returns `2026-03-04`, and after setting `null` it returns the real date again
- **proof:** unit

### Requirement: Package script
`npm run package` SHALL build the app and write `dist/rues-cooking-hub-<version>.tgz` plus
`dist/rues-cooking-hub-<version>.tgz.sha256`. The tarball SHALL hold one top-level directory
`rues-cooking-hub-<version>/` with `build/`, `migrations/`, the production `package.json`, the lockfile and production
`node_modules` (including sharp's prebuilt linux-x64 binaries).

#### Scenario: Package produces a verifiable tarball
- **WHEN** `npm run package` runs
- **THEN** `dist/` holds the tgz and a `.sha256` file that `sha256sum -c` accepts, and the tgz lists `build/`,
  `migrations/` and `package.json` under one top-level directory
- **proof:** unit

### Requirement: Harness declaration
`CLAUDE.md` SHALL contain `## Harness` declaring proof `npm run proof`, proof-full `npm run proof:full`, run
`npm run dev` → http://localhost:5173, package, `ship: merge` and `release: tag`.

#### Scenario: Harness declared with merge and tag policy
- **WHEN** `CLAUDE.md` is read
- **THEN** its `## Harness` section lists `proof`, `proof-full`, `run`, `package`, `ship: merge` and `release: tag`
- **proof:** manual (documentation; checked by reading the file at Gate 2)

