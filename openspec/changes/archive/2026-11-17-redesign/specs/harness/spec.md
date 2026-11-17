## MODIFIED Requirements

### Requirement: Proof commands
The repo SHALL provide `npm run proof` (the fingerprint guards `check-slop` and `check-drift`, svelte-check with `--fail-on-warnings`, build, vitest) and `npm run proof:full` (proof plus Playwright e2e). Both SHALL print the name of every passed test (vitest `--reporter=verbose`, Playwright `--reporter=list`) and exit non-zero on any failure. The e2e server SHALL listen on `$PORT` (default 4173) and use a fresh database at `.e2e/$PORT.db`, removed before each run, never the dev database.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; proven by running it, its output is the evidence every other unit relies on)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error, build error, failing test, `check-slop` violation or edited vendored file is present
- **THEN** `npm run proof` and `npm run proof:full` exit non-zero
- **proof:** manual (infrastructure; proven once in U1 with a deliberate raw colour and a deliberate vendored edit, then reverted)

#### Scenario: Proof-full runs e2e on an isolated database
- **WHEN** `PORT=4751 npm run proof:full` runs
- **THEN** Playwright lists every passed e2e test by name and the server used `.e2e/4751.db`, not the dev database
- **proof:** manual (infrastructure; proven by running it in U1)

#### Scenario: Proof runs the fingerprint guards
- **WHEN** `package.json` is read
- **THEN** `proof` runs the slop check and `scripts/fingerprint/check-drift.mjs` before `npm run check`
- **proof:** unit
