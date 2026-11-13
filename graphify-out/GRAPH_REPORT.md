# Graph Report - Rues-Cooking-Hub  (2026-11-13)

## Corpus Check
- 295 files · ~213,800 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .woff2 3, (none) 1, .css 1)

## Summary
- 2290 nodes · 5173 edges · 143 communities (138 shown, 5 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 486 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c8f3ded`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Tasks: build-cooking-hub (units 1–20)
- shopping.ts
- Repo Docs and Release Runbook
- steps
- Package Manifest and Dependencies
- motion.test.ts
- (app)/recipes/+page.svelte
- vitest
- getDb
- 3. Entities
- import.ts
- Types and Home Tiles
- Product
- new/+page.svelte
- Shopping List Page
- Image Storage and Save
- Featured Coverflow Stack
- Recipe Form and Unsaved Guard
- Plan Page Drag and Drop
- seed/+server.ts
- Design: build-cooking-hub
- Recipe Picker and Rail
- SpotFilters.svelte
- server/spots.ts
- Import E2E and Fixture Server
- E2E Helpers
- ref_types
- Proposal: build-cooking-hub
- motion.ts
- reset
- fixtures.ts
- Add to Plan Dialog
- Plan Entry Component
- permissions
- plan.ts
- bump
- Image Field
- Sections Editor
- Design Tokens
- steps
- Recipe Detail Page
- Spec Coverage E2E
- SQL Schema Migrations
- with
- Plan DnD Module
- svelte
- Harness Specs and Playwright
- AppNav.svelte
- Requirement: Area navigation
- release.yml
- CopyWeek.svelte
- Move To Menu
- Research: Homelab deploy path
- Plan Slot Component
- with
- Recipe Form E2E
- Recipe Image E2E
- Recipe Motion E2E
- check-tag
- Featured E2E
- List Check-off E2E
- Flow Change Config
- OpenSpec Config
- SpotForm.svelte
- Archive Motion E2E
- Nav E2E
- Release Specs
- TypeScript Config
- publish
- Requirement: Area navigation
- Scope: build-cooking-hub
- #lib
- spots/query.ts
- ref_node_sqlite
- Requirement: Servings scaling on the recipe page
- Lentil Soup Photo
- Penne Arrabbiata Photo
- Pumpkin Soup Photo
- Ricotta Pancakes Photo
- Sourdough Photo
- Spaghetti Pomodoro Photo
- Village Salad Photo
- Yoghurt Bowl Photo
- App Type Declarations
- proposal.md
- recipes/save.ts
- form/+page.svelte
- Requirement: Local draft of an unsaved recipe
- Requirement: Sort
- Week.svelte
- score.ts
- tasks.md
- archive-filters.test.ts
- spots-form-errors.test.ts
- Requirement: Add spot form
- Contracts
- draft.test.ts
- open
- ci.yml
- Requirement: Add spot form
- mapsUrl
- Requirements
- __mockups/eating-out/+page.svelte
- Scope: add-food-spots
- Requirement: Spot search and filters
- Requirement: Spot search and filters
- Rues Cooking Hub: functional contract
- 4. Routes
- Requirement: Mockups before feature UI
- @playwright/test
- gate.yml
- 2026-11-03-add-food-spots/proposal.md
- ADDED Requirements
- Requirement: Top spots
- Local draft of unsaved new or imported recipe (localStorage)
- spots-edit.test.ts
- updates
- 2026-11-03-add-food-spots/flow.yaml
- Data layer
- Requirement: Eating Out list
- Requirement: Spot storage
- gate-1-decisions/flow.yaml
- Requirement: Eating Out list
- jobs
- runner
- Requirement: Spot page
- verification.md
- Requirement: Edit spot
- Requirement: Mark visited
- Requirement: Spot cards
- Requirement: Spot sort
- Requirement: Version 0.2.0
- Requirement: Edit spot
- Requirement: Mark visited
- Requirement: Spot sort
- Rues Cooking Hub
- 4.5 `/recipes/[id]` Recipe page
- 0003_food_spots.sql
- Requirement: Spot ranks
- Requirement: Spot photo transition
- Requirement: Spot ranks
- design.test.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 99 edges
2. `@playwright/test` - 48 edges
3. `reducedMotion()` - 47 edges
4. `open()` - 42 edges
5. `svelte` - 41 edges
6. `vitest` - 39 edges
7. `reset()` - 38 edges
8. `Design: build-cooking-hub` - 38 edges
9. `Tasks: build-cooking-hub (units 1–20)` - 37 edges
10. `fold()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Scenario: Migration keeps existing recipe data` --references--> `spots()`  [INFERRED]
  openspec/changes/archive/2026-11-03-add-food-spots/specs/eating-out/spec.md → e2e/spots-form-errors.test.ts
- `Parse on save; parse edited by editing the text` --references--> `parseIngredient()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/design.md → src/lib/ingredients/parse.ts
- `2. Servings scaling` --references--> `scaleIngredient()`  [INFERRED]
  openspec/changes/gate-1-decisions/tasks.md → src/lib/ingredients/scale.ts
- `Error and danger style (no new colours)` --references--> `rise()`  [INFERRED]
  openspec/changes/archive/2026-11-03-add-food-spots/design.md → src/lib/motion.ts
- `node:sqlite with numbered SQL migrations` --references--> `migrate()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/research-stack.md → src/lib/server/db.ts

## Import Cycles
- 2-file cycle: `src/lib/server/recipes.ts -> src/lib/server/tags.ts -> src/lib/server/recipes.ts`

## Hyperedges (group relationships)
- **build-cooking-hub planning artifacts** — openspec_changes_archive_2026_10_20_build_cooking_hub_decisions, openspec_changes_archive_2026_10_20_build_cooking_hub_scope, openspec_changes_archive_2026_10_20_build_cooking_hub_proposal, openspec_changes_archive_2026_10_20_build_cooking_hub_design, openspec_changes_archive_2026_10_20_build_cooking_hub_tasks, openspec_changes_archive_2026_10_20_build_cooking_hub_verification [EXTRACTED 1.00]
- **Recipe → plan → shopping list pipeline** — openspec_specs_recipe_import_spec_read_a_recipe_from_a_page, openspec_specs_recipes_spec_recipe_fields_and_validation, openspec_specs_ingredients_spec_ingredient_line_parser, openspec_specs_meal_plan_spec_plan_entries, openspec_specs_shopping_list_spec_add_from_plan, openspec_specs_shopping_list_spec_recipe_to_list_journey [EXTRACTED 1.00]
- **v0.1.0 ship runbook outward steps** — docs_release_public_repo_bootstrap, docs_release_check_runner_registration, docs_release_bump_secrets, docs_release_main_ruleset, docs_release_release_workflow, docs_release_homelab_service [EXTRACTED 1.00]
- **E2E recipe-import fixture pages (Fixture Kitchen)** — e2e_fixtures_import_broken_image_tomato_soup, e2e_fixtures_import_dessert_tags_plum_crumble, e2e_fixtures_import_lemon_tart_lemon_tart, e2e_fixtures_import_meta_only_grandmas_pie [INFERRED 0.85]
- **E2E test isolation harness** — openspec_specs_harness_spec_test_only_routes, openspec_specs_harness_spec_e2e_projects_and_isolation, openspec_specs_harness_spec_proof_commands [INFERRED 0.85]
- **Gate 1 planner additions in the design** — openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_gate_1_planner_additions, openspec_changes_archive_2026_10_20_build_cooking_hub_design_shopping_amounts_parts, openspec_changes_archive_2026_10_20_build_cooking_hub_design_name_keys, openspec_changes_archive_2026_10_20_build_cooking_hub_design_import_regex_json_ld [INFERRED 0.85]
- **Homelab deploy constraints shaping the app** — openspec_changes_archive_2026_10_20_build_cooking_hub_research_infra_plain_http_secure_context, openspec_changes_archive_2026_10_20_build_cooking_hub_research_infra_systemd_readwritepaths, openspec_changes_archive_2026_10_20_build_cooking_hub_split_homelab_upload_body_limits, openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_images_as_sqlite_blob, openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_plain_http_no_secure_context [INFERRED 0.85]
- **Captured real-site recipe pages for import parser (RecipeTin Eats, Allrecipes, BBC Good Food, Simply Recipes, Eat this!)** — fixtures_import_butter_chicken_recipe, fixtures_import_chocolate_chip_cookies_recipe, fixtures_import_easy_pancakes_recipe, fixtures_import_guacamole_recipe, fixtures_import_no_recipe_eat_this [INFERRED 0.85]
- **Reduced-motion contract across capabilities** — openspec_specs_design_system_spec_motion_module, openspec_specs_navigation_spec_page_transitions, openspec_specs_navigation_spec_area_navigation, openspec_specs_recipe_detail_spec_hero_motion, openspec_specs_archive_spec_archive_grid, openspec_specs_shopping_list_spec_check_off [INFERRED 0.95]

## Communities (143 total, 5 thin omitted)

### Community 0 - "Tasks: build-cooking-hub (units 1–20)"
Cohesion: 0.41
Nodes (21): Tasks: build-cooking-hub (units 1–20), U1 Establish the harness and app foundation, U10 App shell: navigation and page transitions, U11 Recipe form, images and editing, U12 Archive grid, filters, search, sort and favourites, U13 Plan week view, entries and copy week, U14 Import flow, U15 Recipe page (+13 more)

### Community 1 - "shopping.ts"
Cohesion: 0.06
Nodes (65): Gate 1 planner additions (a, c–g accepted; German units declined), Server function stubs and owners (U5–U19), Unit table for parse.ts (g, kg, ml, l, tsp, tbsp, cup, …; families g/kg, ml/l), R3 ingredient parsing is fuzzy, shopping-list delta spec (ADDED Requirements), Context, Contracts, Decisions (+57 more)

### Community 2 - "Repo Docs and Release Runbook"
Cohesion: 0.05
Nodes (43): E2E_APP_DIR (e2e against unpacked tarball in CI), E2E reset helper and /__test/* routes (COOKING_HUB_TEST=1), npm run package (release tarball + sha256), OpenSpec capability specs (archive, recipe-import, meal-plan, shopping-list, ...), Playwright projects phone (390x844 touch) and desktop (1280x800), npm run proof (svelte-check, build, vitest), npm run proof:full (proof + Playwright e2e), Rues Cooking Hub (project) (+35 more)

### Community 3 - "steps"
Cohesion: 0.31
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 4 - "Package Manifest and Dependencies"
Cohesion: 0.05
Nodes (45): markdown-it (Markdown, raw HTML disabled), SvelteKit 3 with #lib imports and no svelte.config.js, dependencies, sharp@^0.35.5, devDependencies, markdown-it@^15.0.3, @playwright/test@^1.64.0, svelte@^5.57.2 (+37 more)

### Community 5 - "motion.test.ts"
Cohesion: 0.14
Nodes (13): animatedProperties(), files, heightExceptions, inlineSizeExceptions, node, offenders(), primitives, sourceFiles() (+5 more)

### Community 6 - "(app)/recipes/+page.svelte"
Cohesion: 0.05
Nodes (33): slideOut(), stagger(), arrival(), clear(), { data }, emptySide, intro, introDelay (+25 more)

### Community 7 - "vitest"
Cohesion: 0.07
Nodes (24): port, screens, vitest, hash, root, staging, { version }, { version } (+16 more)

### Community 8 - "getDb"
Cohesion: 0.09
Nodes (42): Favourites (archive), add(), clock, tagId(), getDb(), recipe(), imageRows(), recipe() (+34 more)

### Community 9 - "3. Entities"
Cohesion: 0.18
Nodes (11): 3. Entities, Category memory, Dashboard (derived, not stored), Image, Ingredient section and ingredient line, Plan entry, Recipe, Recipe draft (browser-local, not stored on the server) (+3 more)

### Community 10 - "import.ts"
Cohesion: 0.11
Nodes (36): R8 SSRF from server-side fetch, recipe-import delta spec (ADDED Requirements), recipe-import Specification, Import fallback (recipe-import), Import flow (recipe-import), Read a recipe from a page (recipe-import), asArray(), clean() (+28 more)

### Community 11 - "Types and Home Tiles"
Cohesion: 0.10
Nodes (20): Follow-up: hard-coded animation durations outside tokens, Bento dashboard (home), { recipe, named = true }, frame, { hero }, label, recipe, split (+12 more)

### Community 12 - "Product"
Cohesion: 0.18
Nodes (10): Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product, Product Principles (+2 more)

### Community 13 - "new/+page.svelte"
Cohesion: 0.14
Nodes (10): { data, form }, duplicate, edited, invalid, preview, previewEl, reading, revealed (+2 more)

### Community 14 - "Shopping List Page"
Cohesion: 0.06
Nodes (31): amount, {
		item,
		done = false,
		editing = false,
		moving = false,
		error = null,
		onedit,
		oncancel,
		onmove,
		submitCheck,
		submitEdit
	}, nameInput, ownPart, planPart, rise(), ShoppingItem, arrive() (+23 more)

### Community 15 - "Image Storage and Save"
Cohesion: 0.15
Nodes (18): jpeg(), sharp (image downscaling dependency), Recipe images (recipes), sharp, ImageError, downscale(), FETCH_TIMEOUT_MS, FORMATS (+10 more)

### Community 16 - "Featured Coverflow Stack"
Cohesion: 0.06
Nodes (45): Archive sort label renamed to Total time, Archive state in the URL (?tags, fav, q, sort), archive delta spec (ADDED Requirements), archive Specification, Archive grid (archive), Featured stack (archive), Filters (archive), Sort (archive) (+37 more)

### Community 17 - "Recipe Form and Unsaved Guard"
Cohesion: 0.08
Nodes (23): cookMinutes, description, dismissed, {
		draft,
		tags,
		errors = {},
		action = '',
		heading = 'Recipe',
		notice = null,
		cancelHref = '/recipes'
	}, FormDraft, guard, imagePicked, imageRemoved (+15 more)

### Community 18 - "Plan Page Drag and Drop"
Cohesion: 0.10
Nodes (24): land(), placed(), placeKey(), board, copying, { data }, direction, drag (+16 more)

### Community 19 - "seed/+server.ts"
Cohesion: 0.14
Nodes (22): Search (archive), Tag manager (tags), findBySourceUrl(), refreshSearchText(), refreshSpotSearchText(), deleteTag(), listTags(), recipesWith() (+14 more)

### Community 20 - "Design: build-cooking-hub"
Cohesion: 0.11
Nodes (21): Design: build-cooking-hub, Alignment rule: one centred 1200px column, Motion set table (S7, S8, S15, S16, S18, S21, S22, S31), Palette: cream/sand ground, olive + brick accents, one dark tile, glass, Shared Sheet dialog (bottom sheet on phone), RecipeForm + saveFromForm shared by manual form and import preview, Design risks R1–R8 and mitigations, Routes and owners table (+13 more)

### Community 21 - "Recipe Picker and Rail"
Cohesion: 0.09
Nodes (19): getBoard(), current, dayName, error, mode, query, selected, servings (+11 more)

### Community 22 - "SpotFilters.svelte"
Cohesion: 0.09
Nodes (22): spotHeroName(), locationText(), PRICES, priceText(), SPOT_SORTS, { spot }, chips, cityName (+14 more)

### Community 23 - "server/spots.ts"
Cohesion: 0.07
Nodes (62): Schema — `migrations/0003_food_spots.sql` ⚠ irreversible on Rue's database once deployed, 1. Spot data layer, migration and test routes (contract), 3. Eating Out mockup and CC0 photos (taste stop), 4. Eating Out list: segments, cards, filters, sort and ranks, 5. Spot form: add and edit, 6. Spot page, delete and Mark visited, 7. Home "Top spots" and version 0.2.0, @sveltejs/kit (+54 more)

### Community 24 - "Import E2E and Fixture Server"
Cohesion: 0.14
Nodes (10): dirs, FixtureServer, jpeg(), page(), startFixtureServer(), field(), importIt(), port (+2 more)

### Community 25 - "E2E Helpers"
Cohesion: 0.14
Nodes (11): setToday(), row(), rows(), toBuy(), category(), row(), toBuy(), days (+3 more)

### Community 26 - "ref_types"
Cohesion: 0.25
Nodes (9): Test-only routes (harness), setTestToday(), resetDb(), requireTestFlag(), testFlag(), load(), run(), POST() (+1 more)

### Community 27 - "Proposal: build-cooking-hub"
Cohesion: 0.14
Nodes (26): Proposal: build-cooking-hub, Done criteria (mockups approved, proof:full green, v0.1.0 released), Foundation S1–S8, Recipe archive S9–S22, home delta spec (ADDED Requirements), ingredients delta spec (ADDED Requirements), navigation delta spec (ADDED Requirements), recipes delta spec (ADDED Requirements) (+18 more)

### Community 28 - "motion.ts"
Cohesion: 0.06
Nodes (38): busy, enter(), exit(), from, message, ranges, scrim(), to (+30 more)

### Community 29 - "reset"
Cohesion: 0.15
Nodes (5): reset(), seed(), port, seedPancakes(), full

### Community 30 - "fixtures.ts"
Cohesion: 0.06
Nodes (44): byId(), checked, detail, fallbackDraft, featured, importDraft, list, MockDay (+36 more)

### Community 31 - "Add to Plan Dialog"
Cohesion: 0.12
Nodes (14): added, date, days, direction, error, fmt(), monday, {
		open,
		title,
		servings: recipeServings,
		today,
		onclose
	} (+6 more)

### Community 32 - "Plan Entry Component"
Cohesion: 0.14
Nodes (11): board, close(), dragging, { entry }, error, mode, onkeydown(), pop() (+3 more)

### Community 33 - "permissions"
Cohesion: 0.29
Nodes (8): permissions, permissions, permissions, actions, attestations, contents, id-token, permissions

### Community 34 - "plan.ts"
Cohesion: 0.07
Nodes (55): Shared hero view transition recipe-hero-<id>, recipe-detail delta spec (ADDED Requirements), MODIFIED Requirements, Requirement: Test-only routes, Scenario: Reset leaves an empty archive with the starter tags, Scenario: Seed returns the ids of what it inserted, Scenario: Seeded spots carry their photos, Scenario: Test clock sets today (+47 more)

### Community 35 - "bump"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 36 - "Image Field"
Cohesion: 0.15
Nodes (14): forget(), hasImage, {
		imageId = null,
		url = $bindable(''),
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		onchange
	}, linkPreview, localError, message, objectUrl, onFile() (+6 more)

### Community 37 - "Sections Editor"
Cohesion: 0.16
Nodes (12): addLine(), addSection(), collapse(), EditorLine, EditorSection, examples, { kind, sections = $bindable() }, nextId() (+4 more)

### Community 38 - "Design Tokens"
Cohesion: 0.19
Nodes (12): colors, ColorToken, glass, glassText, Rgba, scrim, black, channel() (+4 more)

### Community 39 - "steps"
Cohesion: 0.13
Nodes (15): name, runs-on, steps, jobs, ci, name, run, uses (+7 more)

### Community 40 - "Recipe Detail Page"
Cohesion: 0.14
Nodes (11): { data }, dayLabel(), deleting, fmt(), next, offsets, planning, recipe (+3 more)

### Community 41 - "Spec Coverage E2E"
Cohesion: 0.22
Nodes (6): card(), grid(), slot(), titles(), Counted, Layer 2: spec coverage (249 scenarios: 96 unit, 125 e2e, 28 manual; no gaps)

### Community 42 - "SQL Schema Migrations"
Cohesion: 0.23
Nodes (12): tags, category_memory, images, ingredient_lines, plan_entries, plan_entries_day, recipe_tags, recipes (+4 more)

### Community 43 - "with"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 44 - "Plan DnD Module"
Cohesion: 0.14
Nodes (13): Board, Dragged, ghost(), glide(), grab, grabbed(), KEY, landed() (+5 more)

### Community 45 - "svelte"
Cohesion: 0.07
Nodes (31): Components: GlassPanel, PillNav, ArrowButton, RoundNav, Card, Chip, Button, Kicker, Counter, Tile, ImagePlaceholder, Route layout: (app) group holds the nav; /__mockups and /__test outside, Shared components (design-system), svelte, { id, imageId, children }, icon, iconSize, {
		label,
		href,
		variant = 'dark',
		direction = 'right',
		size = 'md',
		decorative = false,
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	} (+23 more)

### Community 46 - "Harness Specs and Playwright"
Cohesion: 0.33
Nodes (8): harness delta spec (ADDED Requirements), harness Specification, E2E projects and isolation (harness), Harness declaration (harness), Package script (harness), Proof commands (harness), db, port

### Community 47 - "AppNav.svelte"
Cohesion: 0.12
Nodes (19): transitions(), Components, Codebase touchpoints, 2. Nav area, divider and area-aware header actions, activeArea(), Area, areas, HeaderAction (+11 more)

### Community 48 - "Requirement: Area navigation"
Cohesion: 0.12
Nodes (15): ADDED Requirements, MODIFIED Requirements, Requirement: Area navigation, Requirement: Search recipes focuses the search field, Scenario: Active area is marked, Scenario: Compact tab bar shows icons only, Scenario: Desktop shows the top pill nav, Scenario: Nav marks the open area (+7 more)

### Community 49 - "release.yml"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 50 - "CopyWeek.svelte"
Cohesion: 0.18
Nodes (7): at, confirming, direction, message, {
		open,
		monday,
		today,
		existing,
		sources,
		onclose
	}, source, submitting

### Community 51 - "Move To Menu"
Cohesion: 0.15
Nodes (14): meal-plan delta spec (ADDED Requirements), meal-plan Specification, Copy week (meal-plan), Moving entries (meal-plan), Week view (meal-plan), Place, current, date (+6 more)

### Community 52 - "Research: Homelab deploy path"
Cohesion: 0.10
Nodes (13): Explore decisions (build-cooking-hub), Food Spots area (split off), Non-goals (Food Spots, Homelab, cook mode, PWA, login, dark mode, …), Research: Homelab deploy path, Homelab-side steps (LXC, role, playbook, host_vars), nginx :80 → app, plain HTTP, no TLS, Runtime env contract (HOST, PORT, DATABASE_PATH, PROTOCOL_HEADER), sqlite_backups cover .db files only (+5 more)

### Community 53 - "Plan Slot Component"
Cohesion: 0.20
Nodes (7): receive, send, before, board, {
		date,
		dayName,
		slot,
		index,
		entries,
		onadd
	}, dragged, target

### Community 54 - "with"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 55 - "Recipe Form E2E"
Cohesion: 0.28
Nodes (4): port, recipeCount(), rows(), tagNamesOf()

### Community 56 - "Recipe Image E2E"
Cohesion: 0.28
Nodes (5): imageCount(), newForm(), port, recipes(), rows()

### Community 57 - "Recipe Motion E2E"
Cohesion: 0.25
Nodes (5): Call, long, media(), Recorded, transform()

### Community 58 - "check-tag"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 59 - "Featured E2E"
Cohesion: 0.36
Nodes (5): counter(), front(), Recorded, stack(), stage()

### Community 60 - "List Check-off E2E"
Cohesion: 0.13
Nodes (3): calm(), items, port

### Community 61 - "Flow Change Config"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 62 - "OpenSpec Config"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 63 - "SpotForm.svelte"
Cohesion: 0.07
Nodes (25): address, city, dismissed, {
		draft,
		tags,
		errors = {},
		heading = 'Add spot',
		notice = null,
		cancelHref = '/eating-out'
	}, emptySpot(), guard, imagePicked, imageRemoved (+17 more)

### Community 64 - "Archive Motion E2E"
Cohesion: 0.38
Nodes (4): gliding(), grid(), three, titles()

### Community 65 - "Nav E2E"
Cohesion: 0.33
Nodes (4): barState(), labels, nav(), paths

### Community 66 - "Release Specs"
Cohesion: 0.36
Nodes (8): version, release delta spec (ADDED Requirements), release Specification, CI workflow (release), Dependabot (release), Release runbook (release), Release workflow (release), Version 0.1.0 (release)

### Community 67 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 68 - "publish"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 69 - "Requirement: Area navigation"
Cohesion: 0.09
Nodes (22): ADDED Requirements, MODIFIED Requirements, Requirement: Area-aware header actions, Requirement: Area navigation, Requirement: Desktop header fits at 1024 px, Scenario: Active area is marked, Scenario: Active pill lands on Eating Out, Scenario: Compact tab bar shows icons only (+14 more)

### Community 70 - "Scope: build-cooking-hub"
Cohesion: 0.14
Nodes (14): Research: Mobbin references, Feature references (Crouton, Recime, NYT Cooking, Julienne, Centr), Motion references (card → detail, check-off fill-strike-move, drag ghost), Visual references (Daylight, Crouton glass tab bar, Apple News hero, pillowtalk bento), Scope: build-cooking-hub, Entity model (Recipe n:m Tag, PlanEntry, ShoppingItem, CategoryMemory), Home S32, Meal plan S23–S27 (+6 more)

### Community 71 - "#lib"
Cohesion: 0.12
Nodes (11): closing, {
		open,
		title,
		label = title,
		kicker,
		onclose,
		children
	}, { open, title, usage, onclose }, submitting, { open, name, onclose }, submitting, error, { open, name, onclose } (+3 more)

### Community 72 - "spots/query.ts"
Cohesion: 0.17
Nodes (19): Decisions, Desktop header fit (S17), Narrowest card, Phone bar fit (R1), asPrice(), defaultSort(), defaultStatus(), hasSpotFilters() (+11 more)

### Community 73 - "ref_node_sqlite"
Cohesion: 0.11
Nodes (4): port, port, port, port

### Community 74 - "Requirement: Servings scaling on the recipe page"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: No planned status on the recipe page, Requirement: Servings scaling on the recipe page, Scenario: Invalid scale target leaves the line unchanged, Scenario: Invalid scale value is rejected, Scenario: Lines without quantity and the recipe's own servings stay unchanged, Scenario: Planned recipe shows no planned status, Scenario: Scale control updates the ingredients (+3 more)

### Community 75 - "Lentil Soup Photo"
Cohesion: 0.50
Nodes (4): Dark Moody Food Styling, Lentil Soup Mockup Photo, Red Lentil Soup with Croutons, Rustic Bread Slices

### Community 76 - "Penne Arrabbiata Photo"
Cohesion: 0.50
Nodes (4): Bright Overhead Food Styling, Penne Arrabbiata Mockup Photo, Penne Arrabbiata Ingredients (Pan), Vine Tomatoes and Basil

### Community 77 - "Pumpkin Soup Photo"
Cohesion: 0.67
Nodes (3): Pumpkin Soup Mockup Photo, Pumpkin Soup with Croutons, Shallow Depth-of-Field Close-up

### Community 78 - "Ricotta Pancakes Photo"
Cohesion: 0.67
Nodes (3): Ricotta Pancakes Mockup Photo, Ricotta Pancake Stack, Overhead on Wooden Table

### Community 79 - "Sourdough Photo"
Cohesion: 0.67
Nodes (3): Sourdough Mockup Photo, Minimal Linen Styling, Rustic Sourdough Loaf

### Community 80 - "Spaghetti Pomodoro Photo"
Cohesion: 0.67
Nodes (3): Dark Wood Table Setting, Spaghetti Pomodoro Mockup Photo, Spaghetti Pomodoro Bowl

### Community 81 - "Village Salad Photo"
Cohesion: 0.67
Nodes (3): Village Salad Mockup Photo, Rustic Table with Fork and Towel, Village Salad (Spinach, Feta, Tomato)

### Community 82 - "Yoghurt Bowl Photo"
Cohesion: 0.67
Nodes (3): Breakfast Close-up Styling, Yoghurt Bowl with Fruit, Granola and Nuts, Yoghurt Bowl Mockup Photo

### Community 84 - "proposal.md"
Cohesion: 0.20
Nodes (9): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 85 - "recipes/save.ts"
Cohesion: 0.10
Nodes (22): jpeg(), Follow-up: 310+ digit minutes/servings → Infinity → uncaught ValidationError (500), Impact, COPY, minutes(), Resolved, resolveImage(), Saved (+14 more)

### Community 87 - "Requirement: Local draft of an unsaved recipe"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Local draft of an unsaved recipe, Scenario: Clearing removes the draft, Scenario: Draft round-trips through storage, Scenario: Draft survives a reload, Scenario: Imported preview survives a reload, Scenario: Save and discard clear the draft, Scenario: Unchanged form keeps no draft (+1 more)

### Community 88 - "Requirement: Sort"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Sort, Scenario: Newest first by default, Scenario: Sort by title, Scenario: Sort by total time puts recipes without time last, Scenario: Sort choice in the archive, Scenario: Total time label

### Community 89 - "Week.svelte"
Cohesion: 0.18
Nodes (12): day(), {
		days,
		today,
		entries,
		onadd
	}, label(), weekNumber(), weekRange(), AddFromPlanResult, IsoDate, Recipe (+4 more)

### Community 90 - "score.ts"
Cohesion: 0.14
Nodes (17): Requirement: Score input and display, Scenario: Invalid score keeps the other values, Scenario: Invalid scores are rejected, Scenario: Score field uses the decimal keyboard, Scenario: Score is stored without drift, Scenario: Scores display with two decimals and a dot, Scenario: Valid scores parse to hundredths, Requirement: Score input and display (+9 more)

### Community 91 - "tasks.md"
Cohesion: 0.40
Nodes (4): 2. Servings scaling, 3. Draft storage, 4. Verify, 5. Hand-off to the redesign (not built here)

### Community 93 - "spots-form-errors.test.ts"
Cohesion: 0.15
Nodes (12): port, rows(), spotCount(), spots(), Requirement: Spot storage, Scenario: Deleting a spot removes its photo and tag links, Scenario: Duplicate spot names are allowed, Scenario: Invalid spot rows are refused by the database (+4 more)

### Community 94 - "Requirement: Add spot form"
Cohesion: 0.12
Nodes (16): name(), Form save — `src/lib/spots/save.ts` (server-only imports, used from `+page.server.ts`), Scenario: Server rejects invalid spot input, Requirement: Add spot form, Scenario: Empty name blocks saving a spot, Scenario: Leaving the spot form with unsaved changes asks first, Scenario: Leaving the untouched spot form does not ask, Scenario: New spot defaults to Want to go (+8 more)

### Community 95 - "Contracts"
Cohesion: 0.13
Nodes (14): Context, Contracts, Copy (`src/lib/copy.ts`, unit 1; corrections after the mockup stop: unit 4 only), Error and danger style (no new colours), Goals / Non-Goals, Migration Plan, Mockup approval, Open Questions (+6 more)

### Community 96 - "draft.test.ts"
Cohesion: 0.25
Nodes (12): 1. Contracts, clearDraft(), DraftStorage, isDraftWorthKeeping(), loadDraft(), RecipeFormDraft, saveDraft(), StoredDraft (+4 more)

### Community 97 - "open"
Cohesion: 0.19
Nodes (8): open(), entries(), openCopy(), slot(), Call, Recorded, recordTransitions(), shared()

### Community 98 - "ci.yml"
Cohesion: 0.17
Nodes (11): concurrency, cancel-in-progress, group, name, on, pull_request, push, permissions (+3 more)

### Community 99 - "Requirement: Add spot form"
Cohesion: 0.17
Nodes (12): Requirement: Add spot form, Scenario: Empty name blocks saving a spot, Scenario: Leaving the spot form with unsaved changes asks first, Scenario: Leaving the untouched spot form does not ask, Scenario: New spot defaults to Want to go, Scenario: Price level can be cleared, Scenario: Score field appears only for Visited, Scenario: Spot created with all fields (+4 more)

### Community 100 - "mapsUrl"
Cohesion: 0.18
Nodes (12): Scenario: External links open in a new tab, Scenario: Maps link is built from name, address and city, Requirement: Spot page, Scenario: Delete a spot from its page, Scenario: External links open in a new tab, Scenario: Maps link is built from name, address and city, Scenario: Missing address, website and notes hide their rows, Scenario: Spot page makes no external requests (+4 more)

### Community 101 - "Requirements"
Cohesion: 0.17
Nodes (11): eating-out Specification, Purpose, Requirement: Eating Out looks like the approved mockup, Requirement: Spot cards, Requirements, Scenario: Eating Out matches the approved mockup, Scenario: Location text joins what exists, Scenario: Long spot names are clamped (+3 more)

### Community 102 - "__mockups/eating-out/+page.svelte"
Cohesion: 0.27
Nodes (8): location(), MockSpot, priceLevels, spotTagChips, topSpots, visited, want, formTags

### Community 103 - "Scope: add-food-spots"
Cohesion: 0.18
Nodes (10): Decisions, Done when, Entity model (confirmed with Rue), Flows, In scope, Non-goals, Problem, Risks (+2 more)

### Community 104 - "Requirement: Spot search and filters"
Cohesion: 0.18
Nodes (11): Requirement: Spot search and filters, Scenario: Filtering by city updates cards and counts, Scenario: Filters offer only values in use, Scenario: No spot match offers to clear filters, Scenario: Search from Eating Out, Scenario: Search spots focuses the spot search, Scenario: Segment counts follow the filters, Scenario: Spot filters combine within the segment (+3 more)

### Community 105 - "Requirement: Spot search and filters"
Cohesion: 0.18
Nodes (11): Requirement: Spot search and filters, Scenario: Filtering by city updates cards and counts, Scenario: Filters offer only values in use, Scenario: No spot match offers to clear filters, Scenario: Search from Eating Out, Scenario: Search spots focuses the spot search, Scenario: Segment counts follow the filters, Scenario: Spot filters combine within the segment (+3 more)

### Community 106 - "Rues Cooking Hub: functional contract"
Cohesion: 0.20
Nodes (9): 10. Gate-1 decisions, 1. Purpose and usage context, 2. Jobs-to-be-done, 6. Copy list, 7. Behavioral `data-*` allow-list, 8. Route coverage check, 9. Graph notes, Rues Cooking Hub: functional contract (+1 more)

### Community 107 - "4. Routes"
Cohesion: 0.20
Nodes (10): 4.10 `/list` Shopping list, 4.11 Non-page endpoints, 4.1 `/` Home, 4.2 `/recipes` Archive, 4.6 The recipe form (used by `/recipes/new` preview, `/recipes/new/form`, `/recipes/[id]/edit`), 4.7 `/recipes/[id]/edit` Edit recipe, 4.8 `/recipes/tags` Manage tags, 4.9 `/plan` Meal plan (+2 more)

### Community 108 - "Requirement: Mockups before feature UI"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Mockups before feature UI, Scenario: Eating Out mockup loads only local resources, Scenario: Every mockup photo is credited, Scenario: Main screens share one alignment rule, Scenario: Mockup routes are hidden without the test flag, Scenario: Mockup screenshots are produced for both viewports, Scenario: Requested changes revise the mockups (+1 more)

### Community 109 - "@playwright/test"
Cohesion: 0.25
Nodes (3): rename(), row(), @playwright/test

### Community 110 - "gate.yml"
Cohesion: 0.22
Nodes (7): name, permissions, contents, Research: model repos Life-Manager + Rues-Arcade, CI + release pattern (gate.yml, release.yml, bump-pin), Harness pattern (proof, proof:full, package, test routes), node:sqlite with numbered SQL migrations

### Community 111 - "2026-11-03-add-food-spots/proposal.md"
Cohesion: 0.22
Nodes (8): Appetite, Capabilities, Done criteria, Modified Capabilities, New Capabilities, Non-Goals, What Changes, Why

### Community 112 - "ADDED Requirements"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: Eating Out looks like the approved mockup, Requirement: Spot photo transition, Scenario: Card and spot page share the photo, Scenario: Eating Out matches the approved mockup, Scenario: Reduced motion skips the spot shared element, Scenario: Spot photo carries over smoothly, Scenario: Spot without photo morphs its placeholder

### Community 113 - "Requirement: Top spots"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: Top spots, Scenario: Fewer than four visited spots shows what exists, Scenario: Home shows Top spots after Recently added, Scenario: No visited spot hides Top spots, Scenario: Top spots look like the approved mockup, Scenario: Top spots query returns the four best visited spots, Scenario: Top spots row lays out like Recently added

### Community 114 - "Local draft of unsaved new or imported recipe (localStorage)"
Cohesion: 0.25
Nodes (8): 4.3 `/recipes/new` Import a recipe, 4.4 `/recipes/new/form` Write a recipe, 5. Cross-cutting behavior, Draft storage helper src/lib/recipes/draft.ts (injected storage), Local draft of unsaved new or imported recipe (localStorage), Navigation offers Home, Add recipe, Search recipes at every width, Accessibility target WCAG 2.2 AA, Accessibility & Inclusion

### Community 115 - "spots-edit.test.ts"
Cohesion: 0.29
Nodes (3): port, rows(), stored()

### Community 116 - "updates"
Cohesion: 0.25
Nodes (8): dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem, schedule

### Community 117 - "2026-11-03-add-food-spots/flow.yaml"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 118 - "Data layer"
Cohesion: 0.25
Nodes (7): Codebase (explorer reports), Data layer, Design system, Mobbin (iOS; apps confirmed: Beli, Places, corner, Swarm, The Infatuation, Google Maps, Mindtrip), Navigation, Research: add-food-spots (explore, 2026-11-02), q()

### Community 119 - "Requirement: Eating Out list"
Cohesion: 0.25
Nodes (8): Requirement: Eating Out list, Scenario: Default segment follows what exists, Scenario: Eating Out view survives reload and back, Scenario: Empty Eating Out invites the first spot, Scenario: Empty side shows a short line, Scenario: Phone page carries Add spot, Scenario: Visited is the default segment, Scenario: Want to go opens when nothing is visited

### Community 120 - "Requirement: Spot storage"
Cohesion: 0.25
Nodes (8): Requirement: Spot storage, Scenario: Deleting a spot removes its photo and tag links, Scenario: Duplicate spot names are allowed, Scenario: Invalid spot rows are refused by the database, Scenario: Migration keeps existing recipe data, Scenario: Spot tag names are reused ignoring case, Scenario: Spot tags stay apart from recipe tags, Scenario: Unused spot tag drops out

### Community 121 - "gate-1-decisions/flow.yaml"
Cohesion: 0.25
Nodes (7): base, decisions, gate0, gate1, learnings, track, triage

### Community 122 - "Requirement: Eating Out list"
Cohesion: 0.25
Nodes (8): Requirement: Eating Out list, Scenario: Default segment follows what exists, Scenario: Eating Out view survives reload and back, Scenario: Empty Eating Out invites the first spot, Scenario: Empty side shows a short line, Scenario: Phone page carries Add spot, Scenario: Visited is the default segment, Scenario: Want to go opens when nothing is visited

### Community 123 - "jobs"
Cohesion: 0.29
Nodes (7): uses, with, jobs, ci, security-baseline, uses, runner

### Community 124 - "runner"
Cohesion: 0.29
Nodes (7): runner, on, workflow_call, description, required, type, inputs

### Community 125 - "Requirement: Spot page"
Cohesion: 0.29
Nodes (7): Requirement: Spot page, Scenario: Delete a spot from its page, Scenario: Missing address, website and notes hide their rows, Scenario: Spot page makes no external requests, Scenario: Spot page shows hero, panel, rows and actions, Scenario: Spot page without photo shows the placeholder hero, Scenario: Unknown spot answers 404

### Community 126 - "verification.md"
Cohesion: 0.29
Nodes (6): Diffstat, Layer 1: PORT=4700 npm run proof:full: ok, Layer 2: spec coverage, Manual checklist, Review, Screenshots (untracked, from this run)

### Community 128 - "Requirement: Edit spot"
Cohesion: 0.33
Nodes (6): Requirement: Edit spot, Scenario: Editing a deleted spot answers 404, Scenario: Removing the spot photo deletes the image, Scenario: Spot edit changes are saved, Scenario: Switching to Visited requires a score, Scenario: Switching to Want to go clears the score

### Community 129 - "Requirement: Mark visited"
Cohesion: 0.33
Nodes (6): Requirement: Mark visited, Scenario: Cancel leaves the spot unchanged, Scenario: Invalid score keeps the sheet open, Scenario: Mark visited from the spot page, Scenario: Mark visited is refused for a spot that is already visited, Scenario: Mark visited stores status and score

### Community 130 - "Requirement: Spot cards"
Cohesion: 0.33
Nodes (6): Requirement: Spot cards, Scenario: Location text joins what exists, Scenario: Long spot names are clamped, Scenario: Sparse card shows no empty parts, Scenario: Spot grid fits narrow phones, Scenario: Visited card shows photo, name, tags, location, price and score

### Community 131 - "Requirement: Spot sort"
Cohesion: 0.33
Nodes (6): Requirement: Spot sort, Scenario: Name and newest sorts, Scenario: Score sort orders ties by name, Scenario: Segment switch resets an invalid sort, Scenario: Sort defaults per segment, Scenario: Want to go offers no score sort

### Community 132 - "Requirement: Version 0.2.0"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.2.0, Scenario: Package and lockfile carry 0.2.0, Scenario: Release v0.2.0 published

### Community 133 - "Requirement: Edit spot"
Cohesion: 0.33
Nodes (6): Requirement: Edit spot, Scenario: Editing a deleted spot answers 404, Scenario: Removing the spot photo deletes the image, Scenario: Spot edit changes are saved, Scenario: Switching to Visited requires a score, Scenario: Switching to Want to go clears the score

### Community 134 - "Requirement: Mark visited"
Cohesion: 0.33
Nodes (6): Requirement: Mark visited, Scenario: Cancel leaves the spot unchanged, Scenario: Invalid score keeps the sheet open, Scenario: Mark visited from the spot page, Scenario: Mark visited is refused for a spot that is already visited, Scenario: Mark visited stores status and score

### Community 135 - "Requirement: Spot sort"
Cohesion: 0.33
Nodes (6): Requirement: Spot sort, Scenario: Name and newest sorts, Scenario: Score sort orders ties by name, Scenario: Segment switch resets an invalid sort, Scenario: Sort defaults per segment, Scenario: Want to go offers no score sort

### Community 136 - "Rues Cooking Hub"
Cohesion: 0.40
Nodes (4): Harness, Learnings, Rues Cooking Hub, Specs

### Community 137 - "4.5 `/recipes/[id]` Recipe page"
Cohesion: 0.40
Nodes (5): 4.5 `/recipes/[id]` Recipe page, OpenSpec change gate-1-decisions, Recipe page planned status dropped, scaleIngredient(line, from, to) planned module src/lib/ingredients/scale.ts, Servings scaling on the recipe page (scaleIngredient, view only)

### Community 138 - "0003_food_spots.sql"
Cohesion: 0.70
Nodes (4): spot_tag_links, spot_tags, spots, spots_status

### Community 139 - "Requirement: Spot ranks"
Cohesion: 0.40
Nodes (5): Requirement: Spot ranks, Scenario: Equal scores share a rank, Scenario: Other sorts show no rank, Scenario: Ranks recount within the filters, Scenario: Ranks show while sorted by score

### Community 140 - "Requirement: Spot photo transition"
Cohesion: 0.40
Nodes (5): Requirement: Spot photo transition, Scenario: Card and spot page share the photo, Scenario: Reduced motion skips the spot shared element, Scenario: Spot photo carries over smoothly, Scenario: Spot without photo morphs its placeholder

### Community 141 - "Requirement: Spot ranks"
Cohesion: 0.40
Nodes (5): Requirement: Spot ranks, Scenario: Equal scores share a rank, Scenario: Other sorts show no rank, Scenario: Ranks recount within the filters, Scenario: Ranks show while sorted by score

## Ambiguous Edges - Review These
- `app.html document shell` → `Wait for html[data-hydrated] before interacting`  [AMBIGUOUS]
  src/app.html · relation: conceptually_related_to

## Knowledge Gaps
- **44 isolated node(s):** `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)`, `Import fixture: Butter Chicken (RecipeTin Eats, Yoast @graph)`, `Import fixture: Best Chocolate Chip Cookies (Allrecipes, top-level array, Recipe+NewsArticle type)` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1091 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `U3 CI, release workflow and the Ship runbook` connect `Tasks: build-cooking-hub (units 1–20)` to `release.yml`, `Release Specs`, `gate.yml`, `ci.yml`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `shopping.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056962025316455694 - nodes in this community are weakly interconnected._
- **Why does `jobs` connect `release.yml` to `check-tag`, `bump`, `publish`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Repo Docs and Release Runbook` be split into smaller, more focused modules?**
  _Cohesion score 0.051418439716312055 - nodes in this community are weakly interconnected._
- **Why does `spots()` connect `spots-form-errors.test.ts` to `Requirement: Spot storage`, `AppNav.svelte`, `Data layer`, `server/spots.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `app.html document shell` and `Wait for html[data-hydrated] before interacting`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._