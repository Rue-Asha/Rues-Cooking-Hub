# Graph Report - Rues-Cooking-Hub  (2026-11-05)

## Corpus Check
- 242 files · ~148,700 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .woff2 3, (none) 1, .css 1)

## Summary
- 1542 nodes · 3828 edges · 84 communities (81 shown, 3 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 355 edges (avg confidence: 0.9)
- Token cost: 109,727 input · 0 output

## Community Hubs (Navigation)
- Build Unit Plan
- Shopping Aggregation Server
- Repo Docs and Release Runbook
- Release Workflow YAML
- Package Manifest and Dependencies
- Nav Shell and Motion Tests
- Archive Grid and Filters
- Database and Test Infra
- Recipe Store
- Motion Primitives and Dialogs
- Recipe Import Reader
- Types and Home Tiles
- Tags and Seed Route
- Svelte UI Components
- Shopping List Page
- Image Storage and Save
- Featured Coverflow Stack
- Recipe Form and Unsaved Guard
- Plan Page Drag and Drop
- Sheets and Tag Manager
- Design System Specs
- Recipe Picker and Rail
- Explore Decisions and Splits
- Plan Server and Copy
- Import E2E and Fixture Server
- E2E Helpers
- Test Clock and Flags
- Proposal and Recipe Specs
- CI Workflow
- Archive and Recipe E2E
- Home and Plan Mockups
- Add to Plan Dialog
- Plan Entry Component
- Scope and Stack Research
- Dates and Plan Load
- Week View and Slots
- Image Field
- Sections Editor
- Design Tokens
- Gate Workflow
- Recipe Detail Page
- Spec Coverage E2E
- SQL Schema Migrations
- Home and Shopping Specs
- Plan DnD Module
- Icons Chips and Cards
- Harness Specs and Playwright
- Markdown and Recipe Load
- List Mockup Fixtures
- Import Mockups
- Copy Week Dialog
- Move To Menu
- Arrow Buttons and Placeholder
- Plan Slot Component
- Tag Input
- Recipe Form E2E
- Recipe Image E2E
- Recipe Motion E2E
- Recipes Mockup
- Featured E2E
- List Check-off E2E
- Flow Change Config
- OpenSpec Config
- Shopping Item Component
- Archive Motion E2E
- Nav E2E
- Release Specs
- TypeScript Config
- Recipe Mockup and Kicker
- Home Dashboard Server
- Meal Plan Specs
- Runtime Specs
- List From Plan E2E
- List E2E
- Tags E2E
- Lentil Soup Photo
- Penne Arrabbiata Photo
- Pumpkin Soup Photo
- Ricotta Pancakes Photo
- Sourdough Photo
- Spaghetti Pomodoro Photo
- Village Salad Photo
- Yoghurt Bowl Photo
- App Type Declarations

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
- `node:sqlite with numbered SQL migrations` --references--> `migrate()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/research-stack.md → src/lib/server/db.ts
- `R8 SSRF from server-side fetch` --rationale_for--> `normaliseUrl()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/scope.md → src/lib/server/import.ts
- `Units kept as written; metric families merge` --rationale_for--> `mergeAmounts()`  [INFERRED]
  openspec/changes/archive/2026-10-20-build-cooking-hub/decisions.md → src/lib/shopping/aggregate.ts
- `Archive grid (archive)` --references--> `stagger()`  [INFERRED]
  openspec/specs/archive/spec.md → src/lib/motion.ts

## Import Cycles
- 2-file cycle: `src/lib/server/recipes.ts -> src/lib/server/tags.ts -> src/lib/server/recipes.ts`

## Hyperedges (group relationships)
- **E2E recipe-import fixture pages (Fixture Kitchen)** — e2e_fixtures_import_broken_image_tomato_soup, e2e_fixtures_import_dessert_tags_plum_crumble, e2e_fixtures_import_lemon_tart_lemon_tart, e2e_fixtures_import_meta_only_grandmas_pie [INFERRED 0.85]
- **Captured real-site recipe pages for import parser (RecipeTin Eats, Allrecipes, BBC Good Food, Simply Recipes, Eat this!)** — fixtures_import_butter_chicken_recipe, fixtures_import_chocolate_chip_cookies_recipe, fixtures_import_easy_pancakes_recipe, fixtures_import_guacamole_recipe, fixtures_import_no_recipe_eat_this [INFERRED 0.85]
- **v0.1.0 ship runbook outward steps** — docs_release_public_repo_bootstrap, docs_release_check_runner_registration, docs_release_bump_secrets, docs_release_main_ruleset, docs_release_release_workflow, docs_release_homelab_service [EXTRACTED 1.00]
- **build-cooking-hub planning artifacts** — openspec_changes_archive_2026_10_20_build_cooking_hub_decisions, openspec_changes_archive_2026_10_20_build_cooking_hub_scope, openspec_changes_archive_2026_10_20_build_cooking_hub_proposal, openspec_changes_archive_2026_10_20_build_cooking_hub_design, openspec_changes_archive_2026_10_20_build_cooking_hub_tasks, openspec_changes_archive_2026_10_20_build_cooking_hub_verification [EXTRACTED 1.00]
- **Homelab deploy constraints shaping the app** — openspec_changes_archive_2026_10_20_build_cooking_hub_research_infra_plain_http_secure_context, openspec_changes_archive_2026_10_20_build_cooking_hub_research_infra_systemd_readwritepaths, openspec_changes_archive_2026_10_20_build_cooking_hub_split_homelab_upload_body_limits, openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_images_as_sqlite_blob, openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_plain_http_no_secure_context [INFERRED 0.85]
- **Gate 1 planner additions in the design** — openspec_changes_archive_2026_10_20_build_cooking_hub_decisions_gate_1_planner_additions, openspec_changes_archive_2026_10_20_build_cooking_hub_design_shopping_amounts_parts, openspec_changes_archive_2026_10_20_build_cooking_hub_design_name_keys, openspec_changes_archive_2026_10_20_build_cooking_hub_design_import_regex_json_ld [INFERRED 0.85]
- **Recipe → plan → shopping list pipeline** — openspec_specs_recipe_import_spec_read_a_recipe_from_a_page, openspec_specs_recipes_spec_recipe_fields_and_validation, openspec_specs_ingredients_spec_ingredient_line_parser, openspec_specs_meal_plan_spec_plan_entries, openspec_specs_shopping_list_spec_add_from_plan, openspec_specs_shopping_list_spec_recipe_to_list_journey [EXTRACTED 1.00]
- **Reduced-motion contract across capabilities** — openspec_specs_design_system_spec_motion_module, openspec_specs_navigation_spec_page_transitions, openspec_specs_navigation_spec_area_navigation, openspec_specs_recipe_detail_spec_hero_motion, openspec_specs_archive_spec_archive_grid, openspec_specs_shopping_list_spec_check_off [INFERRED 0.95]
- **E2E test isolation harness** — openspec_specs_harness_spec_test_only_routes, openspec_specs_harness_spec_e2e_projects_and_isolation, openspec_specs_harness_spec_proof_commands [INFERRED 0.85]

## Communities (84 total, 3 thin omitted)

### Community 0 - "Build Unit Plan"
Cohesion: 0.08
Nodes (50): screens, dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem (+42 more)

### Community 1 - "Shopping Aggregation Server"
Cohesion: 0.08
Nodes (45): Gate 1 planner additions (a, c–g accepted; German units declined), Server function stubs and owners (U5–U19), Add from plan (shopping-list), FRACTION_VALUE, NUMBER, number(), parseIngredient(), QuantityUnit (+37 more)

### Community 2 - "Repo Docs and Release Runbook"
Cohesion: 0.05
Nodes (43): E2E_APP_DIR (e2e against unpacked tarball in CI), E2E reset helper and /__test/* routes (COOKING_HUB_TEST=1), npm run package (release tarball + sha256), OpenSpec capability specs (archive, recipe-import, meal-plan, shopping-list, ...), Playwright projects phone (390x844 touch) and desktop (1280x800), npm run proof (svelte-check, build, vitest), npm run proof:full (proof + Playwright e2e), Rues Cooking Hub (project) (+35 more)

### Community 3 - "Release Workflow YAML"
Cohesion: 0.05
Nodes (46): name, needs, permissions, secrets, uses, with, name, outputs (+38 more)

### Community 4 - "Package Manifest and Dependencies"
Cohesion: 0.05
Nodes (45): markdown-it (Markdown, raw HTML disabled), dependencies, sharp@^0.35.5, devDependencies, markdown-it@^15.0.3, @playwright/test@^1.64.0, svelte@^5.57.2, svelte-check@^4.7.6 (+37 more)

### Community 5 - "Nav Shell and Motion Tests"
Cohesion: 0.06
Nodes (35): navigation delta spec (ADDED Requirements), Verification: build-cooking-hub, Follow-up: hard-coded animation durations outside tokens, Follow-up: 310+ digit minutes/servings → Infinity → uncaught ValidationError (500), Layer 1: proof:full green (381 passed, 29 skipped by design), Manual checklist for Rue (motion feel, real import, release on GitHub), navigation Specification, Area navigation (navigation) (+27 more)

### Community 6 - "Archive Grid and Filters"
Cohesion: 0.08
Nodes (37): Archive state in the URL (?tags, fav, q, sort), archive delta spec (ADDED Requirements), archive Specification, Archive grid (archive), Favourites (archive), Featured stack (archive), Filters (archive), Search (archive) (+29 more)

### Community 7 - "Database and Test Infra"
Cohesion: 0.09
Nodes (18): vitest, { version }, entry, init(), dir, Saved, base, existing() (+10 more)

### Community 8 - "Recipe Store"
Cohesion: 0.11
Nodes (38): Recipe fields and validation (recipes), add(), clock, tagId(), getDb(), recipe(), planCount(), recipe() (+30 more)

### Community 9 - "Motion Primitives and Dialogs"
Cohesion: 0.07
Nodes (32): busy, enter(), exit(), from, message, ranges, scrim(), to (+24 more)

### Community 10 - "Recipe Import Reader"
Cohesion: 0.12
Nodes (34): R2 sites block fetches / lack JSON-LD, recipe-import delta spec (ADDED Requirements), recipe-import Specification, Import fallback (recipe-import), Import flow (recipe-import), Read a recipe from a page (recipe-import), asArray(), clean() (+26 more)

### Community 11 - "Types and Home Tiles"
Cohesion: 0.07
Nodes (28): Shared hero view transition recipe-hero-<id>, Hero motion (recipe-detail), { recipe, named = true }, frame, { hero }, label, recipe, split (+20 more)

### Community 12 - "Tags and Seed Route"
Cohesion: 0.11
Nodes (25): @sveltejs/kit, savedLocation(), findBySourceUrl(), refreshSearchText(), deleteTag(), listTags(), recipesWith(), renameTag() (+17 more)

### Community 13 - "Svelte UI Components"
Cohesion: 0.07
Nodes (25): Route layout: (app) group holds the nav; /__mockups and /__test outside, svelte, {
		children,
		href,
		variant = 'primary',
		arrow,
		icon,
		type = 'button',
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}, Props, withArrow, { children, as = 'div', strong = false, class: cls = '', ...rest }, Props, { children, tone = 'light', href, image, imageAlt = '', class: cls = '', ...rest } (+17 more)

### Community 14 - "Shopping List Page"
Cohesion: 0.06
Nodes (29): stagger(), arrive(), { data }, done, editError, editing, flipped, glide() (+21 more)

### Community 15 - "Image Storage and Save"
Cohesion: 0.11
Nodes (25): jpeg(), sharp (image downscaling dependency), R1 sharp is a native dependency, Recipe images (recipes), ImageError, minutes(), Resolved, resolveImage() (+17 more)

### Community 16 - "Featured Coverflow Stack"
Cohesion: 0.10
Nodes (21): dragPosition(), FADE, lerp(), Place, place(), SCALE, stepIndex(), SWIPE_PX (+13 more)

### Community 17 - "Recipe Form and Unsaved Guard"
Cohesion: 0.08
Nodes (24): cookMinutes, description, dismissed, {
		draft,
		tags,
		errors = {},
		action = '',
		heading = 'Recipe',
		notice = null,
		cancelHref = '/recipes'
	}, FormDraft, guard, imagePicked, imageRemoved (+16 more)

### Community 18 - "Plan Page Drag and Drop"
Cohesion: 0.10
Nodes (24): land(), placed(), placeKey(), board, copying, { data }, direction, drag (+16 more)

### Community 19 - "Sheets and Tag Manager"
Cohesion: 0.08
Nodes (12): Shared Sheet dialog (bottom sheet on phone), closing, {
		open,
		title,
		label = title,
		kicker,
		onclose,
		children
	}, { open, title, usage, onclose }, submitting, busy, confirming, { data } (+4 more)

### Community 20 - "Design System Specs"
Cohesion: 0.12
Nodes (19): screens, Design: build-cooking-hub, Alignment rule: one centred 1200px column, Motion set table (S7, S8, S15, S16, S18, S21, S22, S31), Palette: cream/sand ground, olive + brick accents, one dark tile, glass, RecipeForm + saveFromForm shared by manual form and import preview, Design risks R1–R8 and mitigations, Routes and owners table (+11 more)

### Community 21 - "Recipe Picker and Rail"
Cohesion: 0.09
Nodes (19): getBoard(), current, dayName, error, mode, query, selected, servings (+11 more)

### Community 22 - "Explore Decisions and Splits"
Cohesion: 0.10
Nodes (13): Explore decisions (build-cooking-hub), Food Spots area (split off), Non-goals (Food Spots, Homelab, cook mode, PWA, login, dark mode, …), Research: Homelab deploy path, Homelab-side steps (LXC, role, playbook, host_vars), nginx :80 → app, plain HTTP, no TLS, Runtime env contract (HOST, PORT, DATABASE_PATH, PROTOCOL_HEADER), sqlite_backups cover .db files only (+5 more)

### Community 23 - "Plan Server and Copy"
Cohesion: 0.19
Nodes (18): Types contract (src/lib/types.ts), Plan entries (meal-plan), COPY, ValidationError, addEntry(), copyWeek(), deleteEntry(), endOfSlot() (+10 more)

### Community 24 - "Import E2E and Fixture Server"
Cohesion: 0.12
Nodes (11): dirs, FixtureServer, jpeg(), page(), startFixtureServer(), port, field(), importIt() (+3 more)

### Community 25 - "E2E Helpers"
Cohesion: 0.16
Nodes (10): calm(), open(), setToday(), entries(), openCopy(), slot(), days, names (+2 more)

### Community 26 - "Test Clock and Flags"
Cohesion: 0.19
Nodes (9): setTestToday(), resetDb(), requireTestFlag(), testFlag(), { data, form }, load(), run(), POST() (+1 more)

### Community 27 - "Proposal and Recipe Specs"
Cohesion: 0.19
Nodes (19): Proposal: build-cooking-hub, Done criteria (mockups approved, proof:full green, v0.1.0 released), Recipe archive S9–S22, ingredients delta spec (ADDED Requirements), recipe-detail delta spec (ADDED Requirements), recipes delta spec (ADDED Requirements), tags delta spec (ADDED Requirements), ingredients Specification (+11 more)

### Community 28 - "CI Workflow"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 29 - "Archive and Recipe E2E"
Cohesion: 0.14
Nodes (8): grid(), titles(), reset(), seed(), port, port, seedPancakes(), full

### Community 30 - "Home and Plan Mockups"
Cohesion: 0.16
Nodes (15): byId(), MockEntry, recipes, slots, today, totalMinutes(), week, days (+7 more)

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

### Community 33 - "Scope and Stack Research"
Cohesion: 0.12
Nodes (15): Research: Mobbin references, Feature references (Crouton, Recime, NYT Cooking, Julienne, Centr), Motion references (card → detail, check-off fill-strike-move, drag ghost), Visual references (Daylight, Crouton glass tab bar, Apple News hero, pillowtalk bento), Research: model repos Life-Manager + Rues-Arcade, Harness pattern (proof, proof:full, package, test routes), SvelteKit 3 with #lib imports and no svelte.config.js, node:sqlite with numbered SQL migrations (+7 more)

### Community 34 - "Dates and Plan Load"
Cohesion: 0.32
Nodes (11): addDays(), fromUtc(), isIsoDate(), toUtc(), weekDays(), weekStart(), weekEntries(), load() (+3 more)

### Community 35 - "Week View and Slots"
Cohesion: 0.16
Nodes (11): { week, today }, day(), {
		days,
		today,
		entries,
		onadd
	}, label(), weekNumber(), weekRange(), IsoDate, Section (+3 more)

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

### Community 39 - "Gate Workflow"
Cohesion: 0.13
Nodes (15): name, runs-on, steps, jobs, ci, name, run, uses (+7 more)

### Community 40 - "Recipe Detail Page"
Cohesion: 0.14
Nodes (11): { data }, dayLabel(), deleting, fmt(), next, offsets, planning, recipe (+3 more)

### Community 41 - "Spec Coverage E2E"
Cohesion: 0.19
Nodes (7): card(), grid(), slot(), titles(), Counted, Layer 2: spec coverage (249 scenarios: 96 unit, 125 e2e, 28 manual; no gaps), @playwright/test

### Community 42 - "SQL Schema Migrations"
Cohesion: 0.23
Nodes (12): tags, category_memory, images, ingredient_lines, plan_entries, plan_entries_day, recipe_tags, recipes (+4 more)

### Community 43 - "Home and Shopping Specs"
Cohesion: 0.21
Nodes (14): Unit table for parse.ts (g, kg, ml, l, tsp, tbsp, cup, …; families g/kg, ml/l), Home S32, R3 ingredient parsing is fuzzy, home delta spec (ADDED Requirements), shopping-list delta spec (ADDED Requirements), home Specification, Bento dashboard (home), Ingredient line parser (ingredients) (+6 more)

### Community 44 - "Plan DnD Module"
Cohesion: 0.15
Nodes (10): Board, Dragged, ghost(), grab, grabbed(), KEY, receiving, sending (+2 more)

### Community 45 - "Icons Chips and Cards"
Cohesion: 0.23
Nodes (8): {
		href,
		title,
		description = null,
		image = null,
		minutes = null,
		tags = [],
		favourite = false,
		compact = false,
		fav,
		heroName = null,
		class: cls = ''
	}, {
		label,
		active = false,
		count,
		icon,
		static: isStatic = false,
		size = 'md',
		tone = 'default',
		onclick,
		class: cls = '',
		...rest
	}, Props, IconName, {
		name,
		size = 20,
		stroke = 1.6,
		filled = false,
		label
	}, paths, { icon, label, href, variant = 'glass', pressed, onclick, class: cls = '', ...rest }, Props

### Community 46 - "Harness Specs and Playwright"
Cohesion: 0.31
Nodes (9): harness delta spec (ADDED Requirements), harness Specification, E2E projects and isolation (harness), Harness declaration (harness), Package script (harness), Proof commands (harness), Test-only routes (harness), db (+1 more)

### Community 47 - "Markdown and Recipe Load"
Cohesion: 0.35
Nodes (8): md, renderInline(), renderMarkdown(), entriesInRange(), actions, load(), recipeId(), splitAmount()

### Community 48 - "List Mockup Fixtures"
Cohesion: 0.24
Nodes (9): checked, list, MockDay, MockItem, MockLine, MockRecipe, MockSlot, openCount (+1 more)

### Community 49 - "Import Mockups"
Cohesion: 0.18
Nodes (9): fallbackDraft, importDraft, parsed, photo(), brownButter, { fallback = false }, image, title (+1 more)

### Community 50 - "Copy Week Dialog"
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
Cohesion: 0.18
Nodes (9): Place, current, date, {
		entry,
		days,
		today,
		onmove,
		onclose
	}, slot, start, title, unchanged (+1 more)

### Community 52 - "Arrow Buttons and Placeholder"
Cohesion: 0.22
Nodes (7): Components: GlassPanel, PillNav, ArrowButton, RoundNav, Card, Chip, Button, Kicker, Counter, Tile, ImagePlaceholder, icon, iconSize, {
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
	}, Props, { label = 'No photo yet', size = 'card', class: cls = '' }, {
		prevLabel = 'Previous',
		nextLabel = 'Next',
		prevDisabled = false,
		nextDisabled = false,
		onprev,
		onnext
	}

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

### Community 54 - "Tag Input"
Cohesion: 0.24
Nodes (8): add(), isNew(), known, leave(), onInput(), onKeydown(), suggestions, {
		tags,
		selected = $bindable(),
		pending = $bindable()
	}

### Community 55 - "Recipe Form E2E"
Cohesion: 0.28
Nodes (4): port, recipeCount(), rows(), tagNamesOf()

### Community 56 - "Recipe Image E2E"
Cohesion: 0.28
Nodes (5): imageCount(), newForm(), port, recipes(), rows()

### Community 57 - "Recipe Motion E2E"
Cohesion: 0.25
Nodes (5): Call, long, media(), Recorded, transform()

### Community 58 - "Recipes Mockup"
Cohesion: 0.22
Nodes (6): featured, tags, active, chipOrder, index, shown

### Community 59 - "Featured E2E"
Cohesion: 0.36
Nodes (5): counter(), front(), Recorded, stack(), stage()

### Community 61 - "Flow Change Config"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 62 - "OpenSpec Config"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 63 - "Shopping Item Component"
Cohesion: 0.25
Nodes (6): amount, {
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
	}, nameInput, ownPart, planPart, ShoppingItem

### Community 64 - "Archive Motion E2E"
Cohesion: 0.38
Nodes (4): gliding(), grid(), three, titles()

### Community 65 - "Nav E2E"
Cohesion: 0.33
Nodes (4): barState(), labels, nav(), paths

### Community 66 - "Release Specs"
Cohesion: 0.52
Nodes (7): release delta spec (ADDED Requirements), release Specification, CI workflow (release), Dependabot (release), Release runbook (release), Release workflow (release), Version 0.1.0 (release)

### Community 67 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 68 - "Recipe Mockup and Kicker"
Cohesion: 0.29
Nodes (3): detail, { parts, tone = 'ink', class: cls = '' }, offsets

### Community 69 - "Home Dashboard Server"
Cohesion: 0.67
Nodes (5): titles(), today(), dashboard(), listRecipes(), load()

### Community 70 - "Meal Plan Specs"
Cohesion: 0.53
Nodes (5): meal-plan delta spec (ADDED Requirements), meal-plan Specification, Copy week (meal-plan), Moving entries (meal-plan), Week view (meal-plan)

### Community 71 - "Runtime Specs"
Cohesion: 0.53
Nodes (6): Foundation S1–S8, runtime delta spec (ADDED Requirements), runtime Specification, Database and migrations (runtime), Health check (runtime), Server runtime configuration (runtime)

### Community 72 - "List From Plan E2E"
Cohesion: 0.83
Nodes (3): row(), rows(), toBuy()

### Community 73 - "List E2E"
Cohesion: 0.83
Nodes (3): category(), row(), toBuy()

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

## Ambiguous Edges - Review These
- `Wait for html[data-hydrated] before interacting` → `app.html document shell`  [AMBIGUOUS]
  src/app.html · relation: conceptually_related_to

## Knowledge Gaps
- **39 isolated node(s):** `$app/tsconfig`, `Setup (Node >= 22.18, npm install, playwright chromium)`, `GET /healthz endpoint`, `Life-Manager repo (ruleset template)`, `Rues-Arcade (service template cloned for deploy)` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 641 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `U3 CI, release workflow and the Ship runbook` connect `Build Unit Plan` to `CI Workflow`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `Tasks: build-cooking-hub (units 1–20)` (e.g. with `archive delta spec (ADDED Requirements)` and `design-system delta spec (ADDED Requirements)`) actually correct?**
  _`Tasks: build-cooking-hub (units 1–20)` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$app/tsconfig`, `Setup (Node >= 22.18, npm install, playwright chromium)`, `GET /healthz endpoint` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build Unit Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.07985480943738657 - nodes in this community are weakly interconnected._
- **Why does `Tasks: build-cooking-hub (units 1–20)` connect `Build Unit Plan` to `Release Specs`, `Nav Shell and Motion Tests`, `Archive Grid and Filters`, `Meal Plan Specs`, `Runtime Specs`, `Recipe Import Reader`, `Home and Shopping Specs`, `Harness Specs and Playwright`, `Design System Specs`, `Proposal and Recipe Specs`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Shopping Aggregation Server` be split into smaller, more focused modules?**
  _Cohesion score 0.07985480943738657 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Wait for html[data-hydrated] before interacting` and `app.html document shell`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._