# Research: model repos Life-Manager (LM) + Rues-Arcade (RA) (explorer, 2026-10-19)

## Stack
- SvelteKit ^3, vite ^8.3, svelte ^5.57, vitest ^5, TS ^6, adapter-node ^6, @playwright/test ^1.64, ESM, npm + package-lock.json.
- Kit 3: no svelte.config.js; `vite.config.ts` = `defineConfig` from 'vitest/config', `plugins: [sveltekit({ adapter: adapter() })]`, `test.include`. tsconfig extends `$app/tsconfig`, strict.
- Use RA's `#lib` convention: package.json `"imports": {"#lib":"./src/lib","#lib/*":"./src/lib/*"}`, imports with explicit `.ts`. RA `check` uses `--fail-on-warnings`.
- Styling: plain CSS + tokens (LM: src/lib/styles/tokens.css, no raw colours outside tokens; RA: src/lib/ui/tokens.ts + tokens.test.ts, self-hosted woff2 in static/fonts). No UI lib, no Tailwind.
- Motion: no library; Svelte `crossfade`, `flip`, `cubicOut` + WAAPI wrapped in src/lib/motion.ts with `reducedMotion()`.

## Data
- `node:sqlite` (`DatabaseSync`), no ORM, WAL + foreign_keys. Engines node >=22.18 (RA).
- Migrations: RA numbered `migrations/NNNN_*.sql` + `schema_migrations` table, `loadMigrations()` finds package.json from import.meta.url, transactional, failure exits non-zero (must be copied into the tarball). LM: SQL array in schema.ts + `PRAGMA user_version`.
- `DATABASE_PATH` default ./data/<app>.db, dir auto-created; lazy `getDb()` opened in `init` in hooks.server.ts.
- `GET /healthz`: RA returns 503 on DB error.
- Neither app has uploads/images — new for Cooking Hub.

## Auth
- None. Single user, LAN/VPN only (LM README).

## Harness (both CLAUDE.md)
- proof `npm run proof` (check + build + test:unit), proof-full `npm run proof:full` (+ `playwright test --reporter=list`), run `npm run dev` → :5173, package `npm run package` → dist/<app>-<version>.tgz + .sha256, ship: merge; RA also `release: tag`.
- playwright.config.ts: `PORT ?? 4173`, db `.e2e/${port}.db`, webServer `mkdir -p .e2e && rm -f '<db>'* && node build`, `cwd: process.env.E2E_APP_DIR`, env PORT/PROTOCOL_HEADER/DATABASE_PATH, `extraHTTPHeaders: {'x-forwarded-proto':'http'}` (else Kit CSRF 403s form posts).
- RA projects phone (390x844, touch) + desktop (1280x800) (~9 min suite); LM `workers: 1`, test routes `/__test/{reset,seed,clock}` gated by `LM_TEST=1`, e2e waits for `html[data-hydrated]`.
- .gitignore: `.e2e/`, `test-results/`, `dist`, `build`, `*.db*`.

## CI (identical in both)
- ci.yml: PR + push to main, `contents: read`, concurrency `ci-${{pr number || sha}}` cancel PRs only. Job `ci` calls `./.github/workflows/gate.yml` (runner ubuntu-24.04 on push, `["self-hosted","homelab-check"]` on PRs). Job `security-baseline` → `Rue-Asha/ci/.github/workflows/security-baseline.yml@7b49f3dcf37c61aea3722e68917bc06db507f386 # v1.1.0`.
- gate.yml pins: checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (v7.0.1, persist-credentials false), setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (v7.1.0, node 22, no cache), upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 (v7.0.2). Steps: npm ci → playwright install chromium → check → package → test:unit → sha256sum -c → unpack, E2E_APP_DIR → test:e2e → upload `release-tarball`. Built once; required check `ci / ci`.
- dependabot weekly github-actions + npm; LM ignores typescript semver-major.
- Rulesets: LM = no deletion, no non-ff, required checks `ci / ci` + `security-baseline / {workflow-lint,secret-scan,dependency-review}`, no PR rule. RA (id 24514889) = deletion, non-ff, pull_request (0 approvals), no required checks.

## Release
- release.yml on tags `v*`: `check-tag` (tag == v+package.json version, waits for the ci.yml push run on the sha, artifact not expired) → `publish` (download release-tarball, verify checksum, attest-build-provenance, `gh release create --generate-notes`, no rebuild) → `bump` (`Rue-Asha/ci/.github/workflows/bump-pin.yml@7b49f3d… # v1.1.0`, app, `host_vars_path: ansible/inventory/host_vars/<app>01/vars.yml`, `variable: <app>_version`, tag; secrets HOMELAB_BUMP_APP_ID/KEY).
- Version bumped by hand in package.json + lock (`npm install --package-lock-only`), tag after merge. RA: scripts/version.test.ts ("Scenario: Package and lockfile carry X") + openspec `release` spec.
- scripts/package.mjs: rm dist → copy build/, package.json, lock (+ migrations/) → `npm ci --omit=dev --ignore-scripts` in staging → tar `<app>-<version>/` → .sha256. RA scripts/package.test.ts.

## Hidden complexity
- Node 22 pin must match Homelab `nodejs_version` (comment "Keep in step with Homelab-Managment nodejs_version").
- Tag after 90 days → artifact expired, `gh run rerun`.
- `x-forwarded-proto` needed in prod nginx, e2e and any test server.
- First commit has no CI; `bump` job + pin file need the Homelab change first or in step.
- Unknown: whether HOMELAB_BUMP_* secrets exist per repo; Rue-Asha/ci contents.
