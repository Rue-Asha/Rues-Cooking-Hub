<!--
Waves (max 3 builders each; ⛔ = human stop, the orchestrator ticks it):
W1: 1 ∥ 2 · W2: 3 ∥ 4 ∥ 5 · W3: 6 ⛔ gate 4 · W4: 7 ∥ 10 · W5: 8 ∥ 9 · W6: 11 ⛔ gate 5 · W7: 12 ⛔ build preconditions
W8: 13 · W9: 14 ∥ 15 ∥ 16 · W10: 17 ∥ 18 ∥ 19 · W11: 20 ∥ 21 ∥ 22 · W12: 23 · W13: 24
Gate 7 = flow Verify (proof:full, WCAG 2.2 AA review, review-animations, mobile-native, screenshots at 375/768/1280 looked at,
fresh-context review, icon check, Rue's real-phone checks: safe areas, wake lock, one-handed list, cook view).
Gate 8 = Ship (ship: merge, release: tag v0.4.0, Homelab deploy after Rue's OK). Neither is a builder unit.
Every builder: load DESIGN.md through `impeccable context` before UI work, style with fingerprint roles only (check-slop),
follow design.md → "Family moves per surface", never name an own class `.stage`/`.stage-photo`, avoid comma-joined token
lists in one declaration, take Playwright screenshots at 375/768/1280 and look at them before reporting; the brief
(DESIGN.md, scope, signed-off hi-fi) beats skill taste. One commit per task. Every run of proof:full or a dev/mockup
server sets COOKING_HUB_TEST=1 and the unit's own PORT (475x; Notes 47xx, Life 472x, Creative 473x and the orchestrator
474x are taken): orchestrator runs 4750; builders U1 4751, U2 4752, U3 4751, U4 4752, U5 4753, U7 4751, U10 4752,
U8 4751, U9 4752, U13 4751, U14 4751, U15 4752, U16 4753, U17 4751, U18 4752, U19 4753, U20 4751, U21 4752, U22 4753,
U23 4751, U24 4751. When graphify-out/graph.json exists, run `graphify query "<question>"` before the first grep or
source read; `graphify update .` runs only in the last unit (23.5). Fingerprint changes go to Design-System requests.md (report them);
never edit vendored files. Server, load, action and migration files are never edited.
-->

## 1. Vendor fingerprint 1.0.0, slop baseline and the redesign mockup scaffold

> unit: depends=none · scope=none · files=DESIGN.md, DESIGN.json, DESIGN-reference.md, fingerprint.lock, src/lib/styles/fingerprint/*, scripts/fingerprint/*, static/fonts/fingerprint/*, package.json, AGENTS.md, scripts/slop-baseline.mjs, scripts/slop-baseline.txt, scripts/slop-baseline.test.ts, scripts/proof-guards.test.ts, src/routes/+layout.svelte, src/routes/(app)/+layout.svelte, src/routes/__mockups/+layout.svelte, src/routes/__mockups/redesign/+layout@.svelte, src/routes/__mockups/redesign/+layout.server.ts, src/routes/__mockups/redesign/+page.svelte, src/routes/__mockups/redesign/fixtures.ts, src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/redesign-guard.test.ts, e2e/redesign-shots.test.ts

- [x] 1.1 Create the symlink `<scratchpad>/Rues-Cooking-Hub → <worktree>` (design.md → P3) and run `/home/Rue/Repos/RA-Echosystem/Design-System/scripts/sync.sh <scratchpad>/Rues-Cooking-Hub` (default invocation, no flags); check the vendored files, `fingerprint.lock` (1.0.0), the `proof` wiring and the `## Design fingerprint` section in AGENTS.md. sync.sh appends the path to Design-System `apps.txt`: leave that file uncommitted there and report the line (ecosystem 9.1)
- [x] 1.2 Write "Scenario: Proof runs the fingerprint guards" and "Scenario: Vendored files match the lock" (`scripts/proof-guards.test.ts`) and the filter test "slop baseline drops only recorded violations" (`scripts/slop-baseline.test.ts`); then add `scripts/slop-baseline.mjs` (start from Notes' filter, design.md → P1) and generate `scripts/slop-baseline.txt` from today's UI before any new code exists; point `proof` at the filter in place of the bare `check-slop`, keep `check-drift`
- [x] 1.3 Move the `global.css` import from `src/routes/+layout.svelte` into `src/routes/(app)/+layout.svelte` and `src/routes/__mockups/+layout.svelte` (design.md → P2); app and old mockups unchanged
- [x] 1.4 Write "Scenario: Redesign mockups are hidden without the test flag" (`redesign-guard.test.ts`), then add `/__mockups/redesign/`: `+layout@.svelte` (fingerprint CSS only, `data-accent="rosemary"`), `+layout.server.ts` (`requireTestFlag()`), an index page linking every screen, `Frame.svelte` with a placeholder nav, and `fixtures.ts` with the normal and the worst-case set (design.md → Contracts; photos from `static/mockups/`)
- [x] 1.5 Write "Scenario: Every mockup screen is shot at three widths", "Scenario: Worst-case data switches the fixtures" and "Scenario: Pages load no external resources" in `e2e/redesign-shots.test.ts` (discovers every page under `/__mockups/redesign/`, 375/768/1280 × normal/worst, waits for fonts, desktop project only)
- [x] 1.6 Prove "Scenario: Proof fails on a failing check": a deliberate raw colour in a new file and a deliberate edit of a vendored file each make `npm run proof` exit non-zero; revert both (no commit). Then `npm run proof` green and `PORT=4751 npm run proof:full` once (serialized with the other apps' proofs)

## 2. Functional contract: Eating Out

> unit: depends=none · scope=S16 · files=docs/functional-contract.md, PRODUCT.md, scripts/contract.test.ts

- [x] 2.1 Write "Scenario: Contract covers Eating Out" and "Scenario: Product names five areas" (`scripts/contract.test.ts`, reads the two files); they fail on today's text
- [x] 2.2 Read (only) `openspec/specs/eating-out/spec.md`, the navigation spec and the four spot routes' `+page.svelte` / `+page.server.ts`; add J16 to §2, J15's "four areas" → five, sections 4.12–4.15 for `/eating-out`, `/eating-out/new`, `/eating-out/[id]`, `/eating-out/[id]/edit` (data shown, actions, required states, keyboard and touch, in the style of 4.1–4.10), the nav entry in §5 ("Eating Out", "Search spots", "Add spot", phone pill "Spots"), the spot copy in §6, the four rows and "16 of 16 covered" in §8; `PRODUCT.md` operating context names five areas. Describe today's behaviour only
- [x] 2.3 `npm run proof` green

## 3. Gate 4 wireframes: shell and Home

> unit: depends=1 · scope=S1,S2,S3,S4,S6 · files=src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/wire/shell/**, src/routes/__mockups/redesign/wire/home/**

- [x] 3.1 Load `impeccable` (shape/craft for structure) and use `references.md` C1 (Recime 991f8f02, Lifesum 45eb2bb2, BitePal a329058e, Crouton 48f01982); greyscale only: fingerprint type scale and spacing, neutral roles, no accent, imagery, shadows or decoration
- [x] 3.2 `Frame.svelte`: the desktop top bar (brand, five areas with Eating Out last, Search recipes, Add recipe; spot actions variant) and the phone bar (Home · Recipes · Plan · List · Spots pills, detached round "+", current area marked, hidden-while-typing state); shoot 320 px first (R1) and show the icon-only fallback beside it; show the posture switch at 768 and 1024
- [x] 3.3 `wire/shell`: the "+" per area, the Home choice sheet (Recipe, Plan entry, List item), "+" hidden on the recipe form, Eating Out with the spot actions, and two candidate phone placements for brand / Search recipes / Add recipe (S4, R2) for Rue to pick; `wire/home`: today's recipe, This week, list preview, Favourite, Recently added, Top spots (design.md → P8), and the states nothing planned today / this week, empty list, no favourite, no recipes (welcome), long titles
- [x] 3.4 Load `break-ui` and run it on these screens with the worst-case set; fix what breaks; screenshots at 320/375/768/1280 looked at; report the screen list and the open choices for the gate

## 4. Gate 4 wireframes: Recipes, recipe page, import, form, tags

> unit: depends=1 · scope=S7,S8,S10,S11 · files=src/routes/__mockups/redesign/wire/recipes/**, src/routes/__mockups/redesign/wire/recipe/**, src/routes/__mockups/redesign/wire/import/**, src/routes/__mockups/redesign/wire/form/**, src/routes/__mockups/redesign/wire/tags/**

- [x] 4.1 Load `impeccable`; use `references.md` C2 (Recime c00bd8f9, Kitchen Stories 6a2dec2a, Crouton 79c66163, NYT Cooking f7bcb23c); greyscale only (as 3.1); screens sit in `Frame.svelte` (owned by unit 3)
- [x] 4.2 `wire/recipes`: Featured, tag and Favourites filters, search, sort, list, Manage tags, Add recipe; states no recipes, zero matches, 120 recipes, long titles, 40 tags. `wire/recipe`: phone-first cook view (image / no image, times / no times, scale up / down / own servings, invalid scale alert, 200-character and unbroken lines, fractions and ranges), Add to plan, Edit, Delete
- [x] 4.3 `wire/import`: initial, reading, preview, fallback, duplicate, invalid, restored draft, 400-character link; `wire/form`: new and edit with one "Save recipe" (S10: where it lives in a 50-ingredient form), photo states incl. the HEIC and oversize errors, tags, sections, draft notice; `wire/tags`: list with counts, rename open, merge status, delete entry, no tags, 60-character names
- [x] 4.4 Load `break-ui`, worst case; fix; screenshots at 375/768/1280 looked at; report

## 5. Gate 4 wireframes: Plan, List, dialogs and menus

> unit: depends=1 · scope=S5,S12,S13,S14 · files=src/routes/__mockups/redesign/wire/plan/**, src/routes/__mockups/redesign/wire/list/**, src/routes/__mockups/redesign/wire/overlays/**

- [x] 5.1 Load `impeccable`; use `references.md` C3 and C4 and the structure (not the look) of Design-System `specimen/cooking-plan.html` and `cooking-list.html`; greyscale only (as 3.1); screens sit in `Frame.svelte` (owned by unit 3)
- [x] 5.2 `wire/plan`: desktop 7 × 4 with the recipe picker aside, drag hint and drop target, empty week, a slot with 5 entries, 200-character free text, a deleted recipe's entry; phone with days stacked, today first, a past week, compact empty days, entry menu
- [x] 5.3 `wire/list`: add field, Add from plan, nine aisles, Checked N, item editor, category menu, Clear checked; states empty, only checked, 80 items, long names and amounts; thumb reach at 375
- [x] 5.4 `wire/overlays`: Add to plan (recipe page), the plan Add dialog (also as opened by the "+"), entry options, Move to…, Copy week (both steps), Add from plan, Delete recipe (with and without plan entries), Delete tag, category menu, Discard changes?, status notices (G5)
- [x] 5.5 Load `break-ui`, worst case; fix; screenshots at 375/768/1280 looked at; report

## 6. ⛔ Gate 4 sign-off (human stop)

> unit: depends=3,4,5 · scope=none · files=openspec/changes/redesign/design.md

- [x] 6.1 Orchestrator: run `e2e/redesign-shots.test.ts` once (serialized, `PORT=4750`), check every `wire/*` screen has 375/768/1280 × normal/worst shots, and present them to Rue with the open choices (S4 phone placement, posture switch, R1 320 px fallback) and the hierarchy question (primary action and main content identifiable without colour)
- [x] 6.2 ⛔ Rue signs off gate 4 (or asks for a rework, which goes to a fixer on the named screens); record date, picks and feedback in design.md → Gate log

## 7. Gate 5 hi-fi: shell and Home (Frame owner)

> unit: depends=6 · scope=S1,S2,S3,S4,S6 · files=e2e/redesign-shots.test.ts, src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/hifi/shell/**, src/routes/__mockups/redesign/hifi/home/**

- [x] 7.1 Load `impeccable` (craft on the vendored fingerprint, accent rosemary) and `emil-design-eng` (pill glide, "+" press, sheet open/close, bar hiding while typing, reduced motion); start from the signed-off wireframes, design.md → Gate log (gate 4 picks) and design.md → "Family moves per surface"; carry no rejected candidate (placement B) into hi-fi; anything that must stick to the viewport is portalled to `body` (design.md → Contracts: `position: fixed` inside `.frame`)
- [x] 7.2 `Frame.svelte` in hi-fi: glass capsule top bar with the gliding charcoal pill, phone glass pill group with the detached round "+" and labelled pills down to 320 px, the phone top strip (brand mark, Search icon, "Add recipe"; placement A), posture switch at 1024 with tablets in the phone posture; propose the scrolled (`data-compact`) state for gate 5; propose the `COPY.contextAdd` labels and the Home sheet copy in English
- [x] 7.3 `hifi/shell` and `hifi/home`: every contract state of the shell and Home (contract 4.1, §5), English copy; list every new string for the copy list
- [x] 7.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean for these files; screenshots at 320/375/768/1280 looked at; report
- [x] 7.5 Split `e2e/redesign-shots.test.ts` into one test per page directory, titled "Scenario: Every mockup screen is shot at three widths (<slug>)", each with its own timeout in place of the single 300 s test (design.md → Contracts); judge sticky bars on viewport shots (full-page shots draw them mid-page); `PORT=4751` run green

## 8. Gate 5 hi-fi: Recipes, recipe page, import, form, tags

> unit: depends=7 · scope=S7,S8,S10,S11,S19,S20,S21 · files=src/routes/__mockups/redesign/hifi/recipes/**, src/routes/__mockups/redesign/hifi/recipe/**, src/routes/__mockups/redesign/hifi/import/**, src/routes/__mockups/redesign/hifi/form/**, src/routes/__mockups/redesign/hifi/tags/**

- [x] 8.1 Load `impeccable` and `emil-design-eng` (Featured, card settle, favourite press); start from the signed-off wireframes, the recipe tile of Design-System `brief/round-4/` and design.md → "Family moves per surface"; follow the gate 4 picks in design.md → Gate log (no "Save placement B"); fixed bars portalled to `body`; screens sit in unit 7's `Frame.svelte`
- [x] 8.2 `hifi/recipes` and `hifi/recipe`: every contract state (4.2, 4.5) incl. every scale state with scaled amounts in the accent colour; Recipes with the head's "Add recipe" pill and "Manage tags", the tag filter collapsed to eight with "Show all N tags" / "Show fewer tags", paging by 24 ("Showing 24 of N", "Show 24 more"); the recipe page in the gate 4 order with two columns from 768 px and the "Recipe not found" card; propose the "Reset to N servings" copy at 1 serving for gate 5
- [x] 8.3 `hifi/import`, `hifi/form` (one "Save recipe" in a sticky bottom bar, on the phone above the phone bar; two columns from 768 px), `hifi/tags` (empty state copy): every contract state (4.3, 4.4, 4.6–4.8), English copy, new strings listed
- [x] 8.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean; screenshots at 375/768/1280 looked at; report

## 9. Gate 5 hi-fi: Plan, List, dialogs and menus

> unit: depends=7 · scope=S5,S12,S13,S14 · files=src/routes/__mockups/redesign/hifi/plan/**, src/routes/__mockups/redesign/hifi/list/**, src/routes/__mockups/redesign/hifi/overlays/**

- [x] 9.1 Load `impeccable`, `emil-design-eng` (drag ghost and drop target, list tick move, dialog open/close, reduced motion) and `mobile-native` (one-handed list, stacked plan); start from the signed-off wireframes, Design-System `specimen/cooking-plan.html` / `cooking-list.html` and design.md → "Family moves per surface"; follow the gate 4 picks in design.md → Gate log (no docked list bar); fixed bars and sheets portalled to `body`; screens sit in unit 7's `Frame.svelte`
- [x] 9.2 `hifi/plan`: desktop (days as rows, picker aside, hidden on touch) and phone/tablet (days stacked in one column up to 1023 px), every contract state (4.9)
- [x] 9.3 `hifi/list`: every contract state (4.10), the add field under the title (placement A); `hifi/overlays`: every G4 dialog and menu on the fingerprint primitives (read Design-System `primitives/`), centred card from 768 px and bottom sheet below, delete confirmations on a secondary pill, focus states visible, the shared status notice style (G5)
- [x] 9.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean; screenshots at 375/768/1280 looked at; report

## 10. Gate 5: master icon

> unit: depends=6 · scope=S18 · files=src/routes/__mockups/redesign/hifi/icon/**

- [x] 10.1 Load `impeccable`; design the master per Design-System `icons/TEMPLATE.md` (grid, safe zone, rosemary field) with a glyph from the main jobs (cook from a recipe, plan the week, shop the list): 2–3 variants in `hifi/icon/variants/{a,b,c}.svg`, the recommended one as `hifi/icon/icon.svg` (design.md → P4)
- [x] 10.2 A preview page at 16/32/180/512 beside Design-System `icons/Notes-Archive/icon.svg`; check legibility at 16 px; screenshots looked at; report the recommendation

## 11. ⛔ Gate 5 review and sign-off (human stop)

> unit: depends=7,8,9,10 · scope=none · files=openspec/changes/redesign/design.md, src/routes/__mockups/redesign/hifi/**

- [x] 11.1 Orchestrator: run `e2e/redesign-shots.test.ts` (serialized, `PORT=4750`) and check every contract state is rendered (contract §4 required states per route, §5 cross-cutting)
- [x] 11.2 Orchestrator: fresh-context review per Design-System `scripts/review-brief.md`: an agent that gets only `DESIGN.md`, `scripts/fingerprint/banned.md`, the hifi screenshots at 375/768/1280 (normal and worst) and the icon sheet; its findings go to a fixer on `hifi/**` or are accepted by Rue with a recorded reason
- [x] 11.3 ⛔ Rue signs off gate 5 with the master icon; record in design.md → Gate log: date, accent, posture switch, `COPY.contextAdd` labels and the other new strings (review round 2026-11-16 lists: `COPY.contextAdd` labels, "Show all N tags", "Show fewer tags", "Search spots", "Add spot", the Home choice-sheet hints ("Paste a link or write one by hand", "Put a recipe or a note on a day", "Add a line to the shopping list") and the tag empty state ("No tags yet", "Tags are added while you edit a recipe."))
- [x] 11.4 Hand-over for the ecosystem orchestrator: the master icon goes to Design-System `icons/Rues-Cooking-Hub/icon.svg` and through `build-icons.mjs`; fingerprint requests from units 7–10 go to `requests.md` (not done by flow units)

## 12. ⛔ Build preconditions (human stop, orchestrator)

> unit: depends=11 · scope=none · files=src/lib/styles/fingerprint/*, scripts/fingerprint/*, static/fonts/fingerprint/*, DESIGN.md, DESIGN.json, DESIGN-reference.md, fingerprint.lock, static/*, openspec/changes/redesign/specs/**, openspec/changes/redesign/design.md

- [x] 12.1 ⛔ Checkpoint A closed (ecosystem 10): `requests.md` resolved, at most one fingerprint bump, and `sync.sh` re-run here through the symlink (design.md → P3; also vendors the icon set into `static/`); `proof` green
- [x] 12.2 Confirm the re-sync added no new `check-slop` violation: the baseline filter stays green with `slop-baseline.txt` unchanged (never regenerate it) — 2026-11-16: last change d135cfa predates every 2.0.0 sync; check-slop "89 recorded problem(s) tolerated, nothing new"
- [x] 12.3 `git fetch`; if `origin/main` moved, merge it into `flow/redesign`; `proof` green — 2026-11-16: origin/main a9c3c80 already contained (`git rev-list --count flow/redesign..origin/main` = 0), no merge; proof green
- [x] 12.4 Planner: reconcile the still-valid requirements with old-look wording against the signed-off hi-fi (design.md → P10 list) as MODIFIED or REMOVED deltas, explicitly including eating-out "Eating Out looks like the approved mockup" (it names `/__mockups/eating-out`, which U23 deletes); write the gate-4/5 picks (posture switch, phone placement of the recipe actions, labels) into the delta scenarios that name them; `openspec validate redesign --strict`; also reconcile: archive spec "Tag filter shows eight tags first" (a selected tag outside the first eight stays visible in its position, Gate 5) and navigation spec "Main navigation" ("decided at gate 5" becomes the opaque-card scroll state, instant under reduced motion, as a scenario)
- [x] 12.5 `PORT=4750 npm run proof:full` green on `flow/redesign` before wave W8 — 2026-11-16 on cc067c1: unit 423 passed, e2e 584 passed, 100 skipped (12.6m)

## 13. Shell foundation: fingerprint switch, icon links, primitives, copy, context-add

> unit: depends=12 · scope=S17,S18 · files=src/app.html, src/routes/(app)/+layout.svelte, src/lib/nav.ts, src/lib/nav.test.ts, src/lib/shell/context-add.svelte.ts, src/lib/shell/context-add.test.ts, src/lib/components/*, src/lib/copy.ts, src/lib/copy.test.ts, static/manifest.webmanifest, e2e/helpers.ts, e2e/fingerprint.test.ts, e2e/icons.test.ts, e2e/design.test.ts, docs/functional-contract.md

- [x] 13.1 Write "Scenario: App renders with the accent", "Scenario: App pages load nothing from other origins" and "Scenario: Display and text fonts load from the app" (`e2e/fingerprint.test.ts`); then `data-accent` on `<html>` in `app.html`, fingerprint font preloads in place of Fraunces/DM Sans, `theme-color` from the icon's app.json, fingerprint CSS imported in `(app)/+layout.svelte` after `global.css` (design.md → P2). Delete the scenarios in `e2e/design.test.ts` whose requirements this change removes or modifies ("Display and text fonts load from the app", "Dark colour scheme preference changes nothing", "Controls are at least 44px on phone"); the rest stays until unit 23
- [x] 13.2 Write "Scenario: Icon files are served" and "Scenario: Head carries the icon links" (`e2e/icons.test.ts`); add the `app.html` link tags and `static/manifest.webmanifest` by the app-icons rule if the re-sync didn't (design.md → P4); contract §5: "a web manifest for the icon only; no service worker"
- [x] 13.3 Copy in the primitives with `sync.sh <scratchpad>/Rues-Cooking-Hub --primitive <name>` (button, empty-state, field, list-row, select, sheet, toast); add the new `COPY` keys from design.md → Gate log / Contracts; write "Scenario: Contract strings stay" and "Scenario: New strings are in the contract" (`copy.test.ts`); add the new strings to contract §6

- [x] 13.4 Write the `context-add.test.ts` unit tests (handler called synchronously, fallback hrefs per area, `takeAddFlag` strips `add=1`) and "Scenario: Active area is derived for sub-routes" (`nav.test.ts`, renamed from "Active area is marked"); then `context-add.svelte.ts`, `POSTURE_SWITCH = 1024` (gate 4) and `phoneLabel` in `nav.ts`, and the `posture` / `openNav` / `plus` helpers in `e2e/helpers.ts` (design.md → Contracts)
- [x] 13.5 Screenshots of `/` at 375/768/1280 looked at (transitional look expected); `PORT=4751 npm run proof:full` green

### Gate 5 polish carried to build (Gate log 2026-11-16)

- [x] P1 (unit 17, recipe page) clamp the lede on the photo to 3–4 lines, full text in the Notes card or behind "More".
- [x] P2 (unit 13 shared rule, checked on 16, 17, 18, 22) display titles `hyphens: manual` (keep `overflow-wrap: anywhere`).
- [x] P3 (units 16 and 17) accent word picked from the visible part of a clamped title.
- [x] P4 (unit 16, recipes archive) rows on phone: one line of chips + "+n".
- [x] P6 (unit 18, plan) plan-empty: one-line note "Nothing planned yet — tap + to add a meal" (one string, no drag; the picker is hidden on touch, meal-plan spec).
- [x] P7 (unit 22, Home) shopping-list card: display-only check circle or no indent.
- [x] P8 (unit 20, form) new-recipe photo placeholder: neutral "Add photo" instead of the monogram until a title exists.
- [x] P9 (unit 15, dialogs) Add-to-plan dialog kicker: the recipe name is cut at 375 even with normal data — less tracking on this kicker, or repeat the recipe name in the dialog body.
- [x] Detail actions → fingerprint .detail-actions (overflow pill; Rue 2026-11-16, checkpoint A)
- P5 dropped: contradicts Gate 4 (Save above the phone bar), navigation spec (one Main navigation, only "+" hidden on form routes) and recipes spec.

## 14. Shell navigation: top bar, phone bar, context "+", recipe actions, guard

> unit: depends=13 · scope=S1,S2,S3,S4,S5 · files=src/lib/shell/*.svelte, src/lib/ui/PillNav.svelte, src/lib/nav.ts, src/lib/nav.test.ts, src/lib/motion.test.ts, src/lib/recipes/unsaved.ts, src/routes/(app)/+layout.svelte, e2e/helpers.ts, e2e/nav.test.ts, e2e/nav-fit.test.ts, e2e/header.test.ts, e2e/transitions.test.ts, e2e/phone-bar.test.ts, e2e/context-add.test.ts, e2e/shell-guard.test.ts, docs/functional-contract.md

- [x] 14.1 Load `impeccable` (build from the signed-off `hifi/shell` and `Frame.svelte`), `emil-design-eng` (pill glide, sheet) and `mobile-native` (safe areas, tap highlight, 100vh, soft keyboard)
- [x] 14.2 Write "Scenario: One Main navigation at every width", "Scenario: Navigation reports the scrolled state", "Scenario: Content never sits under the navigation", "Scenario: Focused control is not hidden by the navigation", "Scenario: Top bar shows brand, five areas and the recipe actions" (`e2e/nav.test.ts`) and "Scenario: Top bar fits from 1024 to 1280 px" (`e2e/nav-fit.test.ts`); then the top bar; rewrite the removed "Area navigation" tests to these; in `e2e/nav-fit.test.ts` delete the test "mockup nav shows Eating Out after the divider" (it opens `/__mockups/home`, which U23 deletes); keep "Page transitions", "Header actions per area", "Eating Out header shows spot actions" and "Header follows client-side navigation" green
  - Orchestrator (12.4 delta): also write "Scenario: Scrolled navigation keeps an opaque card"
- [x] 14.3 Write "Scenario: Phone bar shows five pills and the round add button", "Scenario: Current area pill is marked on the phone", "Scenario: Phone bar fits at 320 px", "Scenario: Phone bar hides while a text field has focus", "Scenario: Tablet width uses the phone posture" (`e2e/phone-bar.test.ts`); then the phone bar with labelled pills down to 320 px (hidden and `inert` while a text field has focus); delete `PillNav.svelte` once nothing imports it
  - Builder 14 (2026-11-16): `PillNav.svelte` stays — `src/routes/__mockups/+layout.svelte` (old mockups, unit 23) still imports it; unit 23 deletes both and the `inlineSizeExceptions` entry in `motion.test.ts`. The phone bar, strip and top bar landed in the 14.2 commit (one shell component set); this commit holds the phone-bar tests.
- [x] 14.4 Write "Scenario: Plus on Recipes pages opens Add recipe", "Scenario: Plus on Eating Out pages opens Add spot", "Scenario: Plus on Home opens the choice sheet", "Scenario: Choice sheet closes on Escape, outside tap and back", "Scenario: Plus is hidden on the recipe form" (`e2e/context-add.test.ts`); then the "+" through `contextAdd` and the Home sheet on the `sheet` primitive (shallow-routing history entry so back closes it)
  - Rue 2026-11-16 (request #18 declined): "+" stays hidden and `inert` on form routes, not `aria-disabled` — documented family deviation
- [x] 14.5 Write "Scenario: Recipe actions are reachable on every recipe-side screen on the phone", "Scenario: Search recipes on the phone focuses the field" and "Scenario: Phone offers the spot actions on Eating Out" (`e2e/header.test.ts`); then the phone top strip (gate 4, placement A: brand mark, Search icon, "Add recipe", zero taps), with the spot actions in place of the recipe actions on Eating Out pages and the brand on every screen (Gate 1, P7); keep "Search action focuses the field" green
  - Builder 14: the strip and its three scenarios landed with the 14.2 commit (`e2e/header.test.ts`). "Search action focuses the field" does not exist in any e2e file; the archive search focus is covered by "Search recipes on the phone focuses the field".
- [x] 14.6 Write "Scenario: Phone pill on an edited form asks first", "Scenario: Top bar actions on an edited form ask first", "Scenario: Unedited form leaves without asking" (`e2e/shell-guard.test.ts`); route every new shell entry point through the guard in `unsaved.ts`
- [x] 14.7 Contract §5 navigation (five areas, phone bar, "+", Home sheet, bar hidden while typing; "Spots" label); screenshots at 320/375/768/1024/1280 looked at; `proof:full` green (proof:full at the W9 merge: exit 0, 589 e2e + 421 unit passed, 2026-11-16)
  - Builder 14 (2026-11-16): contract §5 and screenshots done; the box stays open for `proof:full`. Pages opt into the stage photo with `useStage(() => photoUrl | null)` from `#lib/shell/stage.svelte.ts` (the shell renders `.app[data-photo]`, `--photo` and `figure.stage`) and render `.screen-head` / `.screen-body` directly in the shell's `<main class="screen">`. Known collisions for the next owners: `e2e/plan.test.ts` "Empty week shows add affordances" counts `Add to …` buttons and now also finds the phone "+" ("Add to plan"); `e2e/recipe-form.test.ts` (2 tests) and `e2e/spots-form-guard.test.ts` tap a phone pill while a field still has focus, but the bar is now hidden and inert while typing (blur first); `e2e/journey.test.ts` "Add from plan" overlay stays in the DOM after "Add to list" until unit 15 portals the old overlays out of `.frame`.

## 15. Dialogs, menus and status notices

> unit: depends=13 · scope=S5,S17 · files=src/lib/components/*, src/lib/plan/Sheet.svelte, src/lib/plan/MoveTo.svelte, src/lib/plan/CopyWeek.svelte, src/lib/plan/RecipePicker.svelte, src/lib/recipes/AddToPlan.svelte, src/lib/recipes/DeleteRecipe.svelte, src/lib/recipes/DiscardDialog.svelte, src/lib/list/AddFromPlan.svelte, src/lib/list/CategoryMenu.svelte, src/lib/spots/DeleteSpot.svelte, src/lib/spots/MarkVisited.svelte, src/lib/ui/Status.svelte, e2e/dialogs.test.ts, e2e/plan-move.test.ts, e2e/plan-copy.test.ts, e2e/list-plan.test.ts, e2e/spots-visit.test.ts, e2e/spots-delete.test.ts

- [x] 15.1 Load `impeccable` (from `hifi/overlays`) and `emil-design-eng` (dialog and menu open/close, reduced motion)
- [x] 15.2 Write "Scenario: Every dialog traps focus and returns it" and "Scenario: Close control and outside click close every dialog", "Scenario: Dialogs are bottom sheets on the phone and cards from 768 px" (`e2e/dialogs.test.ts`, both projects); then rebuild `Sheet.svelte` on the `sheet` primitive keeping its props (portalled to `body`; centred card from 768 px, bottom sheet below; delete confirmations on a secondary pill), and restyle every listed dialog's content; the listed behaviour e2e stay green (role/name changes only where the hi-fi demands them)
- [x] 15.3 Write "Scenario: Status notices are announced without taking focus" (in `e2e/dialogs.test.ts`); then `Status.svelte` on the `toast` primitive's status style (no new messages); pages adopt it in their own units
- [x] 15.4 Screenshots of every dialog at 375/768/1280 looked at; `proof:full` green (proof:full at the W9 merge: exit 0, 589 e2e + 421 unit passed, 2026-11-16)

## 16. Recipes archive

> unit: depends=13 · scope=S7,S19,S20,S21 · files=src/routes/(app)/recipes/+page.svelte, src/lib/recipes/FeaturedStack.svelte, src/lib/recipes/FilterBar.svelte, src/lib/recipes/RecipeCard.svelte, src/lib/recipes/FavouriteButton.svelte, src/lib/recipes/coverflow.ts, src/lib/recipes/coverflow.test.ts, e2e/archive.test.ts, e2e/archive-filters.test.ts, e2e/archive-motion.test.ts, e2e/featured.test.ts, e2e/archive-states.test.ts

- [x] 16.1 Load `impeccable` (from `hifi/recipes`) and `emil-design-eng` (Featured, filter reorder, reduced motion)
- [x] 16.2 Write "Scenario: No recipes shows Start your archive", "Scenario: Filters matching nothing offer Clear filters", "Scenario: A hundred recipes stay usable", "Scenario: Long titles and many tags stay in the layout", "Scenario: Recipes head keeps Add recipe and Manage tags", "Scenario: More than eight tags collapse behind Show all", "Scenario: Eight tags or fewer show no toggle", "Scenario: List shows 24 and more on request", "Scenario: A filter change starts at 24 again" (`e2e/archive-states.test.ts`); then rebuild the archive page and its components with the client-only tag collapse and paging by 24 (no load or URL change); the existing archive e2e stay green (role/name changes only)
  - Orchestrator (12.4 delta): also write "Scenario: A selected tag outside the first eight stays visible"
- [x] 16.3 Screenshots at 320/375/768/1280 looked at; `proof:full` green (proof:full at the W9 merge: exit 0, 589 e2e + 421 unit passed, 2026-11-16)

## 17. Recipe page: cook view and keep-awake

> unit: depends=14,15 · scope=S8,S9 · files=src/routes/(app)/recipes/[id]/+page.svelte, src/routes/(app)/recipes/[id]/+error.svelte, src/lib/recipes/Hero.svelte, src/lib/recipes/wake-lock.ts, src/lib/recipes/wake-lock.test.ts, e2e/recipe-page.test.ts, e2e/recipe-motion.test.ts, e2e/cook-view.test.ts, e2e/wake-lock.test.ts

- [x] 17.1 Load `impeccable` (from `hifi/recipe`), `mobile-native` and `emil-design-eng` (card settle on full load only, favourite press; scaled amounts change instantly)
- [x] 17.2 Write "Scenario: Cook view shows every part on the phone", "Scenario: Long ingredient lines wrap in the cook view", "Scenario: Scaled fractions and ranges read in the cook view", "Scenario: Recipe without image and times in the cook view", "Scenario: Ingredients and method side by side from 768 px", "Scenario: Unknown recipe shows Recipe not found" (`e2e/cook-view.test.ts`); then rebuild the recipe page (stage photo, glass rail, seg bar, overlapping cards; gate 4 order, two columns from 768 px) and the plain "Recipe not found" card in `+error.svelte` (status stays 404); the existing recipe-page e2e stay green
- [x] 17.3 Write "Scenario: Recipe page requests a wake lock", "Scenario: Leaving the recipe page releases the wake lock", "Scenario: Wake lock is requested again after the page was hidden", "Scenario: Missing wake lock API changes nothing", "Scenario: Denied wake lock shows no error" (`e2e/wake-lock.test.ts`, stub via `addInitScript`) and the `wake-lock.test.ts` unit tests; then `keepAwake(): () => void` in `wake-lock.ts`, used from a `$effect` on the recipe page (client-only)
- [x] 17.4 Screenshots at 320/375/768/1280 looked at; `proof:full` green (proof:full at the W10 merge: exit 0, 658 e2e + 427 unit passed, 2026-11-16)

## 18. Plan: desktop week, phone days, context "+"

> unit: depends=14,15 · scope=S3,S12,S13 · files=src/routes/(app)/plan/+page.svelte, src/lib/plan/Week.svelte, src/lib/plan/Slot.svelte, src/lib/plan/Entry.svelte, src/lib/plan/RecipeRail.svelte, e2e/plan.test.ts, e2e/plan-entries.test.ts, e2e/plan-states.test.ts, e2e/plan-phone.test.ts, e2e/plan-add.test.ts, docs/functional-contract.md

- [x] 18.1 Load `impeccable` (from `hifi/plan`), `mobile-native` (stacked days, menus) and `emil-design-eng` (drag ghost, drop target); `dnd.ts` stays unchanged
- [x] 18.2 Write "Scenario: Empty week offers an add control in every slot", "Scenario: Slot with five entries stays readable", "Scenario: Entry of a deleted recipe reads as text", "Scenario: Every drag has a Move to alternative on the desktop", "Scenario: Picker is hidden on touch at desktop width" (`e2e/plan-states.test.ts`); then rebuild the desktop week (days as rows, picker aside hidden on touch)
- [x] 18.3 Write "Scenario: Days are stacked on the phone", "Scenario: Today is marked and first in view", "Scenario: Past week starts at Monday", "Scenario: Empty days are compact", "Scenario: Phone plan works without drag", "Scenario: Tablet width stacks the days in one column" (`e2e/plan-phone.test.ts`); then the stacked one-column layout below 1024 px with `aria-current="date"` and the scroll to today
- [x] 18.4 Write "Scenario: Plus on Plan opens the Add dialog for today", "Scenario: Plus on another week targets Monday Dinner", "Scenario: Plan entry from the Home sheet opens the Add dialog" (`e2e/plan-add.test.ts`); then `registerContextAdd` and `takeAddFlag` on the plan page with the target from design.md → P6 (today's Dinner, else Monday Dinner; no day/meal choice in the dialog)
- [x] 18.5 Contract §4.9 (phone layout, "+" target) plus the deltas units 17 and 19 report; screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at the W10 merge: exit 0, 658 e2e + 427 unit passed, 2026-11-16)

## 19. Shopping list and context "+"

> unit: depends=14,15 · scope=S3,S14 · files=src/routes/(app)/list/+page.svelte, src/lib/list/Item.svelte, e2e/list.test.ts, e2e/list-check.test.ts, e2e/list-states.test.ts, e2e/list-add.test.ts

- [x] 19.1 Load `impeccable` (from `hifi/list`), `mobile-native` (one-handed reach, soft keyboard, tap highlight) and `emil-design-eng` (tick move, reduced motion)
- [x] 19.2 Write "Scenario: Empty list shows Nothing to buy", "Scenario: Only checked items", "Scenario: Eighty items in nine aisles stay usable", "Scenario: Long names and amounts wrap", "Scenario: Item targets are thumb-sized on the phone" (`e2e/list-states.test.ts`); then rebuild the list page and `Item.svelte` with `Status.svelte` for the notice; the existing list e2e stay green
  - Builder 19 (2026-11-16): the 19.3 page code (`registerContextAdd`, `takeAddFlag`, the add field under the title) landed in this commit with the page rebuild; the 19.3 commit holds its tests. The Checked group now renders on an empty list too (spec: its hint and a disabled Clear checked). Struck names use `text-decoration: line-through` (a wrapped name is struck on every line); `e2e/list-check.test.ts` `struck` reads it. The aisle-count facts card is hidden below 768 px so a long list starts on the first screen (hi-fi shows it on the phone; taste question).
- [x] 19.3 Write "Scenario: Plus on List focuses the add field" and "Scenario: List item from the Home sheet focuses the add field" (`e2e/list-add.test.ts`); then the add field under the title (no docked bar, gate 4), `registerContextAdd` (focus synchronously) and `takeAddFlag` on the list page
- [x] 19.4 Screenshots at 320/375/768/1280 looked at; `proof:full` green; report contract deltas to unit 18 (proof:full at the W10 merge: exit 0, 658 e2e + 427 unit passed, 2026-11-16)
- [x] 19.5 Verify the list item-name target is 44 px under a coarse pointer in the touch e2e (`hifi/list/Row.svelte` uses `--target`, not `--target-min`)
  - Builder 19 (2026-11-16): covered by "Scenario: Item targets are thumb-sized on the phone" (`e2e/list-states.test.ts`, phone project is a coarse pointer): checkbox, the name's Edit button and the move control are each at least 44×44 px.

## 20. Import, recipe form, edit and tags

> unit: depends=14,15 · scope=S10,S11 · files=src/routes/(app)/recipes/new/+page.svelte, src/routes/(app)/recipes/new/form/+page.svelte, src/routes/(app)/recipes/[id]/edit/+page.svelte, src/routes/(app)/recipes/tags/+page.svelte, src/lib/recipes/RecipeForm.svelte, src/lib/recipes/SectionsEditor.svelte, src/lib/recipes/ImageField.svelte, src/lib/recipes/TagInput.svelte, e2e/import.test.ts, e2e/recipe-form.test.ts, e2e/recipe-edit.test.ts, e2e/recipe-image.test.ts, e2e/tags.test.ts, e2e/form-states.test.ts, e2e/import-states.test.ts, e2e/tags-states.test.ts, docs/functional-contract.md

- [x] 20.1 Load `impeccable` (from `hifi/import`, `hifi/form`, `hifi/tags`) and `emil-design-eng` (section insert/remove)
- [x] 20.2 Write "Scenario: Recipe form has one Save recipe" and "Scenario: Save stays reachable in a long form" (`e2e/form-states.test.ts`); then the single save in a sticky bottom bar (phone: above the phone bar, portalled out of `.frame`; gate 4) and the two-column form from 768 px; migrate tests that pick the first of two "Save recipe" buttons
- [x] 20.3 Write "Scenario: HEIC photo the server cannot read is rejected" (synthetic bytes, no download), "Scenario: Fifty ingredient lines stay usable", "Scenario: Restored draft offers Discard draft on the new form" (in `e2e/form-states.test.ts`); then rebuild `RecipeForm`, `SectionsEditor`, `ImageField`, `TagInput` and the new/edit pages; the existing form e2e stay green
- [x] 20.4 Write "Scenario: Import states render at three widths" and "Scenario: Long link and title stay usable in the import" (`e2e/import-states.test.ts`, fixture server pages); then rebuild the import page
- [x] 20.5 Write "Scenario: No tags shows the empty state", "Scenario: Long tag names wrap in the manager", "Scenario: Merge reports both names" (`e2e/tags-states.test.ts`); then rebuild the tags page (its delete dialog on `Sheet`, its note on `Status`)
- [x] 20.6 Contract §4.6 (one "Save recipe"), §4.8 (empty state copy) plus the deltas units 21 and 22 report; screenshots at 320/375/768/1280 looked at; `proof:full` green (proof:full at the W11 merge: exit 0, 684 e2e + 427 unit passed, 2026-11-16)

## 21. Eating Out on the new shell and components

> unit: depends=14,15 · scope=S15 · files=src/routes/(app)/eating-out/+page.svelte, src/routes/(app)/eating-out/new/+page.svelte, src/routes/(app)/eating-out/[id]/+page.svelte, src/routes/(app)/eating-out/[id]/edit/+page.svelte, src/lib/spots/SpotCard.svelte, src/lib/spots/SpotFilters.svelte, src/lib/spots/SpotForm.svelte, src/lib/spots/ScoreField.svelte, e2e/spots-card.test.ts, e2e/spots-delete.test.ts, e2e/spots-edit.test.ts, e2e/spots-filters.test.ts, e2e/spots-form-errors.test.ts, e2e/spots-form-guard.test.ts, e2e/spots-form.test.ts, e2e/spots-hero.test.ts, e2e/spots-list.test.ts, e2e/spots-page.test.ts, e2e/spots-rank.test.ts, e2e/spots-visit.test.ts, e2e/spots-shell.test.ts

- [x] 21.1 Load `impeccable`; no own wireframes or hi-fi (S15): apply design.md → "Family moves per surface" and the shared components with no IA change; read `openspec/specs/eating-out/spec.md` first
- [x] 21.2 Write "Scenario: Spot pages render on the fingerprint" and "Scenario: Spot pages keep their behaviour" (`e2e/spots-shell.test.ts`); then restyle the four pages and the spot components; the existing `e2e/spots-*.test.ts` stay green with role/name/posture-helper changes only
- [x] 21.3 Screenshots of the four pages at 375/768/1280 looked at; `proof:full` green; report contract deltas to unit 20 (proof:full at the W11 merge: exit 0, 684 e2e + 427 unit passed, 2026-11-16)

## 22. Home: today dashboard

> Orchestrator (W10 handover): a page that moves its own element out of `<main>` (portal or DOM move) must not have it as its first or last top-level node, or Svelte's page teardown deletes the next page's DOM; add a "leaving renders the next page" e2e like `e2e/plan-states.test.ts`'s.

> unit: depends=14,15,16 · scope=S6 · files=src/routes/(app)/+page.svelte, src/lib/home/*, e2e/home.test.ts, e2e/home-spots.test.ts, e2e/home-states.test.ts, e2e/journey.test.ts

- [x] 22.1 Load `impeccable` (from `hifi/home`) and `emil-design-eng` (card settle on full load only)
- [x] 22.2 Write "Scenario: Home shows the today dashboard", "Scenario: Nothing planned this week", "Scenario: Empty list and no favourite on Home", "Scenario: No recipes shows the welcome state", "Scenario: Long titles stay inside the dashboard", "Scenario: Top spots stay on the dashboard" (`e2e/home-states.test.ts`); then rebuild Home in the gate 4 section order (hero, This week, list, Favourite, Recently added, Top spots) with `RecipeCard` from unit 16 and Top spots (design.md → P8); delete the old tiles in `src/lib/home/` once nothing imports them; `home.test.ts`, `home-spots.test.ts` and `journey.test.ts` stay green
  - Rue 2026-11-16: Top spots on Home uses 3 columns on desktop as in the hi-fi (not one row of four); write that into the home "Top spots" delta (MODIFIED) and its scenario
  - Orchestrator (12.4 delta): delete the scenario-less old-look motion tests in `e2e/home.test.ts` ("Home tiles rise…", "Home hero photo drifts on scroll", "Reduced motion keeps Home still"); they contradict the hi-fi motion
- [x] 22.3 Screenshots at 320/375/768/1280 looked at; `proof:full` green; report contract deltas to unit 20 (proof:full at the W11 merge: exit 0, 684 e2e + 427 unit passed, 2026-11-16)

## 23. Remove the old styling, accessibility floor, graph

> Orchestrator (W10 handover): `dnd.ts` `ghost()` sets inline `var(--white)` and `var(--r-sm)` (old tokens that go with global.css); switch them to fingerprint roles.

> unit: depends=17,18,19,20,21,22 · scope=S17 · files=src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/tokens.test.ts, src/lib/styles/global.css, src/lib/motion.ts, src/lib/motion.test.ts, src/lib/ui/*, src/routes/(app)/+layout.svelte, src/routes/__mockups/+layout.svelte, src/routes/__mockups/+layout.server.ts, src/routes/__mockups/mockups-guard.test.ts, src/routes/__mockups/{home,recipes,recipe,import,import-fallback,plan,list,eating-out}/**, src/lib/mockups/*, src/routes/__mockups/redesign/credits.test.ts, static/fonts/*.woff2, static/fonts/*-OFL.txt, src/app.html, package.json, scripts/slop-baseline.mjs, scripts/slop-baseline.txt, scripts/slop-baseline.test.ts, scripts/no-old-styles.test.ts, e2e/design.test.ts, e2e/mockups.test.ts, e2e/mockup-eating-out.test.ts, e2e/a11y-floor.test.ts, docs/functional-contract.md, graphify-out/*

- [x] 23.1 Write "Scenario: Old style files are gone" and "Scenario: Proof runs check-slop without a baseline" (`scripts/no-old-styles.test.ts`)
- [x] 23.2 Move `src/lib/mockups/credits.test.ts` to `src/routes/__mockups/redesign/credits.test.ts` (keeps "Scenario: Every mockup photo is credited"); then ⚠ irreversible: delete `tokens.css`, `tokens.ts`, `tokens.test.ts`, `global.css`, the old `/__mockups/<screen>` pages with `src/routes/__mockups/+layout.svelte`, `+layout.server.ts` and `mockups-guard.test.ts` (their requirement "Mockups before feature UI" is REMOVED; keep `/__mockups/redesign/*` with its own guard), `src/lib/mockups/*`, the unused atoms in `src/lib/ui/`, `e2e/design.test.ts`, `e2e/mockups.test.ts`, `e2e/mockup-eating-out.test.ts`, the `shots:mockups` script and the old `static/fonts/*` outside `fingerprint/` (`static/mockups/` stays, design.md → P13); move what `motion.ts` still needs onto fingerprint tokens; remove the `global.css` imports
- [x] 23.3 Delete `scripts/slop-baseline.*` and restore `proof` to the exact line `sync.sh` writes; plain `check-slop` passes with no baseline
- [x] 23.4 Write "Scenario: No horizontal page scroll from 320 to 1920", "Scenario: Controls meet the target sizes", "Scenario: Focus is visible and not obscured", "Scenario: Reduced motion removes movement" (`e2e/a11y-floor.test.ts`, worst-case seed across the listed pages); fix what fails in the owning components and report each fix
- [x] 23.5 Contract §7 allow-list per task 12.4 and §8 coverage still 16 of 16; `proof:full` green (serialized); then, as the very last step of the build and in this unit only, `graphify update .`

## 24. Release 0.4.0

> unit: depends=23 · scope=none · files=package.json, package-lock.json, scripts/version.test.ts

- [ ] 24.1 Retitle the version test to "Scenario: Package and lockfile carry 0.4.0" expecting 0.4.0 (red on 0.3.0); then bump 0.3.0 → 0.4.0 (feature = minor) with `npm version 0.4.0 --no-git-tag-version` (package.json and both lockfile fields); `proof` green. The tag `v0.4.0` and "Release v0.4.0 published" happen at Ship, not in this unit
