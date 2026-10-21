Before Build: the orchestrator creates the one empty bootstrap commit on `main` (`git commit --allow-empty -m
"chore: bootstrap"`, local only), then `git switch -c flow/build-cooking-hub` and commits the plan (design.md → Git
root). Nothing is pushed before Ship.

Every behaviour task writes its scenario tests first, named "Scenario: <title>" as in the specs, from the THEN
clauses, and watches them fail for the right reason before writing the code. UI work follows design.md → Visual
brief and the approved mockups (`/__mockups/*`, unit 4). Shared shapes are in design.md → Contracts; a unit that
needs a new e2e helper adds it in its own test file, never in `e2e/helpers.ts`. Outward steps (repo, secrets,
ruleset, push, PR, merge, tag, Homelab) are not tasks: they are the runbook in `docs/release.md` (unit 3), run at Ship
on Rue's go.

**Taste stop:** no unit that builds feature UI (10–19) starts before task 4.6 is checked.

## 1. Establish the harness and app foundation

> unit: depends=none · scope=S1,S2 · files=package.json, package-lock.json, vite.config.ts, tsconfig.json, playwright.config.ts, .gitignore, src/app.html, src/app.d.ts, src/hooks.server.ts, src/routes/+layout.svelte, src/routes/(app)/+page.svelte, src/routes/healthz/+server.ts, src/routes/healthz/healthz.test.ts, src/lib/server/db.ts, src/lib/server/db.test.ts, src/lib/server/test-flag.ts, migrations/0001_tags.sql, scripts/package.mjs, scripts/package.test.ts, scripts/server.test.ts, e2e/smoke.test.ts, e2e/healthz.test.ts, CLAUDE.md, README.md

- [x] 1.1 Scaffold Kit 3 from Rues-Arcade (`npm ls @sveltejs/kit` after install must say 3.x): `package.json` with `"name": "rues-cooking-hub"`, `"version": "0.0.0"`, `private`, `type: module`, `engines.node >=22.18`, `imports` `#lib`/`#lib/*`, scripts `dev`, `build`, `preview`, `prepare`, `check` (`--fail-on-warnings`), `test:unit` (vitest `--reporter=verbose`), `test:e2e` (playwright `--reporter=list`), `proof`, `proof:full`, `package` (`npm run build && node scripts/package.mjs`); `vite.config.ts` (no svelte.config.js, `test.include` src + scripts), `tsconfig.json` extending `$app/tsconfig`; `.gitignore` from Rues-Arcade plus `data/`; `src/app.html` (`lang="en"`, title "Rues Cooking Hub"), `app.d.ts`, root `+layout.svelte` setting `document.documentElement.dataset.hydrated` on mount, placeholder `src/routes/(app)/+page.svelte` (an empty `<main>`); `npm install`, `npx playwright install chromium`
- [x] 1.2 `db.ts` copied from Rues-Arcade (`openDb` with WAL + foreign keys, `loadMigrations()` from the package root, transactional `migrate()` naming the failing migration, `getDb()` on `DATABASE_PATH` default `./data/rues-cooking-hub.db`, `closeDb()`) and `migrations/0001_tags.sql` (design.md → Schema) (Scenario: Fresh database gets the schema and starter tags · Only new migrations run on an existing database · Missing database directory is created)
- [x] 1.3 `hooks.server.ts` `init` opens the DB so a failing migration stops the server; `GET /healthz` 200 `ok` / 503; `src/lib/server/test-flag.ts` (`testFlag`, `requireTestFlag`, design.md → Shared helpers) (Scenario: Healthy server answers 200 · Unreadable database answers 503)
- [x] 1.4 `playwright.config.ts` from Rues-Arcade (projects `phone` 390×844 touch/mobile and `desktop` 1280×800, `.e2e/$PORT.db` removed before start, `E2E_APP_DIR`, `x-forwarded-proto`) plus `workers: 1` and env `COOKING_HUB_TEST=1`, `BODY_SIZE_LIMIT=16M`; `e2e/smoke.test.ts` opens `/` and waits for `html[data-hydrated]`; `scripts/server.test.ts` spawns the built server (it needs `build/`, which `proof` builds first) (Scenario: Failing migration stops the server · Server starts from any working directory)
- [x] 1.5 `scripts/package.mjs` + `scripts/package.test.ts` from Rues-Arcade with the name `rues-cooking-hub` (Scenario: Package produces a verifiable tarball)
- [x] 1.6 `CLAUDE.md`: one-line description, the Kit 3 note, `## Harness` with proof `npm run proof`, proof-full `npm run proof:full`, run `npm run dev` → http://localhost:5173, package `npm run package` → `dist/rues-cooking-hub-<version>.tgz` + `.sha256`, `ship: merge`, `release: tag`, and Rues-Arcade's harness paragraph adapted (workers 1, reset per test, test flag); README setup, checks and env vars (`PORT`, `HOST`, `DATABASE_PATH`, `PROTOCOL_HEADER`, `BODY_SIZE_LIMIT`). Run `proof:full` green, and once with a deliberately failing test to see both commands exit non-zero, then revert (Scenario: Proof prints test names and passes · Proof fails on a failing check · Proof-full runs e2e on an isolated database · Each e2e test runs on phone and desktop · Harness declared with merge and tag policy)

## 2. Data contract, test routes and e2e helpers

> unit: depends=1 · scope=none · files=src/lib/types.ts, src/lib/copy.ts, src/lib/errors.ts, src/lib/text.ts, src/lib/text.test.ts, src/lib/dates.ts, src/lib/dates.test.ts, src/lib/server/clock.ts, src/lib/server/clock.test.ts, src/lib/server/db.ts, src/lib/server/schema.test.ts, migrations/0002_core.sql, src/lib/ingredients/parse.ts, src/lib/shopping/aggregate.ts, src/lib/server/recipes.ts, src/lib/server/tags.ts, src/lib/server/images.ts, src/lib/server/import.ts, src/lib/server/plan.ts, src/lib/server/shopping.ts, src/lib/server/home.ts, src/routes/__test/reset/+server.ts, src/routes/__test/seed/+server.ts, src/routes/__test/clock/+server.ts, src/routes/__test/test-routes.test.ts, src/routes/(app)/recipes/+page.svelte, src/routes/(app)/plan/+page.svelte, src/routes/(app)/list/+page.svelte, e2e/helpers.ts, e2e/test-routes.test.ts

- [x] 2.1 `types.ts`, `copy.ts`, `errors.ts` exactly as design.md → Contracts; real `fold()` and `dates.ts` with freely named unit tests (umlauts, week start on a Sunday and across a year end); `clock.ts` (Scenario: Test clock sets today)
- [x] 2.2 `migrations/0002_core.sql` per design.md → Schema, with a freely named `schema.test.ts` that the tables and CHECKs exist (a plan entry with both recipe and text is refused)
- [x] 2.3 Stubs with the final signatures for `parse.ts`, `aggregate.ts`, `recipes.ts`, `tags.ts`, `images.ts`, `import.ts`, `plan.ts`, `shopping.ts`, `home.ts` (throw `not implemented`, except `parseIngredient` and `refreshSearchText` as design.md says); placeholder pages for `/recipes`, `/plan`, `/list` (empty `<main>`); `proof` green
- [x] 2.4 `resetDb()` in `db.ts` (delete all rows, restore exactly the starter tags), test routes `reset`, `seed` (SQL inserts per design.md → E2E helpers, `parseIngredient` + `refreshSearchText`, `image: true` = a small constant image), `clock`, each behind `requireTestFlag()`; `e2e/helpers.ts` (`reset`, `seed`, `setToday`, `open`, `calm`) (Scenario: Test routes answer 404 without the test flag · Reset leaves an empty archive with the starter tags · Seed returns the ids of what it inserted · App is hydrated before tests interact)

## 3. CI, release workflow and the Ship runbook

> unit: depends=1 · scope=S3,S4 · files=.github/workflows/ci.yml, .github/workflows/gate.yml, .github/workflows/release.yml, .github/dependabot.yml, docs/release.md, README.md

- [x] 3.1 `ci.yml` and `gate.yml` copied from Rues-Arcade with its SHA pins unchanged (checkout v7.0.1 with `persist-credentials: false`, setup-node v7.1.0 Node 22 without cache, upload-artifact v7.0.2, security-baseline `@7b49f3dcf37c61aea3722e68917bc06db507f386 # v1.1.0`), PRs on `["self-hosted","homelab-check"]`, pushes on `ubuntu-24.04`, the Node pin commented "Keep in step with Homelab-Managment nodejs_version"; `actionlint` if available locally (Scenario: CI is green on the change's PR · Push to main runs on a GitHub-hosted runner · Superseded PR run is cancelled · E2E runs against the unpacked tarball — proven on GitHub)
- [x] 3.2 `dependabot.yml`: github-actions + npm weekly, `typescript` semver-major ignored as in Life-Manager (Scenario: Dependabot config covers actions and npm)
- [x] 3.3 `release.yml` copied from Rues-Arcade with `app: rues-cooking-hub`, `host_vars_path: ansible/inventory/host_vars/rues-cooking-hub01/vars.yml`, `variable: rues_cooking_hub_version` (Scenario: Tag does not match the version · Release publishes the tested tarball · First release bump fails while publish succeeds — proven on GitHub)
- [x] 3.4 `docs/release.md`: how to cut a release, then the Ship runbook in order, every step marked ⚠ with its exact command: create `Rue-Asha/Rues-Cooking-Hub` (public) and push the local bootstrap `main`; Homelab chore registering the repo in `check_runner_repos` + `check_runner.yml` (before the PR); secrets `HOMELAB_BUMP_APP_ID` / `HOMELAB_BUMP_APP_KEY`; the `main` ruleset from Life-Manager's (required `ci / ci` + `security-baseline / {workflow-lint,secret-scan,dependency-review}`, no deletion, no non-fast-forward); push `flow/build-cooking-hub`, PR, merge; tag `v0.1.0` (bump job expected red, R4); the Homelab service change after the tag (LXC `rues-cooking-hub01`, role, playbook, host_vars pin v0.1.0, nginx `client_max_body_size 16m`, env `BODY_SIZE_LIMIT=16M`, `sqlite_backups` for `/var/lib/rues-cooking-hub/rues-cooking-hub.db`, deploy.yml option, then `sqlite_backup.yml` by hand). README "Release" section links it (Scenario: Runbook lists the outward steps)

## 4. Design system and mockups (taste stop)

> unit: depends=1 · scope=S5,S6 · files=src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/tokens.test.ts, src/lib/styles/global.css, src/app.html, src/routes/+layout.svelte, static/fonts/*, static/mockups/*, src/lib/ui/*.svelte, src/lib/motion.ts, src/lib/motion.test.ts, src/lib/mockups/fixtures.ts, src/lib/mockups/credits.test.ts, src/routes/__mockups/+layout.server.ts, src/routes/__mockups/+layout.svelte, src/routes/__mockups/mockups-guard.test.ts, src/routes/__mockups/*/+page.svelte, e2e/design.test.ts, e2e/mockups.test.ts, package.json

Inputs: design.md → Visual brief, all five images in `/home/Rue/Pictures/UI-inspo/`, research-mobbin.md. Any further UI
research uses the Mobbin MCP (`mcp__mobbin__*`) in a subagent, citing screens by URL. This unit runs in parallel with
unit 2, so its e2e files use their own `goto` + `html[data-hydrated]` wait instead of `e2e/helpers.ts`.

- [x] 4.1 Tokens in `tokens.css` + `tokens.ts` from the palette (names as in the brief), `global.css` (light only, `color-scheme: light`, base type, focus ring); `tokens.test.ts` lists every text/background pair used (Scenario: Text contrast meets 4.5:1 · Glass panel text stays legible over any photo)
- [x] 4.2 Fonts: try the shortlist on one specimen screen, pick one serif display and one sans text face, `npm pack @fontsource/<name>` (no dependency kept), copy the latin woff2 weights used plus the OFL into `static/fonts/`, `@font-face` in `global.css`, preload in `app.html`; root `+layout.svelte` imports `global.css`
- [x] 4.3 Components in `src/lib/ui/` (GlassPanel, PillNav, ArrowButton, RoundNav, Card, Chip, Button, Kicker, Counter, Tile, ImagePlaceholder) and `motion.ts` with the full API in design.md → Contracts (Scenario: Reduced motion makes transitions instant · Motion animates only transform and opacity)
- [x] 4.4 Mockups at `/__mockups/{home,recipes,recipe,import,import-fallback,plan,list}` from `fixtures.ts`, phone and desktop layouts per the brief (desktop uses the width), one alignment rule, guarded by `requireTestFlag()` in `+layout.server.ts`; ~8 free-licence food photos downloaded once into `static/mockups/` (the only web download allowed in this unit), each listed with source URL, author and licence in `static/mockups/CREDITS.txt`, checked by `src/lib/mockups/credits.test.ts`; `e2e/design.test.ts` over every mockup (Scenario: Every mockup photo is credited · Mockup routes are hidden without the test flag · Pages load no external resources · Display and text fonts load from the app · Dark colour scheme preference changes nothing · Controls are at least 44px on phone · Main screens share one alignment rule)
- [x] 4.5 Script `shots:mockups` (`npm run build && playwright test e2e/mockups.test.ts --reporter=list`) writing `test-results/shots/mockups/<project>-<screen>.png` after fonts and animations settle; look at every shot at both sizes yourself and fix what the brief would reject before reporting; report the 14 paths (Scenario: Mockup screenshots are produced for both viewports)
- [x] 4.6 Rue approved the mockups — checked by the orchestrator after Rue's approval; revision rounds run on this unit's branch until then (Scenario: Rue approves the mockups · Requested changes revise the mockups · Components match the visual brief)

## 5. Ingredient parser and list aggregation

> unit: depends=2 · scope=S10,S28,S29 · files=src/lib/ingredients/parse.ts, src/lib/ingredients/parse.test.ts, src/lib/shopping/aggregate.ts, src/lib/shopping/aggregate.test.ts

- [x] 5.1 Quantities: integers, decimals with point or comma (Gate 1 addition a), `1/2`, `1 1/2`, `½`, `1½`, ranges `2-3`/`2–3` → upper bound (Scenario: Integer quantity with unit · Decimal quantity · Comma decimal · Mixed and unicode fractions · Range uses the upper bound)
- [x] 5.2 Units from the unit table (attached, canonical, trailing `.`), trailing `, note`, no-quantity and unparseable lines (Scenario: Attached unit · Trailing note is split off · Count without unit · Line without quantity · Unparseable line becomes the name)
- [x] 5.3 `nameKey` (design.md → Name keys, Gate 1 addition c), `aggregate`, `mergeAmounts`, `formatAmounts`: scaling by factor, merge by `nameKey` with the longest name shown, equal units sum, g/kg and ml/l families (display from 1000), other units side by side, quantity-less lines once without amount (Scenario: Ingredients scale by entry servings · Equal names and units merge · Metric family amounts sum · Mixed units stay on one line · Singular and plural names fold to one line · Line without quantity appears once without amount)
- [x] 5.4 `parseAmounts` (`200 g`, `1 cup + 200 g`, empty → `[]`, unreadable → null) with freely named unit tests

## 6. Recipe store, tags, search and sort

> unit: depends=2 · scope=S9,S11,S13,S14,S16,S17,S18,S19,S20,S21 · files=src/lib/server/recipes.ts, src/lib/server/recipes.test.ts, src/lib/server/tags.ts, src/lib/server/tags.test.ts, src/lib/server/archive.test.ts

Unit 5 runs in parallel, so `parseIngredient` is still the stub here: compare stored parses against
`parseIngredient(line)`, never against hard-coded quantities.

- [x] 6.1 `createRecipe`/`updateRecipe`/`getRecipe`: validation with `COPY` messages, parse on save, empty sections dropped, tags via `ensureTags`, `refreshSearchText` (Scenario: Recipe saved with all fields · Server rejects invalid recipe input · Empty section is dropped on save)
- [x] 6.2 `deleteRecipe` (convert plan entries to free text with the title in one transaction, delete the image row), `planUsage`, image replacement and removal on update (Gate 1 addition f) (Scenario: Deleted recipe's plan entries become free text · Deleting a recipe leaves the shopping list unchanged · Replacing the image removes the old blob · Removing the image deletes its blob)
- [x] 6.3 `tags.ts`: `listTags` with counts, `ensureTags` by `fold`, `renameTag` merging onto an existing name (Gate 1 addition e: recipes move to the existing tag without duplicates, the renamed tag is deleted, search text refreshed), `deleteTag` refreshing the affected recipes' search text (Scenario: Duplicate tag name reuses the existing tag · Renaming onto an existing name merges the tags · Deleted tag is removed from its recipes)
- [x] 6.4 `listRecipes` (search via `search_text`, tag AND, favourites, sort newest/title via `localeCompare` with `sensitivity: 'base'`/time with nulls last), `featuredRecipes`, `findBySourceUrl`, `setFavourite` (Scenario: Search covers title, description, ingredients and tags · Search ignores case for umlauts · Empty search returns all recipes · Search combines with the tag filter · Tag filter requires all tags on the server · Newest first by default · Sort by title · Sort by total time puts recipes without time last · Featured query returns the seven newest recipes)

## 7. Import reader with saved fixtures

> unit: depends=2 · scope=S12 · files=src/lib/server/import.ts, src/lib/server/import.test.ts, fixtures/import/*.html, fixtures/import/expected.json

This builder may fetch 3+ real recipe pages **once** to save them as fixtures (the only network access in the build);
tests never hit the network (local `node:http` servers in the test for fetch behaviour).

- [x] 7.1 Save 3+ real recipe pages from different sites with different JSON-LD shapes (one `@graph`, one with `HowToSection`, one plain), trimmed to `<title>`, meta tags and the `ld+json` scripts; `expected.json` records each page's source URL, fetch date, title, ingredient and step counts, servings, prep and cook minutes
- [x] 7.2 `extractRecipe`: JSON-LD discovery (arrays, `@graph`, `@type` arrays, invalid JSON skipped), field mapping, `HowToSection`/`HowToStep`/strings, entities and tags stripped, `recipeCategory`/`keywords` → `tagNames` (Gate 1 addition d), `parseDuration`, `parseYield`, image forms and relative URLs (Scenario: Recipe is read from saved real pages · Recipe found inside @graph · HowToSection becomes step sections · ISO 8601 durations become minutes · recipeYield becomes servings · Categories and keywords become tag names · Relative image URL is resolved)
- [x] 7.3 `normaliseUrl`, `extractMeta`, `readRecipe` (timeout, 5 MB cut, status errors → fallback) (Scenario: Page without Recipe data falls back to meta tags · Unreachable page is a fallback · Blocked page is a fallback · Slow page times out · Oversized page is a fallback · Only http and https URLs are fetched)

## 8. Image storage

> unit: depends=2 · scope=S13 · files=package.json, package-lock.json, src/lib/server/images.ts, src/lib/server/images.test.ts, src/routes/images/[id]/+server.ts, e2e/images.test.ts

- [x] 8.1 `npm i sharp` (in `dependencies`, design.md → Images); `storeImage` with the WebP downscale loop, `not-image` and `too-large` (Scenario: Uploaded image is stored downscaled · Non-image file is rejected by the server)
- [x] 8.2 `storeImageFromUrl` (fetch with timeout, status/type errors → `download`/`not-image`), `getImage` (Scenario: Image from a URL is stored)
- [x] 8.3 `GET /images/[id]` with the cache header, 404 for unknown ids; run `npm run package` and check the tarball holds `node_modules/@img/sharp-linux-x64` (Scenario: Image is served with caching headers · Package produces a verifiable tarball)

## 9. Plan and shopping list server

> unit: depends=5,6 · scope=S23,S24,S25,S26,S27,S28,S29,S30,S31 · files=src/lib/server/plan.ts, src/lib/server/plan.test.ts, src/lib/server/shopping.ts, src/lib/server/shopping.test.ts

- [x] 9.1 `weekEntries`, `entriesInRange`, `addEntry` (append, validation), `updateEntry`, `deleteEntry` (Scenario: Week query returns entries in day, slot and position order · Empty free text is rejected · Servings below 1 are rejected in the plan · Entry servings and text can be edited)
- [x] 9.2 `moveEntry` (renumber source and target slots) and `copyWeek` (Scenario: Moving an entry reorders the slot · Copy week appends after existing entries · Copy from an empty week changes nothing)
- [x] 9.3 `listItems` (`amounts` derived from both parts), `addManual` (parse, merge into an open manual item by `nameKey`), `updateItem`, `deleteItem`, `setChecked`, `clearChecked`, `setCategory` + `category_memory` keyed by `nameKey` (Scenario: Manual item is parsed · Empty input adds nothing · Same manual name merges amounts · New item uses the remembered category · Unknown item goes to Other · Category memory ignores case · Clear checked removes all checked items)
- [x] 9.4 `addFromPlan` in one transaction per design.md → Shopping amounts (Gate 1 addition g) (Scenario: Add from plan adds scaled, merged items · Free-text entries contribute nothing · Regenerating replaces open plan items · Manual and checked items survive regenerating · Checked plan item is not re-added · Empty range changes nothing · Plan amounts merge into a manual item with the same name · Regenerating recalculates the plan part of a manual item)

## 10. App shell: navigation and page transitions

> unit: depends=2,4 · scope=S7,S8 · files=src/routes/(app)/+layout.svelte, src/lib/shell/AppNav.svelte, src/lib/nav.ts, src/lib/nav.test.ts, e2e/nav.test.ts, e2e/transitions.test.ts

Feature UI: needs 4.6 checked. Long-page checks append a tall block to `main` in the test (the areas are still placeholders).

- [x] 10.1 `(app)/+layout.svelte` with `AppNav` from `PillNav`: top glass pill nav from 1024 px, bottom tab bar below, `activeArea()`, content padded clear of the bar (Scenario: Active area is marked · Nav marks the open area · Desktop shows the top pill nav · Phone shows the bottom tab bar · Tablet and phone landscape use one layout without overlap)
- [x] 10.2 Shrink on scroll via `data-compact` past 48 px (Scenario: Nav shrinks on scroll; manual: Nav shrink looks calm)
- [x] 10.3 `onNavigate` → `motion.viewTransition` for area changes (Scenario: Area change uses a view transition · Browser without View Transitions navigates instantly · Reduced motion skips the page transition; manual: Page transition looks calm)

## 11. Recipe form, images and editing

> unit: depends=4,5,6,8 · scope=S9,S10,S11,S13,S14,S17 · files=src/lib/recipes/RecipeForm.svelte, src/lib/recipes/SectionsEditor.svelte, src/lib/recipes/TagInput.svelte, src/lib/recipes/ImageField.svelte, src/lib/recipes/save.ts, src/lib/recipes/save.test.ts, src/lib/recipes/unsaved.ts, src/routes/(app)/recipes/new/form/+page.svelte, src/routes/(app)/recipes/new/form/+page.server.ts, src/routes/(app)/recipes/[id]/edit/+page.svelte, src/routes/(app)/recipes/[id]/edit/+page.server.ts, e2e/recipe-form.test.ts, e2e/recipe-edit.test.ts, e2e/recipe-image.test.ts

Feature UI: needs 4.6 checked. The recipe page arrives in unit 15: after Save assert the URL `/recipes/<id>` and verify
through the edit page.

- [x] 11.1 `RecipeForm` (props per design.md → Contracts), `save.ts` (`saveFromForm`), `/recipes/new/form` (Scenario: Recipe created from scratch, which also proves Form posts pass the CSRF check behind the proxy header · New recipe defaults to 2 servings · Empty title blocks saving the form · Servings below 1 are rejected in the form)
- [x] 11.2 `SectionsEditor` for ingredients and steps (add/remove sections and lines, optional titles) with the live parse preview (Scenario: Parse preview updates while typing)
- [x] 11.3 `TagInput` with suggestions from `listTags`, prefilled from `draft.tagNames` (used by the import preview), new names created on save (Scenario: New tag created while editing a recipe)
- [x] 11.4 `ImageField`: file or URL, "Remove image" (Gate 1 addition f), browser-side 15 MB check, server errors mapped to `COPY` (Scenario: Remove image shows the placeholder · Image upload from the form · Non-image file is rejected in the form · Oversize file is rejected in the form · Recipe saved without image when its image URL fails)
- [x] 11.5 `/recipes/[id]/edit` prefilled, Save updates; `unsaved.ts` guard with "Discard changes?" on in-app navigation and `beforeunload` (Scenario: Edit changes are saved · Leaving with unsaved changes asks first · Leaving without changes does not ask)

## 12. Archive grid, filters, search, sort and favourites

> unit: depends=4,6,8 · scope=S9,S15,S18,S19,S20,S21 · files=src/routes/(app)/recipes/+page.svelte, src/routes/(app)/recipes/+page.server.ts, src/routes/(app)/recipes/[id]/favourite/+server.ts, src/lib/recipes/RecipeCard.svelte, src/lib/recipes/FavouriteButton.svelte, src/lib/recipes/FilterBar.svelte, src/lib/recipes/query.ts, src/lib/recipes/query.test.ts, e2e/archive.test.ts, e2e/archive-filters.test.ts, e2e/archive-motion.test.ts

Feature UI: needs 4.6 checked.

- [x] 12.1 Grid of `RecipeCard`s (image or placeholder, clamps, total time, tags, `view-transition-name: heroName(id)` on the image unless reduced motion), "Add recipe" → `/recipes/new`, empty state (Scenario: Cards show image, title, description, time and tags · Empty archive invites the first recipe · Card without description shows title and meta · Long titles and descriptions are clamped · Card without image shows the placeholder · Recipe without times shows no time on its card)
- [x] 12.2 `query.ts` (URL ⇄ `ArchiveQuery`, freely named tests), chip row, Favourites toggle, live count, "No recipes match" + "Clear filters", history entries per change (Scenario: Several tags show recipes having all of them · Favourites-only toggle · No match offers to clear filters · Filter state survives reload and back)
- [x] 12.3 Search field (debounced, `replaceState`) and sort control (Scenario: Search from the archive · Search without match shows the empty state · Sort choice in the archive)
- [x] 12.4 `FavouriteButton` + `/recipes/[id]/favourite` endpoint (Scenario: Favourite toggles on a card; manual: Favourite toggle feels alive)
- [x] 12.5 Staggered entrance and `animate:flip` with `motion.ts` (Scenario: Cards enter staggered · Reduced motion shows cards without entrance animation · Filtered cards glide to new positions · Reduced motion filters without gliding; manual: Card entrance looks lively and calm · Filter gliding looks smooth)

## 13. Plan week view, entries and copy week

> unit: depends=4,8,9 · scope=S23,S24,S26,S27 · files=src/routes/(app)/plan/+page.svelte, src/routes/(app)/plan/+page.server.ts, src/lib/plan/Week.svelte, src/lib/plan/Slot.svelte, src/lib/plan/Entry.svelte, src/lib/plan/RecipeRail.svelte, src/lib/plan/RecipePicker.svelte, src/lib/plan/CopyWeek.svelte, e2e/plan.test.ts, e2e/plan-entries.test.ts, e2e/plan-copy.test.ts

Feature UI: needs 4.6 checked. The rail is rendered here (desktop) but not draggable yet (unit 18).

- [x] 13.1 Week from `?week=` (default from `today()`), Mon–Sun × four slots, `data-today`, previous/next/"This week", add affordances, phone stacked / desktop grid + rail (Scenario: Week shows Monday to Sunday with four slots · Today is highlighted · Previous, next and This week · Empty week shows add affordances · Phone stacks the days and desktop shows the grid)
- [x] 13.2 Add from a slot: `RecipePicker` with search and servings defaulting to the recipe's, or free text (Scenario: Add a recipe entry with the picker · Add a free-text entry · Empty free text shows an error)
- [x] 13.3 Entry menu: edit servings or text, delete (Scenario: Edit and delete an entry)
- [x] 13.4 `CopyWeek` dialog (source week default the previous one, confirm when the shown week has entries) (Scenario: Copy the previous week · Copy into a week with entries asks first · Nothing to copy)

## 14. Import flow

> unit: depends=7,11 · scope=S12 · files=src/routes/(app)/recipes/new/+page.svelte, src/routes/(app)/recipes/new/+page.server.ts, e2e/import.test.ts, e2e/fixture-server.ts, e2e/fixtures/import/*

Feature UI: needs 4.6 checked. `e2e/fixture-server.ts` starts a local `node:http` server inside the test that serves
the e2e fixture pages and a generated JPEG (and a 404 image path); the app server fetches from it.

- [x] 14.1 `/recipes/new`: URL field + "Import" + "Start from scratch" link, "Reading the page…", `normaliseUrl`, duplicate check via `findBySourceUrl` with "Import anyway" (Scenario: Invalid URL shows an inline error · Known URL offers the existing recipe)
- [x] 14.2 Preview = `RecipeForm` prefilled with the draft incl. its tag names, saved through `saveFromForm` (Scenario: Import shows an editable preview · Imported tags reuse existing tags · Image download failure saves without image)
- [x] 14.3 Fallback message above the prefilled form (Scenario: Import failure opens the prefilled manual form; manual: Importing a real recipe URL)

## 15. Recipe page

> unit: depends=4,6,8,9,12,13 · scope=S11,S14,S21,S22,S24 · files=package.json, package-lock.json, src/lib/markdown.ts, src/lib/markdown.test.ts, src/routes/(app)/recipes/[id]/+page.svelte, src/routes/(app)/recipes/[id]/+page.server.ts, src/lib/recipes/Hero.svelte, src/lib/recipes/AddToPlan.svelte, src/lib/recipes/DeleteRecipe.svelte, e2e/recipe-page.test.ts, e2e/recipe-motion.test.ts

Feature UI: needs 4.6 checked.

- [x] 15.1 `npm i -D markdown-it @types/markdown-it`; `markdown.ts` per design.md → Markdown (Scenario: Notes render Markdown · Unsafe link schemes stay text)
- [x] 15.2 Page: hero, glass info panel, sections, rendered steps and notes, `FavouriteButton`, 404 (Scenario: Recipe page shows hero, info panel, sections and notes · Recipe page without image shows the placeholder hero · Recipe page without source URL shows no source link · Recipe without times shows no times on its page · Unknown recipe answers 404 · Script in notes is not executed · Favourite toggles on the recipe page)
- [x] 15.3 Delete with the counted confirm, then the archive (Scenario: Delete names the plan entries that use the recipe · Recipe in no plan entry gets a plain confirm)
- [x] 15.4 "Add to plan" dialog (day default today, Dinner, recipe servings) (Scenario: Add to plan from the recipe · Servings below 1 are rejected when adding from the recipe)
- [x] 15.5 Parallax/zoom on scroll and the shared hero with `heroName(id)` (Scenario: Hero moves on scroll · Reduced motion keeps the hero still · Card and recipe page share the hero image · Reduced motion skips the shared element; manual: Hero parallax and shared element look smooth)

## 16. Shopping list page

> unit: depends=4,5,9 · scope=S28,S29,S30,S31 · files=src/routes/(app)/list/+page.svelte, src/routes/(app)/list/+page.server.ts, src/lib/list/Item.svelte, src/lib/list/AddFromPlan.svelte, src/lib/list/CategoryMenu.svelte, e2e/list.test.ts, e2e/list-plan.test.ts, e2e/list-check.test.ts

Feature UI: needs 4.6 checked.

- [x] 16.1 Grouped list, add field, edit (name + amount via `parseAmounts`; a manual item's plan part shown read-only as "From plan: …"), delete (Scenario: Merged item shows its manual and plan parts · Add a manual item · Edit an item's name and amount · Delete an item · List grouped by category with empty ones hidden)
- [x] 16.2 `CategoryMenu` (Scenario: Moving an item to a category remembers it)
- [x] 16.3 `AddFromPlan` dialog with the current week as default range (Scenario: Add from plan for the shown week · Empty range reports nothing planned)
- [x] 16.4 Check-off (fill, strike, slide into "Checked"), uncheck, "Clear checked" (Scenario: Check off moves the item to Checked · Uncheck restores the item · Clear checked is disabled with nothing checked · Reduced motion checks off without sliding; manual: Check-off animation feels satisfying)

## 17. Featured stack and tag manager

> unit: depends=6,12 · scope=S16,S17 · files=src/lib/recipes/FeaturedStack.svelte, src/lib/recipes/coverflow.ts, src/lib/recipes/coverflow.test.ts, src/routes/(app)/recipes/+page.svelte, src/routes/(app)/recipes/+page.server.ts, src/routes/(app)/recipes/tags/+page.svelte, src/routes/(app)/recipes/tags/+page.server.ts, e2e/featured.test.ts, e2e/tags.test.ts

Feature UI: needs 4.6 checked. Unit 12's archive tests must stay green (the stack is hidden on an empty archive).

- [x] 17.1 `FeaturedStack` in the archive header from `featuredRecipes()`: counter, arrows, keyboard, pointer swipe, depth from `coverflow.ts` (freely named unit tests for the index maths) (Scenario: Featured stack shows the seven newest · Featured with fewer than seven counts what exists · Single featured recipe has no arrows · Arrows and keyboard step through the stack · Swipe steps through the stack on phone · Featured stack ignores the filters; manual: Featured stack looks like a coverflow)
- [x] 17.2 `/recipes/tags` with counts, rename, delete with the counted confirm; "Manage tags" link from the archive (Scenario: Rename a tag · Rename onto an existing tag merges them in the manager · Deleting a tag in use names the count)

## 18. Plan drag & drop and "Move to…"

> unit: depends=13 · scope=S25 · files=src/lib/plan/Entry.svelte, src/lib/plan/Slot.svelte, src/lib/plan/RecipeRail.svelte, src/lib/plan/MoveTo.svelte, src/lib/plan/dnd.ts, src/routes/(app)/plan/+page.svelte, src/routes/(app)/plan/+page.server.ts, e2e/plan-move.test.ts

Feature UI: needs 4.6 checked. Unit 13's plan tests must stay green.

- [x] 18.1 "Move to…" in every entry's menu (day of the shown week + slot), keyboard reachable (Scenario: Move to moves an entry on phone · Move to is the keyboard alternative on desktop)
- [x] 18.2 Native DnD on desktop: rail → slot, entry → slot/day, drop on an entry inserts before it, `data-drop-target`, drop outside restores (Scenario: Drag a recipe from the rail onto a slot · Drag an entry to another day · Reorder entries within a slot · Drop target is highlighted · Drop outside a slot changes nothing)

## 19. Home dashboard and the end-to-end journey

> unit: depends=4,8,9,11,12,13,14,15,16 · scope=S32 · files=src/lib/server/home.ts, src/lib/server/home.test.ts, src/routes/(app)/+page.svelte, src/routes/(app)/+page.server.ts, src/lib/home/HeroTile.svelte, src/lib/home/WeekTile.svelte, src/lib/home/ListTile.svelte, src/lib/home/FavouriteTile.svelte, e2e/home.test.ts, e2e/journey.test.ts

Feature UI: needs 4.6 checked.

- [x] 19.1 `dashboard()` (Scenario: Dashboard prefers today's dinner · Dashboard falls back to the first recipe entry of today)
- [x] 19.2 Bento page per the approved Home mockup (Scenario: Hero shows today's planned recipe · Nothing planned today shows the newest recipe · Empty archive shows the welcome hero · This week tile lists the seven days · Shopping tile shows open count and first items · Empty list tile says List is empty · Favourite tile shows the most recently favourited recipe · No favourites invites to favourite; manual: Dashboard looks like the approved mockup)
- [x] 19.3 `e2e/journey.test.ts` through the real UI with `e2e/fixture-server.ts` (Scenario: Imported recipe reaches the list scaled and grouped)

## 20. Release 0.1.0

> unit: depends=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19 · scope=S4 · files=package.json, package-lock.json, scripts/version.test.ts

- [x] 20.1 ⚠ irreversible (published release after merge) Bump the version last, test first: write `scripts/version.test.ts` "Scenario: Package and lockfile carry 0.1.0" expecting `['0.1.0', '0.1.0', '0.1.0']` (package.json, lockfile root, `packages[""]`) and watch it fail on 0.0.0; then `npm version 0.1.0 --no-git-tag-version` (tabs kept) and rerun `npm run proof`. Tag `v0.1.0` is pushed by flow's shipper after the merge, not by the builder (Scenario: Package and lockfile carry 0.1.0; manual: Release v0.1.0 published)
