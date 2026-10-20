# Scope: build-cooking-hub

Triage: feature — new app "Rues Cooking Hub" (recipe archive with URL import, weekly meal plan, shopping list, home dashboard) in a new repo, with harness, CI and release like Rues-Arcade. Appetite: a few sessions (~1 week).

Supporting notes in this dir: `decisions.md` (every answer from explore, dated), `research-stack.md` (model repos),
`research-infra.md` (homelab deploy path), `research-mobbin.md` (Mobbin references), `split-food-spots.md` (split-off change).
UI inspiration: all five images in `/home/Rue/Pictures/UI-inspo/` together with the Mobbin references.

## Problem
Rue collects recipes from the internet and from learning, but has no single place to keep them with notes,
plan the week's meals from them, and turn that plan into a shopping list. Rue wants one lively,
good-looking self-hosted app for that, used on desktop and phone.

## Flows
- Import: Recipes → "Add recipe" → paste URL → server reads the page → editable preview → Save → recipe detail.
- Import fails: paste URL → "Couldn't read a recipe from this page" → manual form prefilled with the URL (+ title/image if readable) → Save.
- Manual: Recipes → "Add recipe" → "Start from scratch" → form → Save → detail.
- Browse: Recipes → Featured stack (7 newest) + card grid → filter by tags / search / sort / favourites → card → detail (shared-element transition) → back.
- Edit/delete: detail → Edit → Save | Delete → confirm → archive.
- Plan: Plan → week (Mon–Sun) → add entry to a day's slot (recipe with servings, or free text) via picker (phone) or drag from the recipe rail (desktop) → move/delete entries → prev/next week → copy a week.
- Plan from recipe: detail → "Add to plan" → day + slot + servings → entry appears in the plan.
- Shop: List → "Add from plan" → choose date range → items added (scaled, merged) → assign categories → check off in store → "Clear checked".
- Home: open app → bento dashboard (today hero, this week, list, favourite) → tap a tile → its area.

## Entity model (confirmed with Rue)
```
Recipe ──n:m── Tag
  │ ingredients (sections → lines: quantity · unit · name, original text kept)
  │ steps (sections → lines), notes (Markdown), hero image (BLOB), servings, prep/cook minutes, source URL, favourite
  ▼ planned as
PlanEntry: date · slot (Breakfast | Lunch | Dinner | Snacks) · position · recipe + servings | free text
  ▼ "Add from plan" (date range)
ShoppingItem: name · amounts · category · checked · origin (manual | plan)
CategoryMemory: item name → category (Rue's last manual assignment)
```

## In scope

### Foundation
- **S1** Repo foundation copied from Rues-Arcade (research-stack.md): SvelteKit 3, `#lib` imports, adapter-node, Node 22, `node:sqlite`, numbered SQL migrations applied on start (failure exits non-zero), `DATABASE_PATH`, `GET /healthz` (200; 503 on DB error), `PROTOCOL_HEADER` handling.
  - edges: fresh DB → migrations create schema and the starter tags; existing DB → only new migrations run; DB unreadable → /healthz 503.
- **S2** Harness per repo-setup.md: `proof`, `proof:full` (Playwright phone 390×844 + desktop 1280×800, per-port DB, `x-forwarded-proto`), `run`, `package` (tarball + .sha256 incl. migrations), `## Harness` in CLAUDE.md with `ship: merge`, `release: tag`.
  - edges: none (copied, proven by proof:full itself).
- **S3** CI exactly like Rues-Arcade/Life-Manager: `ci.yml` + `gate.yml` (PRs on `["self-hosted","homelab-check"]`, pushes on ubuntu-24.04), security-baseline job, dependabot (github-actions + npm, ignore typescript major), same SHA pins as research-stack.md.
  - edges: none (runs on GitHub; proven by the change's own PR).
- **S4** Release exactly like Rues-Arcade: `release.yml` (check-tag → publish → bump via `Rue-Asha/ci` bump-pin to `ansible/inventory/host_vars/rues-cooking-hub01/vars.yml`, variable `rues_cooking_hub_version`), version 0.1.0 with version test + `release` spec.
  - edges: first tag v0.1.0 runs before the Homelab host_vars exist → bump job fails, publish succeeds (accepted, R4).
- **S5** Design system: tokens (light warm: cream/sand ground, stone grey, olive + brick-red accents, one dark tile style), self-hosted fonts (serif display + sans, chosen in the mockup unit, files in the repo), glass panel, pill nav, arrow-in-circle button, card, chip, `motion.ts` with `reducedMotion()`.
  - edges: `prefers-reduced-motion` → transitions become instant/fade only; no dark mode.
- **S6** Mockups first: static mockups of Home, Recipes, Recipe detail, Import preview/form, Plan, List at 390 and 1280, as screenshots for Rue's approval before any feature unit builds UI. One alignment rule for all main screens; desktop judged as seriously as phone.
  - photos: ~8 free-licence food photos downloaded once by the builder into `static/mockups/`, sources + licence recorded in a file next to them (Rue, Gate 1).
  - edges: Rue requests changes → mockups revised until approved (the build waits; this is a taste stop, not a failure).
- **S7** Navigation: floating glass pill nav at the top on desktop (Home, Recipes, Plan, List), floating pill tab bar at the bottom on phone; active item marked; nav shrinks on scroll.
  - edges: phone landscape / 768 tablet → one of the two layouts, no overlap with content.
- **S8** Page transitions between areas (animated, View Transitions where supported, plain navigation otherwise).
  - edges: browser without View Transitions → instant navigation, no error; reduced motion → no animation.

### Recipe archive
- **S9** Recipe has: title (required), description, hero image, source URL, servings (default 2), prep and cook minutes, tags, ingredient sections, step sections, notes (Markdown), favourite flag.
  - edges: title empty → save blocked with message; no image → designed placeholder; no times → no time shown; servings < 1 → rejected.
- **S10** Ingredient parser: each typed or imported line becomes quantity · unit · name, original text kept. Handles integers, decimals, fractions (`1 1/2`, `½`), ranges (`2-3` → upper bound for the list, text kept), comma decimals (`1,5 l` → 1.5 l; Gate 1 addition a), attached units (`200g`), trailing notes (`, softened`), lines without quantity (`salt to taste`).
  - edges: unparseable line → name = whole line, no quantity; live preview of the parse while typing.
- **S11** Create recipe manually via the form; ingredients and steps entered as sections ("For the sauce"); notes in Markdown, rendered sanitised.
  - edges: unsaved changes + leave → confirm; a section with no lines → dropped on save; script/HTML in Markdown → not executed.
- **S12** Import from URL: server fetches the page, reads schema.org Recipe JSON-LD (incl. `@graph`, `HowToSection`, ISO 8601 durations → minutes, `recipeYield` → servings), maps `recipeCategory`/`keywords` to tags (existing tags reused case-insensitively, new ones created; Gate 1 addition d), downloads the image, shows the editable preview (the form, prefilled); Save stores it.
  - edges: page unreachable / blocked / no Recipe data → "Couldn't read a recipe from this page" + manual form prefilled with URL (+ title/image from meta tags if readable); invalid URL → inline error; URL already in the archive → "Already in your archive" with link to it and "Import anyway"; image download fails → recipe without image + notice; slow page → timeout (~10 s) treated as unreachable. Tests use saved HTML fixtures, never live sites.
- **S13** Images: upload a file or give an image URL; stored downscaled (≈ max 1600 px long side, ~200 KB) as BLOB in SQLite, served with caching headers.
  - edges: non-image / oversize file (> 15 MB) → rejected with message; replacing the image removes the old blob; "Remove image" deletes it and the placeholder shows (Gate 1 addition f).
- **S14** Edit and delete a recipe. Deleting asks for confirmation naming how many plan entries use it; those entries become free text with the recipe's title; shopping list unchanged.
  - edges: recipe in no plan entry → plain confirm.
- **S15** Archive grid of cards: hero image, title, 2–3 lines of description (clamped), total time, tags; staggered entrance.
  - edges: empty archive → empty state with "Add your first recipe"; no description → title + meta only; long titles clamp.
- **S16** Featured stack in the archive header: the 7 most recently added recipes as a coverflow / stacked card carousel with a `01/07` counter, prev/next arrows, swipe on phone, keyboard arrows on desktop.
  - edges: fewer than 7 → shows what exists (`01/03`); 0 → stack hidden; 1 → no arrows.
- **S17** Tags: free tags, seeded with Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad, Baking; create while editing a recipe; rename and delete in a tag manager.
  - edges: duplicate name (case-insensitive) → reuses the existing tag; renaming to an existing name merges the two tags (Gate 1 addition e); delete a tag in use → confirm naming the count, removed from those recipes.
- **S18** Filter by tags (chip row; several tags = recipes having all of them), favourites-only toggle, live result count; changes animate with FLIP (cards glide to new positions).
  - edges: no match → "No recipes match" + clear filters; filter state kept in the URL (back/forward, reload).
- **S19** Full-text search over title, description, ingredient names and tags; case-insensitive including non-ASCII (`spätzle` finds "Spätzle").
  - edges: empty query → all; combined with tag filter (AND); no match → same empty state as S18.
- **S20** Sort: newest (default), title A–Z, total time.
  - edges: recipes without time sort last under "total time".
- **S21** Favourite toggle on card and detail, animated.
  - edges: none (binary flag).
- **S22** Recipe detail: full-bleed hero with parallax/zoom on scroll and a glass info panel (title, times, servings, tags, favourite, source link), ingredients and steps by section, rendered notes, Edit, Delete, "Add to plan". Card → detail and back use a shared-element transition of the hero image.
  - edges: no image → placeholder hero; no source URL → no link; reduced motion → no parallax, no shared element.

### Meal plan
- **S23** Week view Mon–Sun with slots Breakfast, Lunch, Dinner, Snacks per day; any number of entries per slot; today highlighted; prev/next week and "This week".
  - edges: empty week → empty slots with add affordance; phone shows days stacked (or one day at a time), desktop the full grid at 1280.
- **S24** Add entry: recipe (picker with search; servings default = recipe servings, adjustable) or free text; from the plan slot, and from recipe detail via "Add to plan" (day + slot + servings).
  - edges: free text empty → rejected; servings < 1 → rejected.
- **S25** Drag & drop on desktop: drag a recipe from a recipe rail onto a slot; drag entries between slots/days and reorder within a slot; drop target highlighted. On phone: entry menu "Move to…" (day + slot).
  - edges: drop outside a slot → returns to origin, nothing saved; keyboard alternative = the "Move to…" menu also on desktop.
- **S26** Edit entry servings or free text; delete entry.
  - edges: none beyond S24's validation.
- **S27** Copy week: copy all entries of one week into another (default: previous week → shown week); appended after existing entries.
  - edges: source week empty → "Nothing to copy", no change; target has entries → confirm, then append.

### Shopping list
- **S28** One list. Add manual items (typed line parsed like S10, e.g. "2 l milk"); edit name/amount; delete.
  - edges: empty input → nothing added; same name as an existing open manual item → amounts merged.
- **S29** "Add from plan": choose a date range (default: shown/current week); recipe entries in range contribute their ingredients scaled by entry servings / recipe servings; free-text entries contribute nothing; equal names merge, equal units and metric families (g/kg, ml/l) sum, other units listed as separate amounts on one line ("1 cup + 200 g flour"); lines without quantity appear once without amount.
  - singular/plural names fold to one line (`1 onion` + `2 onions` → 3 onions; Gate 1 addition c); plan amounts merge into an open manual item with the same name (Gate 1 addition g).
  - edges: running it again replaces all **open** plan-derived items (amounts merged into a manual item are recalculated, the manual part kept); manual items and checked items stay; a name already present as a checked plan item is not re-added; range with no recipe entries → "Nothing planned in this range", **no change** to the list.
- **S30** Categories, manual only: fixed set Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks, Household, Other; list grouped by category; new items go to the remembered category for that name, else Other; moving an item remembers the choice for that name.
  - edges: empty category → hidden; name memory is case-insensitive.
- **S31** Check off with animation (fill, strike-through, item slides to a "Checked" section at the bottom); uncheck restores; "Clear checked" removes all checked items.
  - edges: nothing checked → "Clear checked" disabled; reduced motion → no slide.

### Home
- **S32** Bento dashboard: hero tile = today's planned recipe (Dinner preferred, else first recipe entry of today) with full-bleed photo and serif headline; tiles "This week" (7 days, entry thumbnails/titles), "Shopping list" (open count + first items), "Favourite" (most recently favourited); each tile links to its area.
  - edges: nothing planned today → hero shows the newest recipe with "Plan your day" CTA; empty archive → welcome hero with "Add your first recipe"; no favourites → tile invites to favourite; empty list → "List is empty".

## Non-goals
- Food Spots — split off (split-food-spots.md).
- Homelab container, role, playbook, DNS — separate changes in Homelab-Managment (see Split off).
- Cook mode (step-by-step, timers, ingredient check-off, servings stepper on the recipe page) — Rue: not wanted.
- Cook log, ratings for recipes, "not cooked in a while", collections/cookbooks, recipe gallery — Rue chose against them.
- Leftovers entries, suggestions for empty slots — not chosen.
- Pantry basics, provenance strip, quick-add suggestions, automatic categorisation — not chosen.
- Unit conversion (cups ↔ g) — Rue: keep units as written.
- Offline/PWA, Wake Lock, HTTPS — plain HTTP on the LAN; not a secure context.
- Login, multiple users, sharing — single user behind LAN/Tailscale.
- Dark mode — light warm theme only.
- Import from photos/PDF/text, or sites without schema.org Recipe data beyond the meta-tag fallback.
- Multiple shopping lists.

## Codebase touchpoints
- New repo `~/Repos/Rues-Cooking-Hub` (empty: openspec/ + this change). Everything is created.
- Copy from `~/Repos/Rues-Arcade`: vite.config.ts, package.json `imports`, migrations runner + `loadMigrations()`, `scripts/package.mjs` (+ test), `scripts/version.test.ts`, `.github/workflows/{ci,gate,release}.yml`, `.github/dependabot.yml`, `playwright.config.ts` (phone + desktop), `src/lib/motion.ts`, openspec `release` spec. (explorer: model repos)
- Copy from `~/Repos/Life-Manager`: `/__test/{reset,seed}` routes gated by an env flag, e2e `html[data-hydrated]` wait, tokens.css approach, dependabot typescript-major ignore. (explorer: model repos)
- Homelab names this change must use: host `rues-cooking-hub01`, variable `rues_cooking_hub_version`, data dir `/var/lib/rues-cooking-hub/rues-cooking-hub.db`, tarball `rues-cooking-hub-X.Y.Z.tgz`. (explorer: homelab)

## Risks
- R1 Image downscaling needs a library (e.g. sharp, native) inside a tarball built on ubuntu-24.04 and run on Debian 13 x64 → accepted: planner picks; a native dep must be proven by `package` + e2e from the unpacked tarball (gate.yml already does this).
- R2 Recipe sites block server fetches or lack JSON-LD → accepted: S12 fallback; fixtures from 3+ real sites' HTML saved once by the builder (one-time fetch allowed, tests offline).
- R3 Ingredient parsing is fuzzy → accepted: original text always kept and shown in the preview; parse is editable.
- R4 First release v0.1.0 runs before Homelab host_vars exist → bump job fails while publish succeeds → accepted; after the Homelab change merges, later tags bump normally.
- R5 PR CI runs on self-hosted check01, which only serves repos in `check_runner_repos` → resolved: a Homelab chore registers the repo before this change's PR (Rue's choice).
- R6 Fresh repo has no `main` on GitHub; a PR needs one → resolved at ship: on Rue's go, create the public repo and push one empty bootstrap commit on `main` (the only commit on main outside a PR), then the PR from `flow/build-cooking-hub`.
- R7 Animation load (View Transitions, coverflow, parallax, FLIP) vs. jank on phone → accepted: transform/opacity only, reduced-motion path, judged by Rue at the mockup stop and Gate 2.
- R8 Server fetching arbitrary URLs on the LAN (SSRF) → accepted: single user, LAN-only; http(s) only, size and time limits.

## Decisions
- Everything in `decisions.md` holds; key ones: single user, no login; structured ingredients; URL import with preview; English UI; images as BLOB; desktop and phone equal; light warm theme; motion set confirmed by Rue (S8, S15, S16, S18, S21, S22, S31, nav shrink); mockups approved before feature UI.
- Names follow Rues-Arcade: repo `Rue-Asha/Rues-Cooking-Hub` (public, needed for the release download), app title "Rues Cooking Hub", service `rues-cooking-hub`.
- Ship: `ship: merge`, `release: tag` (tag v0.1.0 after merge). Ruleset in Life-Manager shape (required checks), applied on Rue's go.
- Outward steps (each asked when reached): create GitHub repo + bootstrap commit, secrets `HOMELAB_BUMP_APP_ID`/`HOMELAB_BUMP_APP_KEY`, ruleset, push/PR/merge/tag.

## Done when
- Rue approved the mockups (phone + desktop) before feature UI was built.
- `npm run proof:full` is green with a named test per scenario, phone and desktop.
- Rue can import a recipe from a real recipe URL, edit it, tag it, find it by tag and by ingredient search, plan it for a day with 4 servings, and generate a list that shows the scaled, merged ingredients grouped by category.
- The motion set is visible in the running app (`npm run dev`) and calm under reduced motion.
- The PR's checks (`ci / ci`, security-baseline) are green on GitHub, it is merged, and the v0.1.0 release with tarball + .sha256 exists.

## Split off
- **Food Spots** (this repo, later change) — split-food-spots.md.
- **check01 registration** (Homelab-Managment, chore · live, before this change's PR) — add `Rue-Asha/Rues-Cooking-Hub` to `check_runner_repos`, run `check_runner.yml` from the workstation.
- **Homelab service** (Homelab-Managment, feature · live, after tag v0.1.0) — `rues-cooking-hub01` LXC in hosts.auto.tfvars, role `rues_cooking_hub`, playbook `02_SERVICES/rues-cooking-hub.yml`, host_vars with pin v0.1.0 + nginx + sqlite_backups, deploy.yml dispatch option, specs/docs, then `sqlite_backup.yml` by hand (research-infra.md).
- **HTTPS + offline** (Homelab, optional later) — DNS name + certificate would enable PWA/offline and Wake Lock.
