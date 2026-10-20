# Rues Cooking Hub

Recipe archive, weekly meal plan and shopping list, self-hosted, for desktop and phone.

## Setup

Requires Node.js ≥ 22.18 (`node:sqlite` without a flag).

```sh
npm install
npx playwright install chromium   # once, for e2e
npm run dev                       # http://localhost:5173
```

## Checks

```sh
npm run proof        # typecheck, build, unit tests
npm run proof:full   # proof + Playwright e2e on phone and desktop viewports
```

`proof:full` serves the production build on `$PORT` (default 4173) with a throwaway database at
`.e2e/$PORT.db`, so several runs on different ports don't interfere.

## Configuration

The production server (`node build`) reads these environment variables:

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | port to listen on |
| `HOST` | `0.0.0.0` | address to bind |
| `DATABASE_PATH` | `./data/rues-cooking-hub.db` | SQLite file; its directory is created, migrations apply on start |
| `PROTOCOL_HEADER` | unset | proxy header carrying the scheme, e.g. `x-forwarded-proto`; needed behind plain-http nginx for form posts |
| `BODY_SIZE_LIMIT` | `512K` | largest request body; set `16M` so recipe photos upload |

`GET /healthz` answers `ok` (200) while the database responds, 503 otherwise.

## Release

Merging to `main` builds and tests the tarball once (`ci`); tagging `v<version>` publishes that tarball as a GitHub
release and opens the pin bump in Homelab-Managment. How to cut a release and the outward steps of the first one:
[docs/release.md](docs/release.md).
