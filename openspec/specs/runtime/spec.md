# runtime Specification

## Purpose
TBD - created by archiving change build-cooking-hub. Update Purpose after archive.
## Requirements
### Requirement: Database and migrations
The server SHALL open the SQLite database at `DATABASE_PATH` (default `./data/rues-cooking-hub.db`) with
`node:sqlite`, create its directory if missing, enable WAL and foreign keys, and apply the numbered
`migrations/NNNN_*.sql` files of its package in order on start, each in its own transaction, recording each applied
name in `schema_migrations`. A failing migration SHALL be rolled back and stop the server with a non-zero exit code
and an error naming the migration.

#### Scenario: Fresh database gets the schema and starter tags
- **WHEN** the server starts on a database file that does not exist
- **THEN** every migration is applied and the tags are Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad and Baking
- **proof:** unit

#### Scenario: Only new migrations run on an existing database
- **WHEN** the server starts on a database where the first migration is already recorded and a second one is new
- **THEN** only the second migration runs and both are recorded once
- **proof:** unit

#### Scenario: Failing migration stops the server
- **WHEN** the built server starts on a database where a migration cannot apply (its table already exists)
- **THEN** the process exits non-zero, the error names the migration, and `schema_migrations` does not record it
- **proof:** unit

#### Scenario: Missing database directory is created
- **WHEN** `DATABASE_PATH` points into a directory that does not exist
- **THEN** the directory and the database file are created and migrations are applied
- **proof:** unit

### Requirement: Health check
`GET /healthz` SHALL return 200 with body `ok` when the database answers `SELECT 1`, and 503 otherwise.

#### Scenario: Healthy server answers 200
- **WHEN** `GET /healthz` is requested on a running server with a working database
- **THEN** the response status is 200 and the body is `ok`
- **proof:** e2e

#### Scenario: Unreadable database answers 503
- **WHEN** the database cannot be queried
- **THEN** `GET /healthz` returns 503
- **proof:** unit

### Requirement: Server runtime configuration
The production server SHALL read `PORT`, `HOST`, `DATABASE_PATH`, `PROTOCOL_HEADER` and `BODY_SIZE_LIMIT`, find its
`migrations/` relative to its own package (not the working directory), and `package.json` SHALL declare
`engines.node >=22.18`.

#### Scenario: Server starts from any working directory
- **WHEN** the built server is started with a working directory other than the package root
- **THEN** it applies the migrations and `GET /healthz` returns 200
- **proof:** unit

#### Scenario: Form posts pass the CSRF check behind the proxy header
- **WHEN** a form action is posted over plain http with `x-forwarded-proto: http` and `PROTOCOL_HEADER=x-forwarded-proto`
- **THEN** the action runs instead of Kit answering 403
- **proof:** e2e ("Scenario: Recipe created from scratch")

