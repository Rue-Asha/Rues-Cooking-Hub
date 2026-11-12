# Graph Report - Rues-Cooking-Hub  (2026-11-12)

## Corpus Check
- 231 files · ~162,619 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .woff2 3, (none) 1, .css 1)

## Summary
- 1654 nodes · 3935 edges · 93 communities (87 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 359 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c975adb9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Build Unit Plan
- shopping.ts
- Repo Docs and Release Runbook
- steps
- Package Manifest and Dependencies
- motion.test.ts
- (app)/recipes/+page.svelte
- Database and Test Infra
- recipes.ts
- 4. Routes
- Recipe Import Reader
- Types and Home Tiles
- Product
- new/+page.svelte
- Shopping List Page
- Image Storage and Save
- Featured Coverflow Stack
- Recipe Form and Unsaved Guard
- Plan Page Drag and Drop
- types.ts
- Design: build-cooking-hub
- Recipe Picker and Rail
- Explore decisions (build-cooking-hub)
- Plan Server and Copy
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
- plan/+page.server.ts
- bump
- Image Field
- Sections Editor
- Design Tokens
- package.mjs
- Recipe Detail Page
- Spec Coverage E2E
- SQL Schema Migrations
- with
- Plan DnD Module
- Icon.svelte
- Harness Specs and Playwright
- [id]/+page.server.ts
- Requirement: Area navigation
- release.yml
- Button.svelte
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
- formatAmounts
- Archive Motion E2E
- Nav E2E
- Release Specs
- TypeScript Config
- publish
- Board
- Scope: build-cooking-hub
- runtime Specification
- List From Plan E2E
- List E2E
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
- edit/+page.svelte
- form/+page.svelte
- Requirement: Local draft of an unsaved recipe
- Requirement: Sort
- Week.svelte
- shopping-list Specification
- tasks.md
- archive-filters.test.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 78 edges
2. `reducedMotion()` - 45 edges
3. `svelte` - 38 edges
4. `Design: build-cooking-hub` - 38 edges
5. `Tasks: build-cooking-hub (units 1–20)` - 37 edges
6. `Proposal: build-cooking-hub` - 34 edges
7. `@playwright/test` - 32 edges
8. `vitest` - 32 edges
9. `open()` - 26 edges
10. `addDays()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Parse on save; parse edited by editing the text` --references--> `parseIngredient()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/design.md → src/lib/ingredients/parse.ts
- `Units kept as written; metric families merge` --rationale_for--> `mergeAmounts()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/decisions.md → src/lib/shopping/aggregate.ts
- `R8 SSRF from server-side fetch` --rationale_for--> `normaliseUrl()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/scope.md → src/lib/server/import.ts
- `node:sqlite with numbered SQL migrations` --references--> `migrate()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/research-stack.md → src/lib/server/db.ts
- `Context` --references--> `aggregate()`  [INFERRED]
  openspec/changes/gate-1-decisions/design.md → src/lib/shopping/aggregate.ts

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

## Communities (93 total, 6 thin omitted)

### Community 0 - "Build Unit Plan"
Cohesion: 0.09
Nodes (49): screens, dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem (+41 more)

### Community 1 - "shopping.ts"
Cohesion: 0.14
Nodes (24): Add from plan (shopping-list), addFromPlan(), addManual(), amountsOf(), clearChecked(), deleteItem(), listItems(), RANK (+16 more)

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
Cohesion: 0.07
Nodes (30): navigation delta spec (ADDED Requirements), navigation Specification, Area navigation (navigation), Page transitions (navigation), animatedProperties(), files, heightExceptions, inlineSizeExceptions (+22 more)

### Community 6 - "(app)/recipes/+page.svelte"
Cohesion: 0.08
Nodes (37): Archive state in the URL (?tags, fav, q, sort), archive delta spec (ADDED Requirements), archive Specification, Archive grid (archive), Featured stack (archive), Filters (archive), Sort (archive), stagger() (+29 more)

### Community 7 - "Database and Test Infra"
Cohesion: 0.10
Nodes (27): vitest, { version }, init(), dir, base, Field, recipeRows(), clock (+19 more)

### Community 8 - "recipes.ts"
Cohesion: 0.15
Nodes (22): Favourites (archive), add(), recipe(), recipe(), blankToNull(), cleanSections(), createRecipe(), getRecipe() (+14 more)

### Community 9 - "4. Routes"
Cohesion: 0.06
Nodes (32): 10. Gate-1 decisions, 1. Purpose and usage context, 2. Jobs-to-be-done, 3. Entities, 4.10 `/list` Shopping list, 4.11 Non-page endpoints, 4.1 `/` Home, 4.2 `/recipes` Archive (+24 more)

### Community 10 - "Recipe Import Reader"
Cohesion: 0.05
Nodes (71): R2 sites block fetches / lack JSON-LD, recipe-import delta spec (ADDED Requirements), tags delta spec (ADDED Requirements), Search (archive), recipe-import Specification, Import fallback (recipe-import), Import flow (recipe-import), Read a recipe from a page (recipe-import) (+63 more)

### Community 11 - "Types and Home Tiles"
Cohesion: 0.08
Nodes (26): Route layout: (app) group holds the nav; /__mockups and /__test outside, Shared hero view transition recipe-hero-<id>, Follow-up: hard-coded animation durations outside tokens, Bento dashboard (home), Hero motion (recipe-detail), { recipe, named = true }, frame, { hero } (+18 more)

### Community 12 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 13 - "new/+page.svelte"
Cohesion: 0.14
Nodes (10): { data, form }, duplicate, edited, invalid, preview, previewEl, reading, revealed (+2 more)

### Community 14 - "Shopping List Page"
Cohesion: 0.06
Nodes (27): arrive(), category(), { data }, done, editError, editing, flipped, glide() (+19 more)

### Community 15 - "Image Storage and Save"
Cohesion: 0.10
Nodes (28): jpeg(), sharp (image downscaling dependency), R1 sharp is a native dependency, Recipe images (recipes), ImageError, minutes(), Resolved, resolveImage() (+20 more)

### Community 16 - "Featured Coverflow Stack"
Cohesion: 0.10
Nodes (21): dragPosition(), FADE, lerp(), Place, place(), SCALE, stepIndex(), SWIPE_PX (+13 more)

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

### Community 19 - "types.ts"
Cohesion: 0.09
Nodes (31): Server function stubs and owners (U5–U19), FRACTION_VALUE, NUMBER, number(), parseIngredient(), QuantityUnit, readQuantity(), UNIT_OF (+23 more)

### Community 20 - "Design: build-cooking-hub"
Cohesion: 0.10
Nodes (21): screens, Design: build-cooking-hub, Alignment rule: one centred 1200px column, Motion set table (S7, S8, S15, S16, S18, S21, S22, S31), Palette: cream/sand ground, olive + brick accents, one dark tile, glass, RecipeForm + saveFromForm shared by manual form and import preview, Design risks R1–R8 and mitigations, Routes and owners table (+13 more)

### Community 21 - "Recipe Picker and Rail"
Cohesion: 0.09
Nodes (19): getBoard(), current, dayName, error, mode, query, selected, servings (+11 more)

### Community 22 - "Explore decisions (build-cooking-hub)"
Cohesion: 0.15
Nodes (6): Explore decisions (build-cooking-hub), Food Spots area (split off), Gate 1 planner additions (a, c–g accepted; German units declined), Non-goals (Food Spots, Homelab, cook mode, PWA, login, dark mode, …), Split off: Food Spots, Food Spots (later change)

### Community 23 - "Plan Server and Copy"
Cohesion: 0.19
Nodes (18): Types contract (src/lib/types.ts), Plan entries (meal-plan), COPY, ValidationError, addEntry(), copyWeek(), deleteEntry(), endOfSlot() (+10 more)

### Community 24 - "Import E2E and Fixture Server"
Cohesion: 0.13
Nodes (10): dirs, FixtureServer, jpeg(), page(), startFixtureServer(), field(), importIt(), port (+2 more)

### Community 25 - "E2E Helpers"
Cohesion: 0.18
Nodes (9): open(), setToday(), entries(), openCopy(), slot(), days, names, slots (+1 more)

### Community 26 - "ref_types"
Cohesion: 0.20
Nodes (12): Test-only routes (harness), @sveltejs/kit@^3.0.1, @sveltejs/kit, setTestToday(), resetDb(), requireTestFlag(), testFlag(), load() (+4 more)

### Community 27 - "Proposal: build-cooking-hub"
Cohesion: 0.15
Nodes (22): Unit table for parse.ts (g, kg, ml, l, tsp, tbsp, cup, …; families g/kg, ml/l), Proposal: build-cooking-hub, Done criteria (mockups approved, proof:full green, v0.1.0 released), Home S32, R3 ingredient parsing is fuzzy, Recipe archive S9–S22, home delta spec (ADDED Requirements), ingredients delta spec (ADDED Requirements) (+14 more)

### Community 28 - "motion.ts"
Cohesion: 0.09
Nodes (26): busy, enter(), exit(), from, message, ranges, scrim(), to (+18 more)

### Community 29 - "reset"
Cohesion: 0.15
Nodes (9): port, reset(), seed(), port, port, seedPancakes(), rename(), row() (+1 more)

### Community 30 - "fixtures.ts"
Cohesion: 0.06
Nodes (41): byId(), checked, detail, fallbackDraft, featured, importDraft, list, MockDay (+33 more)

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

### Community 34 - "plan/+page.server.ts"
Cohesion: 0.22
Nodes (19): addDays(), fromUtc(), isIsoDate(), toUtc(), weekDays(), weekStart(), titles(), today() (+11 more)

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

### Community 39 - "package.mjs"
Cohesion: 0.05
Nodes (31): name, runs-on, steps, runner, jobs, ci, name, on (+23 more)

### Community 40 - "Recipe Detail Page"
Cohesion: 0.14
Nodes (11): { data }, dayLabel(), deleting, fmt(), next, offsets, planning, recipe (+3 more)

### Community 41 - "Spec Coverage E2E"
Cohesion: 0.19
Nodes (7): card(), grid(), slot(), titles(), Counted, Layer 2: spec coverage (249 scenarios: 96 unit, 125 e2e, 28 manual; no gaps), @playwright/test

### Community 42 - "SQL Schema Migrations"
Cohesion: 0.23
Nodes (12): tags, category_memory, images, ingredient_lines, plan_entries, plan_entries_day, recipe_tags, recipes (+4 more)

### Community 43 - "with"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 44 - "Plan DnD Module"
Cohesion: 0.19
Nodes (12): slideOut(), Dragged, ghost(), glide(), grab, grabbed(), KEY, landed() (+4 more)

### Community 45 - "Icon.svelte"
Cohesion: 0.06
Nodes (31): Components: GlassPanel, PillNav, ArrowButton, RoundNav, Card, Chip, Button, Kicker, Counter, Tile, ImagePlaceholder, Shared Sheet dialog (bottom sheet on phone), Shared components (design-system), svelte, closing, {
		open,
		title,
		label = title,
		kicker,
		onclose,
		children
	}, icon, iconSize (+23 more)

### Community 46 - "Harness Specs and Playwright"
Cohesion: 0.33
Nodes (8): harness delta spec (ADDED Requirements), harness Specification, E2E projects and isolation (harness), Harness declaration (harness), Package script (harness), Proof commands (harness), db, port

### Community 47 - "[id]/+page.server.ts"
Cohesion: 0.32
Nodes (9): canonicalUnit(), md, renderInline(), renderMarkdown(), planUsage(), actions, load(), recipeId() (+1 more)

### Community 48 - "Requirement: Area navigation"
Cohesion: 0.12
Nodes (15): ADDED Requirements, MODIFIED Requirements, Requirement: Area navigation, Requirement: Search recipes focuses the search field, Scenario: Active area is marked, Scenario: Compact tab bar shows icons only, Scenario: Desktop shows the top pill nav, Scenario: Nav marks the open area (+7 more)

### Community 49 - "release.yml"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 50 - "Button.svelte"
Cohesion: 0.07
Nodes (22): amount, {
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
	}, nameInput, ownPart, planPart, at, confirming, direction (+14 more)

### Community 51 - "Move To Menu"
Cohesion: 0.15
Nodes (14): meal-plan delta spec (ADDED Requirements), meal-plan Specification, Copy week (meal-plan), Moving entries (meal-plan), Week view (meal-plan), Place, current, date (+6 more)

### Community 52 - "Research: Homelab deploy path"
Cohesion: 0.18
Nodes (8): Research: Homelab deploy path, Homelab-side steps (LXC, role, playbook, host_vars), nginx :80 → app, plain HTTP, no TLS, Runtime env contract (HOST, PORT, DATABASE_PATH, PROTOCOL_HEADER), sqlite_backups cover .db files only, Split off: Homelab changes, check01 registration (before the PR), rues-cooking-hub01 service (after tag v0.1.0)

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

### Community 61 - "Flow Change Config"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 62 - "OpenSpec Config"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 63 - "formatAmounts"
Cohesion: 0.20
Nodes (9): Context, Contracts, Decisions, Goals / Non-Goals, Risks / Trade-offs, unsavedGuard(), formatAmounts(), shownQuantity() (+1 more)

### Community 64 - "Archive Motion E2E"
Cohesion: 0.38
Nodes (4): gliding(), grid(), three, titles()

### Community 65 - "Nav E2E"
Cohesion: 0.20
Nodes (5): calm(), barState(), labels, nav(), paths

### Community 66 - "Release Specs"
Cohesion: 0.52
Nodes (7): release delta spec (ADDED Requirements), release Specification, CI workflow (release), Dependabot (release), Release runbook (release), Release workflow (release), Version 0.1.0 (release)

### Community 67 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 68 - "publish"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 70 - "Scope: build-cooking-hub"
Cohesion: 0.13
Nodes (14): Research: Mobbin references, Feature references (Crouton, Recime, NYT Cooking, Julienne, Centr), Motion references (card → detail, check-off fill-strike-move, drag ghost), Visual references (Daylight, Crouton glass tab bar, Apple News hero, pillowtalk bento), Research: model repos Life-Manager + Rues-Arcade, Harness pattern (proof, proof:full, package, test routes), node:sqlite with numbered SQL migrations, Scope: build-cooking-hub (+6 more)

### Community 71 - "runtime Specification"
Cohesion: 0.53
Nodes (6): Foundation S1–S8, runtime delta spec (ADDED Requirements), runtime Specification, Database and migrations (runtime), Health check (runtime), Server runtime configuration (runtime)

### Community 72 - "List From Plan E2E"
Cohesion: 0.83
Nodes (3): row(), rows(), toBuy()

### Community 73 - "List E2E"
Cohesion: 0.83
Nodes (3): category(), row(), toBuy()

### Community 74 - "Requirement: Servings scaling on the recipe page"
Cohesion: 0.18
Nodes (10): ADDED Requirements, Requirement: No planned status on the recipe page, Requirement: Servings scaling on the recipe page, Scenario: Invalid scale target leaves the line unchanged, Scenario: Invalid scale value is rejected, Scenario: Lines without quantity and the recipe's own servings stay unchanged, Scenario: Planned recipe shows no planned status, Scenario: Scale control updates the ingredients (+2 more)

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

### Community 87 - "Requirement: Local draft of an unsaved recipe"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Local draft of an unsaved recipe, Scenario: Clearing removes the draft, Scenario: Draft round-trips through storage, Scenario: Draft survives a reload, Scenario: Imported preview survives a reload, Scenario: Save and discard clear the draft, Scenario: Unchanged form keeps no draft (+1 more)

### Community 88 - "Requirement: Sort"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Sort, Scenario: Newest first by default, Scenario: Sort by title, Scenario: Sort by total time puts recipes without time last, Scenario: Sort choice in the archive, Scenario: Total time label

### Community 89 - "Week.svelte"
Cohesion: 0.29
Nodes (6): day(), {
		days,
		today,
		entries,
		onadd
	}, label(), weekNumber(), weekRange(), SLOTS

### Community 90 - "shopping-list Specification"
Cohesion: 0.48
Nodes (7): Shopping list S28–S31, shopping-list delta spec (ADDED Requirements), shopping-list Specification, Categories (shopping-list), Check off (shopping-list), Manual items (shopping-list), Recipe to list journey (shopping-list)

### Community 91 - "tasks.md"
Cohesion: 0.33
Nodes (5): 1. Contracts, 2. Servings scaling, 3. Draft storage, 4. Verify, 5. Hand-off to the redesign (not built here)

## Ambiguous Edges - Review These
- `app.html document shell` → `Wait for html[data-hydrated] before interacting`  [AMBIGUOUS]
  src/app.html · relation: conceptually_related_to

## Knowledge Gaps
- **39 isolated node(s):** `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)`, `Import fixture: Butter Chicken (RecipeTin Eats, Yoast @graph)`, `Import fixture: Best Chocolate Chip Cookies (Allrecipes, top-level array, Recipe+NewsArticle type)` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 731 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `U3 CI, release workflow and the Ship runbook` connect `Build Unit Plan` to `release.yml`, `package.mjs`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `Tasks: build-cooking-hub (units 1–20)` (e.g. with `archive delta spec (ADDED Requirements)` and `design-system delta spec (ADDED Requirements)`) actually correct?**
  _`Tasks: build-cooking-hub (units 1–20)` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build Unit Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.0880503144654088 - nodes in this community are weakly interconnected._
- **Why does `jobs` connect `release.yml` to `check-tag`, `bump`, `publish`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `shopping.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14408602150537633 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `app.html document shell` and `Wait for html[data-hydrated] before interacting`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._