## Why

Rue cooks from the hub on the phone in the kitchen, ticks the list off on the phone in the shop, and plans the week and imports recipes on the desktop. Navigation is the biggest pain: on the phone the bottom bar has only the areas, so search and add need a detour; on the desktop the top bar is fine in structure but not in look. The UI also has to move onto the shared design fingerprint (Design-System 1.0.0). This change is gates 3–8 of the ecosystem pipeline for Rues Cooking Hub; gate 3 (`scope.md`) was signed off on 2026-11-15.

## What Changes

- **Fingerprint.** Vendor fingerprint 2.0.0 with `sync.sh`; `check-slop` and `check-drift` run in `proof`; accent rosemary (picked by Rue on 2026-11-16 at checkpoint A); the master icon `icons/Rues-Cooking-Hub/icon.svg`, a chef's hat (hat-b, picked 2026-11-16; replaces "A Splash").
- **Shell and navigation.** Desktop top bar keeps its structure (brand, the five area links with Eating Out last, Search recipes, Add recipe) on the fingerprint look (S1). **BREAKING (UI):** the phone tab bar is replaced by Home · Recipes · Plan · List · Spots pills plus a separate round "+" that acts for the area (Recipes → Add recipe, Plan → the Add dialog for today's Dinner or else Monday Dinner of the shown week, List → focus the add field, Spots → Add spot, Home → a choice sheet) and is hidden and inert while a text field has focus (S2, S3). Brand, "Search recipes" and "Add recipe" stay reachable on every screen; on Eating Out pages "Search spots" and "Add spot" take the recipe actions' place, also on the phone (S4, S16). The recipe form's "Discard changes?" guard covers every new shell entry point (S5).
- **Screens.** Home stays the today dashboard with its Top spots row (S6); Recipes archive (S7) with the gate 4 additions: tag filter collapsed to eight with "Show all N tags" (S19), the list paged by 24 (S20) and the head's own "Add recipe" and "Manage tags" (S21), all client-only; recipe page as a phone-first cook view (S8) that keeps the screen awake while open (S9, client-only Screen Wake Lock); import, the recipe form with one clear save, edit (S10); Manage tags (S11); Plan on the desktop (S12) and stacked by day on the phone (S13); Shopping list (S14).
- **Eating Out carried along.** Its four pages move onto the new shared components and shell with their current behaviour, no IA work (S15). The functional contract gains Eating Out minimally: J16, the four spot routes, their copy and nav entry; route coverage 16 of 16 (S16).
- **Status notices.** G5 "toasts" are the existing status notices with one shared style; no new toast component and no new message.
- **Cross-cutting.** Every contract state per route, English copy, WCAG 2.2 AA, a Move to… alternative for every drag, phone targets ≥44 px, no horizontal scroll at 320 px (S17).
- **Cleanup.** Old tokens, global styles, old fonts, old shared atoms, the old `/__mockups` and their guard tests are removed route by route and finally as a whole; the gate 4/5 mockups live under `/__mockups/redesign/*`.
- The work runs in the pipeline's fixed gate order: gate 4 greyscale wireframes and gate 5 hi-fi (incl. the master icon), each ending with Rue's sign-off; ecosystem checkpoint A re-syncs the fingerprint; gate 6 builds in waves (foundation → shell, overlays, archive → recipe page, plan, list → form, Eating Out, Home → cleanup); gate 7 is flow's Verify; gate 8 is Ship with the release tag v0.4.0.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `navigation`: the four-area pill nav and its compact tab bar are replaced by the desktop top bar, the phone bar with the context "+", the Home choice sheet, recipe actions on every screen, and the shell's unsaved-changes guard; area-aware actions extend to the phone.
- `home`: the today dashboard's states on the fingerprint (S6).
- `archive`: archive states on the fingerprint (S7), the tag filter collapse and paging by 24 (S19, S20), the head actions (S21).
- `recipe-detail`: phone cook view and the screen wake lock (S8, S9).
- `recipes`: one save action and the form's edge states (S10).
- `recipe-import`: import states stay usable with overlong input (S10).
- `tags`: tag manager states (S11).
- `meal-plan`: desktop week states, phone days stacked, the context "+" on Plan (S3, S12, S13).
- `shopping-list`: list states, one-handed ticking, the context "+" on List (S3, S14).
- `eating-out`: pages on the shared shell and components; Eating Out in the functional contract (S15, S16).
- `design-system`: the local tokens, fonts, shared atoms and old mockups are replaced by the vendored fingerprint, the redesign mockups, the app icon, the contract-state and copy rule and the accessibility floor (S17, S18).
- `harness`: `proof` runs the fingerprint guards.
- `release`: version 0.4.0.

## Impact

- UI layer only: `src/routes/(app)/**/+page.svelte`, `(app)/+layout.svelte`, `src/lib/{shell,ui,home,recipes,plan,list,spots}/**/*.svelte`, `src/lib/nav.ts`, `src/lib/motion.ts`, `src/lib/copy.ts`, `src/lib/styles/**`, `src/app.html`, `static/` (fingerprint fonts, icon set, manifest), `package.json` (`proof`), `src/routes/__mockups/**`, the e2e suite.
- Vendored, never edited here: `src/lib/styles/fingerprint/`, `scripts/fingerprint/`, `DESIGN.md`, `DESIGN.json`, `DESIGN-reference.md`, `fingerprint.lock`.
- Unchanged: every `+page.server.ts`, `+server.ts`, `src/lib/server/**`, schema and migrations. Screen Wake Lock is client-only. The plan and list "+" use a client-only `?add=1` URL flag that no load function reads.
- Docs: `docs/functional-contract.md` gains Eating Out (S16) and is updated in the same wave as the UI it covers; `PRODUCT.md` names five areas.
- Cross-repo: the master icon lives in Design-System (`icons/Rues-Cooking-Hub/icon.svg`); fingerprint change requests go to Design-System `requests.md`. Both are the ecosystem orchestrator's steps, not this repo's units.

## Non-Goals

- Redesigning Eating Out (its IA, cards, list): a later change of its own (Rue).
- New cook-view features beyond keep-awake: step-by-step mode, ticking off ingredients or steps (Rue chose "keep as is").
- Server, load, action or migration changes: the redesign is UI-only (ecosystem 11.1); Wake Lock is client-only.
- A global search across recipes and spots.
- Dark mode: decided for all apps at ecosystem checkpoint B (12.2).

## Appetite

Several sessions, in phases: gate 4 wireframes, gate 5 hi-fi, then the build in waves (each gate ends with Rue's sign-off).

## Done criteria

- [ ] Rue has signed off gate 4 wireframes and gate 5 hi-fi (incl. the master icon) for every screen in the inventory (SC1–SC8, G1–G5).
- [ ] Every contract route (16 of 16) renders on the fingerprint at 375 / 768 / 1280, and the screenshots have been looked at.
- [ ] `npm run proof:full` is green, with `check-slop` and `check-drift` in `proof` and no slop baseline left.
- [ ] On the phone, "Search recipes" and "Add recipe" are reachable from every screen outside Eating Out ("Search spots" and "Add spot" there), and the round "+" acts for its area.
- [ ] The recipe page keeps the screen awake (checked on Rue's phone).
- [ ] A WCAG 2.2 AA review passes; no horizontal scroll at 320 px.
- [ ] No old styling is left: `src/lib/styles/{tokens.css,tokens.ts,global.css}`, the old fonts, the old `/__mockups` screens and their guard tests are gone.
- [ ] Released as v0.4.0 and deployed after Rue's OK (gate 8), with the previous release tag recorded.
