# Rues Cooking Hub

Recipe archive, weekly meal plan and shopping list for one household. SvelteKit 3 + Vite + TypeScript, adapter-node, npm, SQLite (`node:sqlite`).
Kit config lives in `vite.config.ts` (`sveltekit({ ... })`); Kit 3 refuses a `svelte.config.js`. `$lib` is gone: import
through `#lib/...` (package.json `imports`) with the explicit `.ts` extension.

## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- package: `npm run package` → `dist/rues-cooking-hub-<version>.tgz` + `.sha256` (build, migrations, package.json, lockfile)
- ship: merge
- release: tag

`proof` = svelte-check (`--fail-on-warnings`), build, vitest. `proof:full` adds Playwright (projects `phone` 390×844
touch, `desktop` 1280×800, `workers: 1`) against `node build` on `$PORT` (default 4173) with
`DATABASE_PATH=.e2e/$PORT.db`, removed before each run, and `COOKING_HUB_TEST=1` so the `/__test/*` routes answer.
With `E2E_APP_DIR` set (CI: the unpacked tarball) it serves that dir's build instead. Every e2e test that touches data
starts with the reset helper and seeds what it needs, and waits for `html[data-hydrated]` before interacting.
The server runs behind a proxy: without `PROTOCOL_HEADER` (or `ORIGIN`) Kit's CSRF check rejects form posts and
DELETEs over plain http; e2e sends `x-forwarded-proto: http` for that reason, and `BODY_SIZE_LIMIT=16M` lets photo
uploads through. Unit tests live next to the code as `src/**/*.test.ts` (plus `scripts/*.test.ts`); `scripts/server.test.ts`
spawns the built server, so `build/` must exist (`proof` builds before it tests). An e2e test that sets its own
viewport or only uses `request` runs in one project (`test.skip(info.project.name !== …)`); everything else runs in both.

## Specs
- Before changing archive, read openspec/specs/archive/spec.md.
- Before changing design-system, read openspec/specs/design-system/spec.md.
- Before changing harness, read openspec/specs/harness/spec.md.
- Before changing home, read openspec/specs/home/spec.md.
- Before changing ingredients, read openspec/specs/ingredients/spec.md.
- Before changing meal-plan, read openspec/specs/meal-plan/spec.md.
- Before changing navigation, read openspec/specs/navigation/spec.md.
- Before changing recipe-detail, read openspec/specs/recipe-detail/spec.md.
- Before changing recipe-import, read openspec/specs/recipe-import/spec.md.
- Before changing recipes, read openspec/specs/recipes/spec.md.
- Before changing release, read openspec/specs/release/spec.md.
- Before changing runtime, read openspec/specs/runtime/spec.md.
- Before changing shopping-list, read openspec/specs/shopping-list/spec.md.
- Before changing tags, read openspec/specs/tags/spec.md.

## Learnings
- **Svelte outro transitions on menus/forms/sheets** → set `aria-hidden` on `outrostart` (Svelte only sets `inert`) and run a new e2e file with `--repeat-each` before committing. (weil: plan-entries "Edit and delete an entry" failed 6/10 on phone from a strict-mode duplicate Save during a 160 ms outro) [2026-10-20 · build-cooking-hub]
