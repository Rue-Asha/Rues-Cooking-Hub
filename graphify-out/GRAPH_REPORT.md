# Graph Report - redesign  (2026-11-17)

## Corpus Check
- 512 files · ~350,919 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 7, .woff2 6, (none) 2)

## Summary
- 3973 nodes · 7854 edges · 195 communities (188 shown, 7 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 531 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c3d5800`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Tasks: build-cooking-hub (units 1–20)
- SpotCard.svelte
- schema.org Recipe JSON-LD
- with
- package.json
- list/AddFromPlan.svelte
- ADDED Requirements
- getDb
- Requirement: Main navigation
- 3. Entities
- import.ts
- (app)/+page.svelte
- Product
- recipes/new/+page.svelte
- (app)/list/+page.svelte
- copy.ts
- FeaturedStack.svelte
- recipes/RecipeForm.svelte
- (app)/plan/+page.svelte
- fold
- cue.ts
- RecipePicker.svelte
- getDb
- nav.ts
- e2e/import.test.ts
- helpers.ts
- ref_types
- Proposal: build-cooking-hub
- motion.ts
- reset
- Archive.svelte
- recipes/AddToPlan.svelte
- lib/plan/Entry.svelte
- Frame.svelte
- types.ts
- wire/list/states/+page.svelte
- ImageField.svelte
- Design: build-cooking-hub
- plan/CopyWeek.svelte
- steps
- MenuButton.svelte
- RecipeView.svelte
- 0002_core.sql
- hifi/list/ListScreen.svelte
- Requirement: Featured stack
- svelte
- playwright.config.ts
- eating-out/[id]/+page.svelte
- Requirement: Today dashboard
- hifi/plan/data.ts
- server/spots.ts
- plan/MoveTo.svelte
- archive Specification
- lib/shell/PhoneBar.svelte
- Requirement: Plan on the phone
- recipe-form.test.ts
- recipe-image.test.ts
- recipe-motion.test.ts
- Bar.svelte
- featured.test.ts
- Layer 2: spec coverage (249 scenarios: 96 unit, 125 e2e, 28 manual; no gaps)
- 2026-10-20-build-cooking-hub/flow.yaml
- rules
- SpotForm.svelte
- ui/Icon.svelte
- e2e/nav.test.ts
- wire/overlays/+page.svelte
- tsconfig.json
- Explore decisions (build-cooking-hub)
- Requirement: Area navigation
- recipes/[id]/+page.svelte
- hifi/plan/PlanScreen.svelte
- 2026-11-17-redesign/tasks.md
- ref_node_sqlite
- aggregate.ts
- Lentil Soup Mockup Photo
- Penne Arrabbiata Mockup Photo
- Pumpkin Soup Mockup Photo
- Ricotta Pancakes Mockup Photo
- Sourdough Mockup Photo
- Spaghetti Pomodoro Mockup Photo
- Village Salad Mockup Photo
- Yoghurt Bowl Mockup Photo
- app.d.ts
- hifi/shell/links.ts
- (app)/recipes/+page.svelte
- wire/home/Dashboard.svelte
- hifi/form/RecipeForm.svelte
- #lib
- markdown.ts
- SpotCard.svelte
- wire/form/RecipeForm.svelte
- archive-filters.test.ts
- spots
- spots-form.test.ts
- Decisions
- draft.ts
- redesign/fixtures.ts
- release Specification
- hifi/overlays/+page.svelte
- Requirement: Spot page
- Requirement: Spot cards
- SectionsEditor.svelte
- Scope: add-food-spots
- Requirement: Spot search and filters
- Requirement: Spot search and filters
- Rues Cooking Hub: functional contract
- 4. Routes
- Requirement: Mockups before feature UI
- Scope: redesign
- package.mjs
- 2026-11-03-add-food-spots/proposal.md
- ADDED Requirements
- Requirement: Top spots
- 5. Cross-cutting behavior
- reducedMotion
- updates
- 2026-11-03-add-food-spots/flow.yaml
- NavItem
- Requirement: Eating Out list
- Review
- Banned patterns
- Requirement: Eating Out list
- Contracts
- Design fingerprint: reference
- mapsUrl
- a11y-floor.test.ts
- SpotFilters.svelte
- ADDED Requirements
- Requirement: Mark visited
- Requirement: Eating Out list
- Requirement: Spot sort
- Requirement: Version 0.2.0
- Requirement: Edit spot
- Requirement: Mark visited
- Requirement: Spot sort
- Requirement: Screen stays awake on the recipe page
- SpotFilters.svelte
- hifi/home/Dashboard.svelte
- Requirement: List states and one-handed use
- FavouriteButton.svelte
- 2026-11-03-add-food-spots/verification.md
- scripts
- icon/+page.svelte
- AddSlot.svelte
- Design System: Design fingerprint
- check-slop.mjs
- 2026-11-17-redesign/design.md
- Requirement: Recipe form states
- Explore notes: redesign (gate 3), running log
- shell/Button.svelte
- 2026-11-17-redesign/proposal.md
- Requirement: Tag manager states
- clearDraft
- 2026-11-17-redesign/flow.yaml
- Requirement: Motion module
- Requirement: Area navigation
- Requirement: Add spot form
- overlays/AddFromPlan.svelte
- Requirement: Add spot form
- Requirement: Cook view on the phone
- cook-view.test.ts
- toast.svelte.ts
- unsaved.ts
- ci.yml
- Requirement: Servings scaling on the recipe page
- ADDED Requirements
- FilterBar.svelte
- Requirement: Proof commands
- Requirement: Spot page
- sheet/Sheet.svelte
- Requirement: Local draft of an unsaved recipe
- Redesign references — Cooking Hub
- recipes/query.ts
- Requirement: Version 0.4.0
- 2026-11-13-gate-1-decisions/flow.yaml
- 2026-11-13-gate-1-decisions/proposal.md
- Requirement: Import states on every width
- recipes/wake-lock.test.ts
- Requirement: Test-only routes
- Requirement: Sort
- e2e/wake-lock.test.ts
- 2026-11-13-gate-1-decisions/verification.md
- Requirement: Spot photo transition
- 2026-11-13-gate-1-decisions/tasks.md
- Requirement: Spot ranks
- Verification: build-cooking-hub
- menu/Menu.svelte
- 4.5 `/recipes/[id]` Recipe page
- Mockup photo credits for /__mockups (Openverse, CC0)
- list.test.ts
- Requirements
- list-plan.test.ts
- new/form/+page.svelte

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 99 edges
2. `svelte` - 69 edges
3. `@playwright/test` - 68 edges
4. `open()` - 67 edges
5. `reset()` - 63 edges
6. `seed()` - 59 edges
7. `vitest` - 44 edges
8. `MockData` - 44 edges
9. `reducedMotion()` - 38 edges
10. `Design: build-cooking-hub` - 38 edges

## Surprising Connections (you probably didn't know these)
- `Scenario: Featured query returns the seven newest recipes` --references--> `featuredRecipes()`  [INFERRED]
  openspec/changes/archive/2026-11-17-redesign/specs/archive/spec.md → src/lib/server/recipes.ts
- `Scenario: Reduced motion makes transitions instant` --references--> `reducedMotion()`  [INFERRED]
  openspec/changes/archive/2026-11-17-redesign/specs/design-system/spec.md → src/lib/motion.ts
- `1. Vendor fingerprint 1.0.0, slop baseline and the redesign mockup scaffold` --references--> `requireTestFlag()`  [INFERRED]
  openspec/changes/archive/2026-11-17-redesign/tasks.md → src/lib/server/test-flag.ts
- `14. Shell navigation: top bar, phone bar, context "+", recipe actions, guard` --references--> `contextAdd()`  [INFERRED]
  openspec/changes/archive/2026-11-17-redesign/tasks.md → src/lib/shell/context-add.svelte.ts
- `Scenario: Location text joins what exists` --references--> `locationText()`  [INFERRED]
  openspec/specs/eating-out/spec.md → src/lib/spots/format.ts

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

## Communities (195 total, 7 thin omitted)

### Community 0 - "Tasks: build-cooking-hub (units 1–20)"
Cohesion: 0.41
Nodes (21): Tasks: build-cooking-hub (units 1–20), U1 Establish the harness and app foundation, U10 App shell: navigation and page transitions, U11 Recipe form, images and editing, U12 Archive grid, filters, search, sort and favourites, U13 Plan week view, entries and copy week, U14 Import flow, U15 Recipe page (+13 more)

### Community 1 - "SpotCard.svelte"
Cohesion: 0.22
Nodes (9): spotHeroName(), locationText(), PRICES, priceText(), hasMeta, place, { spot, named = true }, tags (+1 more)

### Community 2 - "schema.org Recipe JSON-LD"
Cohesion: 0.06
Nodes (39): E2E_APP_DIR (e2e against unpacked tarball in CI), E2E reset helper and /__test/* routes (COOKING_HUB_TEST=1), npm run package (release tarball + sha256), OpenSpec capability specs (archive, recipe-import, meal-plan, shopping-list, ...), Playwright projects phone (390x844 touch) and desktop (1280x800), npm run proof (svelte-check, build, vitest), npm run proof:full (proof + Playwright e2e), Rues Cooking Hub (project) (+31 more)

### Community 3 - "with"
Cohesion: 0.05
Nodes (46): name, needs, permissions, secrets, uses, with, name, outputs (+38 more)

### Community 4 - "package.json"
Cohesion: 0.07
Nodes (33): markdown-it (Markdown, raw HTML disabled), SvelteKit 3 with #lib imports and no svelte.config.js, dependencies, sharp@^0.35.5, devDependencies, markdown-it@^15.0.3, @playwright/test@^1.64.0, svelte@^5.57.2 (+25 more)

### Community 5 - "list/AddFromPlan.svelte"
Cohesion: 0.25
Nodes (6): busy, from, message, ranges, to, {
		week,
		onclose,
		onadded
	}

### Community 6 - "ADDED Requirements"
Cohesion: 0.04
Nodes (44): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Accessibility floor, Requirement: App icon, Requirement: Chrome cursor, Requirement: Contract states and English copy, Requirement: Light warm tokens (+36 more)

### Community 7 - "getDb"
Cohesion: 0.07
Nodes (19): Data layer, @sveltejs/kit, vitest, contract, copySection, product, { version }, entry (+11 more)

### Community 8 - "Requirement: Main navigation"
Cohesion: 0.05
Nodes (42): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Area-aware header actions, Requirement: Area navigation, Requirement: Context add button, Requirement: Desktop header fits at 1024 px, Requirement: Desktop top bar (+34 more)

### Community 9 - "3. Entities"
Cohesion: 0.18
Nodes (11): 3. Entities, Category memory, Dashboard (derived, not stored), Image, Ingredient section and ingredient line, Plan entry, Recipe, Recipe draft (browser-local, not stored on the server) (+3 more)

### Community 10 - "import.ts"
Cohesion: 0.11
Nodes (36): R8 SSRF from server-side fetch, recipe-import delta spec (ADDED Requirements), recipe-import Specification, Import fallback (recipe-import), Import flow (recipe-import), Read a recipe from a page (recipe-import), asArray(), clean() (+28 more)

### Community 11 - "(app)/+page.svelte"
Cohesion: 0.09
Nodes (13): {
		id,
		title,
		favourite,
		variant = 'glass',
		class: cls = ''
	}, pressed, photo, stage, useStage(), d, { data }, favNamed (+5 more)

### Community 12 - "Product"
Cohesion: 0.18
Nodes (10): Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product, Product Principles (+2 more)

### Community 13 - "recipes/new/+page.svelte"
Cohesion: 0.11
Nodes (15): FormDraft, blank, { data, form }, duplicate, edited, invalid, preview, previewEl (+7 more)

### Community 14 - "(app)/list/+page.svelte"
Cohesion: 0.05
Nodes (37): describedby, {
		label,
		value = $bindable(''),
		hint,
		error,
		variant = 'pill',
		type = 'text',
		prefix,
		suffix,
		hideLabel = false,
		id = uid,
		...rest
	}, Props, uid, amount, {
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
	}, ownPart, planPart (+29 more)

### Community 15 - "copy.ts"
Cohesion: 0.07
Nodes (37): jpeg(), COPY, tagsShowAll(), contract, copyList, ImageError, minutes(), Resolved (+29 more)

### Community 16 - "FeaturedStack.svelte"
Cohesion: 0.16
Nodes (11): at, current, digits, key(), line, n, {
		recipes,
		index = $bindable(0),
		handoff = $bindable(null)
	}, section (+3 more)

### Community 17 - "recipes/RecipeForm.svelte"
Cohesion: 0.07
Nodes (27): cookMinutes, description, dismissed, {
		draft,
		tags,
		errors = {},
		action = '',
		heading = 'Recipe',
		notice = null,
		cancelHref = '/recipes',
		keep = false,
		imported = false,
		host = '',
		restore = false,
		untitled = '',
		ondiscarddraft
	}, formDraft(), guard, imagePicked, imageRemoved (+19 more)

### Community 18 - "(app)/plan/+page.svelte"
Cohesion: 0.05
Nodes (45): easeInOut, Board, Dragged, glide(), grab, grabbed(), KEY, land() (+37 more)

### Community 19 - "fold"
Cohesion: 0.22
Nodes (10): Search (archive), add(), isNew(), known, leave(), onInput(), onKeydown(), suggestions (+2 more)

### Community 20 - "cue.ts"
Cohesion: 0.12
Nodes (22): Buttons, Cards, rows, toasts, Components, Fields, Menu, Motion, Phone dock, scrolled bar, detail actions, Primitives (+14 more)

### Community 21 - "RecipePicker.svelte"
Cohesion: 0.07
Nodes (28): getBoard(), current, dayName, error, focus(), keep, mode, query (+20 more)

### Community 22 - "getDb"
Cohesion: 0.08
Nodes (55): Favourites (archive), add(), clock, tagId(), titles(), getDb(), recipe(), planCount() (+47 more)

### Community 23 - "nav.ts"
Cohesion: 0.08
Nodes (28): select(), transitions(), 2. Nav area, divider and area-aware header actions, Contracts, activeArea(), AreaLink, areas, HeaderAction (+20 more)

### Community 24 - "e2e/import.test.ts"
Cohesion: 0.11
Nodes (14): dirs, FixtureServer, jpeg(), page(), startFixtureServer(), port, sizes, field() (+6 more)

### Community 25 - "helpers.ts"
Cohesion: 0.11
Nodes (17): allEntries(), entries(), expectNoEntries(), openNav(), phoneBar(), plus(), posture(), setToday() (+9 more)

### Community 26 - "ref_types"
Cohesion: 0.15
Nodes (14): Test-only routes (harness), setTestToday(), resetDb(), requireTestFlag(), testFlag(), IsoDate, load(), run() (+6 more)

### Community 27 - "Proposal: build-cooking-hub"
Cohesion: 0.07
Nodes (46): Unit table for parse.ts (g, kg, ml, l, tsp, tbsp, cup, …; families g/kg, ml/l), Proposal: build-cooking-hub, Done criteria (mockups approved, proof:full green, v0.1.0 released), sharp (image downscaling dependency), Research: Mobbin references, Feature references (Crouton, Recime, NYT Cooking, Julienne, Centr), Motion references (card → detail, check-off fill-strike-move, drag ghost), Visual references (Daylight, Crouton glass tab bar, Apple News hero, pillowtalk bento) (+38 more)

### Community 28 - "motion.ts"
Cohesion: 0.11
Nodes (25): arrive(), arriveInPlace(), bezier(), flipOnPage(), flipOptions(), pop(), reducedMotion(), rise() (+17 more)

### Community 29 - "reset"
Cohesion: 0.07
Nodes (17): chrome, seedKitchen(), header(), pinActions(), reset(), seed(), main(), tile() (+9 more)

### Community 30 - "Archive.svelte"
Cohesion: 0.07
Nodes (28): active, { all, tags, start = {}, worst = false, featured = $bindable(0) }, expanded, fav, flipped, fold(), isFav(), limit (+20 more)

### Community 31 - "recipes/AddToPlan.svelte"
Cohesion: 0.11
Nodes (16): added, count, date, days, direction, error, fmt(), formId (+8 more)

### Community 32 - "lib/plan/Entry.svelte"
Cohesion: 0.13
Nodes (12): board, close(), dragging, { entry }, error, keep, mode, onkeydown() (+4 more)

### Community 33 - "Frame.svelte"
Cohesion: 0.04
Nodes (59): missing, MockData, { area, children, plus = 'shown', photo, photoName }, closeSheet(), hifi, hifiSheet, outside(), placement (+51 more)

### Community 34 - "types.ts"
Cohesion: 0.12
Nodes (40): Types contract (src/lib/types.ts), Plan entries (meal-plan), addDays(), fromUtc(), isIsoDate(), toUtc(), weekDays(), weekStart() (+32 more)

### Community 35 - "wire/list/states/+page.svelte"
Cohesion: 0.06
Nodes (30): mockData(), listFor(), planFor(), AISLES, alias, Group, itemsText(), listFor() (+22 more)

### Community 36 - "ImageField.svelte"
Cohesion: 0.12
Nodes (17): forget(), hasImage, {
		imageId = null,
		url = $bindable(''),
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		title = '',
		untitled = '',
		onchange
	}, initial, linkPreview, localError, message, named (+9 more)

### Community 37 - "Design: build-cooking-hub"
Cohesion: 0.10
Nodes (25): Design: build-cooking-hub, Alignment rule: one centred 1200px column, Components: GlassPanel, PillNav, ArrowButton, RoundNav, Card, Chip, Button, Kicker, Counter, Tile, ImagePlaceholder, Motion set table (S7, S8, S15, S16, S18, S21, S22, S31), Palette: cream/sand ground, olive + brick accents, one dark tile, glass, RecipeForm + saveFromForm shared by manual form and import preview, Design risks R1–R8 and mitigations, Routes and owners table (+17 more)

### Community 38 - "plan/CopyWeek.svelte"
Cohesion: 0.09
Nodes (17): Scenario: Only fields and the user's own writing are selectable, at, confirming, direction, message, {
		open,
		monday,
		today,
		existing,
		sources,
		onclose
	}, source, submitting (+9 more)

### Community 39 - "steps"
Cohesion: 0.13
Nodes (15): name, runs-on, steps, jobs, ci, name, run, uses (+7 more)

### Community 40 - "MenuButton.svelte"
Cohesion: 0.12
Nodes (9): expanded, { label, name, items, radio = false, align = 'end', sheet, onpick, children }, Props, sheetOpen, uid, closing, { open = $bindable(false), title, kicker, mode = 'sheet', closeLabel = 'Close', onclose, children, actions }, Props (+1 more)

### Community 41 - "RecipeView.svelte"
Cohesion: 0.05
Nodes (54): MockLine, MockTag, LEAD, LONG_LINE, NUMBER, odd, scaleLine(), show() (+46 more)

### Community 42 - "0002_core.sql"
Cohesion: 0.14
Nodes (21): tags, category_memory, images, ingredient_lines, plan_entries, plan_entries_day, recipe_tags, recipes (+13 more)

### Community 43 - "hifi/list/ListScreen.svelte"
Cohesion: 0.05
Nodes (31): AISLES, alias, itemsText(), ListItem, ListView, afp, checked, draft (+23 more)

### Community 44 - "Requirement: Featured stack"
Cohesion: 0.06
Nodes (32): ADDED Requirements, MODIFIED Requirements, RENAMED Requirements, Requirement: Archive list, Requirement: Archive states, Requirement: Featured stack, Requirement: Recipe list pages by 24, Requirement: Tag filter shows eight tags first (+24 more)

### Community 45 - "svelte"
Cohesion: 0.04
Nodes (45): Route layout: (app) group holds the nav; /__mockups and /__test outside, svelte, Props, { title, body, heading = 'h2', action }, ariaCurrent, Props, selectable, { title, meta, value, href, onclick, current = false, selected, leading, action } (+37 more)

### Community 46 - "playwright.config.ts"
Cohesion: 0.21
Nodes (11): Research: model repos Life-Manager + Rues-Arcade, Harness pattern (proof, proof:full, package, test routes), node:sqlite with numbered SQL migrations, harness delta spec (ADDED Requirements), harness Specification, E2E projects and isolation (harness), Harness declaration (harness), Package script (harness) (+3 more)

### Community 47 - "eating-out/[id]/+page.svelte"
Cohesion: 0.09
Nodes (20): actionsEl, before, closeMenu(), { data }, deleting, host, initial, items (+12 more)

### Community 48 - "Requirement: Today dashboard"
Cohesion: 0.07
Nodes (28): ADDED Requirements, MODIFIED Requirements, RENAMED Requirements, Requirement: Today dashboard, Requirement: Today dashboard states, Requirement: Top spots, Scenario: Dashboard falls back to the first recipe entry of today, Scenario: Dashboard matches the signed-off hi-fi (+20 more)

### Community 49 - "hifi/plan/data.ts"
Cohesion: 0.06
Nodes (28): describedby, { label, value = $bindable(''), hint, error, variant = 'pill', type = 'text', icon, suffix, hideLabel = false, id = uid, ...rest }, Props, uid, IconName, { name, size = 18 }, paths, Item (+20 more)

### Community 50 - "server/spots.ts"
Cohesion: 0.07
Nodes (59): Schema — `migrations/0003_food_spots.sql` ⚠ irreversible on Rue's database once deployed, 1. Spot data layer, migration and test routes (contract), 3. Eating Out mockup and CC0 photos (taste stop), 5. Spot form: add and edit, 6. Spot page, delete and Mark visited, 7. Home "Top spots" and version 0.2.0, sharp, blankToNull() (+51 more)

### Community 51 - "plan/MoveTo.svelte"
Cohesion: 0.17
Nodes (9): Place, current, date, {
		entry,
		days,
		today,
		onmove,
		onclose
	}, slot, start, title, unchanged (+1 more)

### Community 52 - "archive Specification"
Cohesion: 0.52
Nodes (7): Archive state in the URL (?tags, fav, q, sort), archive delta spec (ADDED Requirements), archive Specification, Archive grid (archive), Featured stack (archive), Filters (archive), Sort (archive)

### Community 53 - "lib/shell/PhoneBar.svelte"
Cohesion: 0.23
Nodes (12): 18. Plan: desktop week, phone days, context "+", 19. Shopping list and context "+", addHref(), contextAdd(), registerContextAdd(), takeAddFlag(), nav, add() (+4 more)

### Community 54 - "Requirement: Plan on the phone"
Cohesion: 0.07
Nodes (28): ADDED Requirements, MODIFIED Requirements, Requirement: Context add on Plan, Requirement: Desktop week states, Requirement: Plan on the phone, Requirement: Week view, Scenario: A day turns compact once its last entry is gone, Scenario: Days are stacked on the phone (+20 more)

### Community 55 - "recipe-form.test.ts"
Cohesion: 0.13
Nodes (5): placeholderRoom(), port, recipeCount(), rows(), tagNamesOf()

### Community 56 - "recipe-image.test.ts"
Cohesion: 0.24
Nodes (6): imageCount(), jpeg(), newForm(), port, recipes(), rows()

### Community 57 - "recipe-motion.test.ts"
Cohesion: 0.13
Nodes (10): carriedName(), Call, long, photo(), photoName(), Recorded, Call, Recorded (+2 more)

### Community 58 - "Bar.svelte"
Cohesion: 0.08
Nodes (27): MockRecipeFull, Hide, Props, { recipe, start = {}, hide = {}, head = false, bar = true, worst = false }, scaled, Hide, noIngredients, noSteps (+19 more)

### Community 59 - "featured.test.ts"
Cohesion: 0.15
Nodes (4): counter(), front(), Recorded, stack()

### Community 60 - "Layer 2: spec coverage (249 scenarios: 96 unit, 125 e2e, 28 manual; no gaps)"
Cohesion: 0.07
Nodes (12): gliding(), grid(), three, titles(), calm(), items, struck(), screens() (+4 more)

### Community 61 - "2026-10-20-build-cooking-hub/flow.yaml"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 62 - "rules"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 63 - "SpotForm.svelte"
Cohesion: 0.07
Nodes (25): address, city, dismissed, {
		draft,
		tags,
		errors = {},
		notice = null,
		cancelHref = '/eating-out'
	}, emptySpot(), guard, imagePicked, imageRemoved (+17 more)

### Community 64 - "ui/Icon.svelte"
Cohesion: 0.06
Nodes (21): Shared Sheet dialog (bottom sheet on phone), dark, inert, Props, {
		variant = 'secondary',
		size = 'm',
		icon = false,
		arrow = false,
		href,
		type = 'button',
		disabled = false,
		loading = false,
		loadingLabel = 'Working',
		label,
		children,
		onclick,
		...rest
	}, closing, {
		open,
		title,
		label = title,
		kicker,
		onclose,
		children,
		actions
	}, { open, title, usage, onclose } (+13 more)

### Community 65 - "e2e/nav.test.ts"
Cohesion: 0.13
Nodes (5): makeLong(), topBar(), labels, phoneLabels, labels

### Community 66 - "wire/overlays/+page.svelte"
Cohesion: 0.04
Nodes (51): MockEntry, Slot, PlanDay, glyph, Props, round, { variant = 'default', size = 'm', icon, label, disabled = false, pressed, expanded, href, grow = false, children }, { legend, options, columns, compact = false } (+43 more)

### Community 67 - "tsconfig.json"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 68 - "Explore decisions (build-cooking-hub)"
Cohesion: 0.09
Nodes (14): Explore decisions (build-cooking-hub), Food Spots area (split off), Gate 1 planner additions (a, c–g accepted; German units declined), Non-goals (Food Spots, Homelab, cook mode, PWA, login, dark mode, …), Research: Homelab deploy path, Homelab-side steps (LXC, role, playbook, host_vars), nginx :80 → app, plain HTTP, no TLS, Runtime env contract (HOST, PORT, DATABASE_PATH, PROTOCOL_HEADER) (+6 more)

### Community 69 - "Requirement: Area navigation"
Cohesion: 0.09
Nodes (22): ADDED Requirements, MODIFIED Requirements, Requirement: Area-aware header actions, Requirement: Area navigation, Requirement: Desktop header fits at 1024 px, Scenario: Active area is marked, Scenario: Active pill lands on Eating Out, Scenario: Compact tab bar shows icons only (+14 more)

### Community 70 - "recipes/[id]/+page.svelte"
Cohesion: 0.05
Nodes (32): actionsEl, alert, before, clamped, closeMenu(), { data }, deleting, field (+24 more)

### Community 71 - "hifi/plan/PlanScreen.svelte"
Cohesion: 0.05
Nodes (31): entriesText(), initial(), minutes(), PlanView, plate(), SLOTS, { title, image }, Props (+23 more)

### Community 72 - "2026-11-17-redesign/tasks.md"
Cohesion: 0.10
Nodes (20): 10. Gate 5: master icon, 11. ⛔ Gate 5 review and sign-off (human stop), 12. ⛔ Build preconditions (human stop, orchestrator), 14. Shell navigation: top bar, phone bar, context "+", recipe actions, guard, 16. Recipes archive, 17. Recipe page: cook view and keep-awake, 1. Vendor fingerprint 1.0.0, slop baseline and the redesign mockup scaffold, 20. Import, recipe form, edit and tags (+12 more)

### Community 73 - "ref_node_sqlite"
Cohesion: 0.09
Nodes (9): Dialog, dialogs, port, port, port, rows(), stored(), port (+1 more)

### Community 74 - "aggregate.ts"
Cohesion: 0.08
Nodes (45): Server function stubs and owners (U5–U19), Add from plan (shopping-list), FRACTION_VALUE, NUMBER, number(), parseIngredient(), QuantityUnit, readQuantity() (+37 more)

### Community 75 - "Lentil Soup Mockup Photo"
Cohesion: 0.50
Nodes (4): Dark Moody Food Styling, Lentil Soup Mockup Photo, Red Lentil Soup with Croutons, Rustic Bread Slices

### Community 76 - "Penne Arrabbiata Mockup Photo"
Cohesion: 0.50
Nodes (4): Bright Overhead Food Styling, Penne Arrabbiata Mockup Photo, Penne Arrabbiata Ingredients (Pan), Vine Tomatoes and Basil

### Community 77 - "Pumpkin Soup Mockup Photo"
Cohesion: 0.67
Nodes (3): Pumpkin Soup Mockup Photo, Pumpkin Soup with Croutons, Shallow Depth-of-Field Close-up

### Community 78 - "Ricotta Pancakes Mockup Photo"
Cohesion: 0.67
Nodes (3): Ricotta Pancakes Mockup Photo, Ricotta Pancake Stack, Overhead on Wooden Table

### Community 79 - "Sourdough Mockup Photo"
Cohesion: 0.67
Nodes (3): Sourdough Mockup Photo, Minimal Linen Styling, Rustic Sourdough Loaf

### Community 80 - "Spaghetti Pomodoro Mockup Photo"
Cohesion: 0.67
Nodes (3): Dark Wood Table Setting, Spaghetti Pomodoro Mockup Photo, Spaghetti Pomodoro Bowl

### Community 81 - "Village Salad Mockup Photo"
Cohesion: 0.67
Nodes (3): Village Salad Mockup Photo, Rustic Table with Fork and Towel, Village Salad (Spinach, Feta, Tomato)

### Community 82 - "Yoghurt Bowl Mockup Photo"
Cohesion: 0.67
Nodes (3): Breakfast Close-up Styling, Yoghurt Bowl with Fruit, Granola and Nuts, Yoghurt Bowl Mockup Photo

### Community 84 - "hifi/shell/links.ts"
Cohesion: 0.11
Nodes (23): scrolled(), choices, href(), { worst = false }, IconName, { name, size = 18 }, paths, actions() (+15 more)

### Community 85 - "(app)/recipes/+page.svelte"
Cohesion: 0.12
Nodes (14): clear(), { data }, featuredIndex, filtered, handoff, limit, listEl, navigate() (+6 more)

### Community 86 - "wire/home/Dashboard.svelte"
Cohesion: 0.11
Nodes (23): MockDay, MockRecipe, MockSpot, Dash, all, { d, recipes, parts = all }, full, Part (+15 more)

### Community 87 - "hifi/form/RecipeForm.svelte"
Cohesion: 0.04
Nodes (47): describedby, {
		label,
		value = $bindable(''),
		hint,
		error,
		variant = 'pill',
		type = 'text',
		prefix,
		suffix,
		hideLabel = false,
		id = uid,
		...rest
	}, Props, uid, Props, shown, { title, tone = 'ok', icon, children, actions }, Parsed (+39 more)

### Community 88 - "#lib"
Cohesion: 0.07
Nodes (32): Area, error, { open, name, onclose }, score, submitting, {
		value = $bindable(),
		error = '',
		id = 'f-score',
		oninput
	}, Props, { width, label, height = 460, top, children, bar } (+24 more)

### Community 89 - "markdown.ts"
Cohesion: 0.26
Nodes (10): recipes delta spec (ADDED Requirements), recipes Specification, Edit and delete (recipes), Manual creation form (recipes), Markdown notes and steps (recipes), Recipe fields and validation (recipes), Recipe images (recipes), md (+2 more)

### Community 90 - "SpotCard.svelte"
Cohesion: 0.14
Nodes (17): Requirement: Score input and display, Scenario: Invalid score keeps the other values, Scenario: Invalid scores are rejected, Scenario: Score field uses the decimal keyboard, Scenario: Score is stored without drift, Scenario: Scores display with two decimals and a dot, Scenario: Valid scores parse to hundredths, Requirement: Score input and display (+9 more)

### Community 91 - "wire/form/RecipeForm.svelte"
Cohesion: 0.08
Nodes (21): Parsed, parsedText(), parseLine(), UNITS, Errors, fileName, hasImage, ingredients (+13 more)

### Community 93 - "spots"
Cohesion: 0.09
Nodes (21): port, rows(), spotCount(), spots(), Codebase touchpoints, Requirement: Spot storage, Scenario: Deleting a spot removes its photo and tag links, Scenario: Duplicate spot names are allowed (+13 more)

### Community 94 - "spots-form.test.ts"
Cohesion: 0.12
Nodes (3): mainNav(), port, widths

### Community 95 - "Decisions"
Cohesion: 0.18
Nodes (10): Context, Decisions, Desktop header fit (S17), Goals / Non-Goals, Migration Plan, Mockup approval, Narrowest card, Open Questions (+2 more)

### Community 96 - "draft.ts"
Cohesion: 0.18
Nodes (17): 1. Contracts, Review, DraftStorage, isDraftWorthKeeping(), isFormShape(), isSections(), isStrings(), loadDraft() (+9 more)

### Community 97 - "redesign/fixtures.ts"
Cohesion: 0.08
Nodes (30): AISLES, buildWeek(), DAYS, emptySets, emptySlots(), MockAisle, MockHome, MockItem (+22 more)

### Community 98 - "release Specification"
Cohesion: 0.10
Nodes (23): version, runner, name, on, workflow_call, permissions, contents, description (+15 more)

### Community 99 - "hifi/overlays/+page.svelte"
Cohesion: 0.05
Nodes (36): count, Day, day, done, error, invalid, { live = false, open = $bindable(false), recipe, servings, range, days, todayShort, variant = 'pick', added = 'Wednesday · Dinner' }, meal (+28 more)

### Community 100 - "Requirement: Spot page"
Cohesion: 0.25
Nodes (8): Requirement: Spot page, Scenario: Delete a spot from its page, Scenario: Maps link is built from name, address and city, Scenario: Missing address, website and notes hide their rows, Scenario: Spot page makes no external requests, Scenario: Spot page shows hero, panel, rows and actions, Scenario: Spot page without photo shows the placeholder hero, Scenario: Unknown spot answers 404

### Community 101 - "Requirement: Spot cards"
Cohesion: 0.33
Nodes (6): Requirement: Spot cards, Scenario: Location text joins what exists, Scenario: Long spot names are clamped, Scenario: Sparse card shows no empty parts, Scenario: Spot grid fits narrow phones, Scenario: Visited card shows photo, name, tags, location, price and score

### Community 102 - "SectionsEditor.svelte"
Cohesion: 0.16
Nodes (10): addLine(), addSection(), EditorLine, EditorSection, examples, { kind, sections = $bindable() }, nextId(), noun (+2 more)

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
Cohesion: 0.17
Nodes (13): 4.10 `/list` Shopping list, 4.11 Non-page endpoints, 4.1 `/` Home, 4.2 `/recipes` Archive, 4.3 `/recipes/new` Import a recipe, 4.4 `/recipes/new/form` Write a recipe, 4.6 The recipe form (used by `/recipes/new` preview, `/recipes/new/form`, `/recipes/[id]/edit`), 4.7 `/recipes/[id]/edit` Edit recipe (+5 more)

### Community 108 - "Requirement: Mockups before feature UI"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Mockups before feature UI, Scenario: Eating Out mockup loads only local resources, Scenario: Every mockup photo is credited, Scenario: Main screens share one alignment rule, Scenario: Mockup routes are hidden without the test flag, Scenario: Mockup screenshots are produced for both viewports, Scenario: Requested changes revise the mockups (+1 more)

### Community 109 - "Scope: redesign"
Cohesion: 0.14
Nodes (13): Codebase touchpoints, Decisions, Done when, Entities (contract §3, confirm at Gate 0), Flows, In scope, Non-goals, Problem (+5 more)

### Community 110 - "package.mjs"
Cohesion: 0.18
Nodes (8): lock, lockPath, problems, root, hash, root, staging, { version }

### Community 111 - "2026-11-03-add-food-spots/proposal.md"
Cohesion: 0.20
Nodes (9): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 112 - "ADDED Requirements"
Cohesion: 0.40
Nodes (5): Requirement: Spot photo transition, Scenario: Card and spot page share the photo, Scenario: Reduced motion skips the spot shared element, Scenario: Spot photo carries over smoothly, Scenario: Spot without photo morphs its placeholder

### Community 113 - "Requirement: Top spots"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: Top spots, Scenario: Fewer than four visited spots shows what exists, Scenario: Home shows Top spots after Recently added, Scenario: No visited spot hides Top spots, Scenario: Top spots look like the approved mockup, Scenario: Top spots query returns the four best visited spots, Scenario: Top spots row lays out like Recently added

### Community 114 - "5. Cross-cutting behavior"
Cohesion: 0.50
Nodes (4): 5. Cross-cutting behavior, Navigation offers Home, Add recipe, Search recipes at every width, Accessibility target WCAG 2.2 AA, Accessibility & Inclusion

### Community 115 - "reducedMotion"
Cohesion: 0.18
Nodes (15): close(), enter(), exit(), {
		name,
		current,
		anchor,
		onpick,
		onclose
	}, onkeydown(), pick(), place, position() (+7 more)

### Community 116 - "updates"
Cohesion: 0.25
Nodes (8): dependency-name, update-types, interval, updates, directory, ignore, package-ecosystem, schedule

### Community 117 - "2026-11-03-add-food-spots/flow.yaml"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 118 - "NavItem"
Cohesion: 0.33
Nodes (5): Codebase (explorer reports), Design system, Mobbin (iOS; apps confirmed: Beli, Places, corner, Swarm, The Infatuation, Google Maps, Mindtrip), Navigation, Research: add-food-spots (explore, 2026-11-02)

### Community 119 - "Requirement: Eating Out list"
Cohesion: 0.25
Nodes (8): Requirement: Eating Out list, Scenario: Default segment follows what exists, Scenario: Eating Out view survives reload and back, Scenario: Empty Eating Out invites the first spot, Scenario: Empty side shows a short line, Scenario: Phone page carries Add spot, Scenario: Visited is the default segment, Scenario: Want to go opens when nothing is visited

### Community 120 - "Review"
Cohesion: 0.14
Nodes (13): Diffstat, Final proof:full, Gate-7 polish pass (0195826..0a2e74b), Layer 1: proof:full, Layer 2: spec coverage, Manual checklist (run: `npm run dev` then http://localhost:5173), Open for Rue at Gate 7 (taste, as built), Review (+5 more)

### Community 121 - "Banned patterns"
Cohesion: 0.07
Nodes (26): accent-word-overuse, animated-blur, avatar-stack, Banned patterns, chunky-display, cream-paper, emoji-icons, explore-showreel-pair (+18 more)

### Community 122 - "Requirement: Eating Out list"
Cohesion: 0.22
Nodes (9): Requirement: Eating Out list, Scenario: Default segment follows what exists, Scenario: Eating Out view survives reload and back, Scenario: Empty Eating Out invites the first spot, Scenario: Empty side shows a short line, Scenario: Phone page carries Add spot, Scenario: Spot search keeps its placeholder whole at every width, Scenario: Visited is the default segment (+1 more)

### Community 123 - "Contracts"
Cohesion: 0.17
Nodes (13): Shared hero view transition recipe-hero-<id>, Components, Contracts, Copy (`src/lib/copy.ts`, unit 1; corrections after the mockup stop: unit 4 only), Error and danger style (no new colours), Pure modules (browser-safe), Routes, Server — `src/lib/server/spots.ts` (throws `ValidationError` from `#lib/errors.ts` on invalid input) (+5 more)

### Community 124 - "Design fingerprint: reference"
Cohesion: 0.11
Nodes (18): Accent sets, App icons, Colour tokens, Composition tokens (`tokens.css`, "Composition (layout.css)"), Content palettes (not UI colour), Design fingerprint: reference, Elevation and glass, How apps consume it (+10 more)

### Community 125 - "mapsUrl"
Cohesion: 0.17
Nodes (13): Scenario: External links open in a new tab, Requirement: Spot page, Scenario: Delete a spot from its page, Scenario: External links open in a new tab, Scenario: Maps link is built from name, address and city, Scenario: Missing address, website and notes hide their rows, Scenario: Spot page makes no external requests, Scenario: Spot page shows hero, panel, rows and actions (+5 more)

### Community 126 - "a11y-floor.test.ts"
Cohesion: 0.10
Nodes (17): walk(), open(), menuAndDialog(), Played, played(), record(), seedRecipe(), openCopy() (+9 more)

### Community 127 - "SpotFilters.svelte"
Cohesion: 0.12
Nodes (30): 4. Eating Out list: segments, cards, filters, sort and ranks, spotFacets(), spotTotals(), asPrice(), defaultSort(), defaultStatus(), dropStale(), hasSpotFilters() (+22 more)

### Community 128 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Requirement: Eating Out looks like the approved mockup, Requirement: Edit spot, Requirement: Spot ranks, Scenario: Eating Out matches the approved mockup, Scenario: Editing a deleted spot answers 404, Scenario: Equal scores share a rank, Scenario: Other sorts show no rank (+6 more)

### Community 129 - "Requirement: Mark visited"
Cohesion: 0.33
Nodes (6): Requirement: Mark visited, Scenario: Cancel leaves the spot unchanged, Scenario: Invalid score keeps the sheet open, Scenario: Mark visited from the spot page, Scenario: Mark visited is refused for a spot that is already visited, Scenario: Mark visited stores status and score

### Community 130 - "Requirement: Eating Out list"
Cohesion: 0.15
Nodes (12): MODIFIED Requirements, REMOVED Requirements, Requirement: Eating Out list, Requirement: Eating Out looks like the approved mockup, Scenario: Default segment follows what exists, Scenario: Eating Out view survives reload and back, Scenario: Empty Eating Out invites the first spot, Scenario: Empty side shows a short line (+4 more)

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

### Community 136 - "Requirement: Screen stays awake on the recipe page"
Cohesion: 0.15
Nodes (12): ADDED Requirements, MODIFIED Requirements, Requirement: Hero motion, Requirement: Screen stays awake on the recipe page, Scenario: Card and recipe page share the hero image, Scenario: Denied wake lock shows no error, Scenario: Leaving the recipe page releases the wake lock, Scenario: Missing wake lock API changes nothing (+4 more)

### Community 137 - "SpotFilters.svelte"
Cohesion: 0.17
Nodes (8): SPOT_SORTS, chips, {
		facets,
		query,
		onquery,
		segment
	}, lead, q, rank(), sent, sorts

### Community 138 - "hifi/home/Dashboard.svelte"
Cohesion: 0.08
Nodes (24): all, { d, recipes, parts = all }, full, Part, planHref, Props, recipeHref, worst (+16 more)

### Community 139 - "Requirement: List states and one-handed use"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Context add on List, Requirement: List states and one-handed use, Scenario: Eighty items in nine aisles stay usable, Scenario: Empty list shows Nothing to buy, Scenario: Item targets are thumb-sized on the phone, Scenario: List item from the Home sheet focuses the add field, Scenario: Long names and amounts wrap (+3 more)

### Community 140 - "FavouriteButton.svelte"
Cohesion: 0.25
Nodes (6): 22. Home: today dashboard, grow(), fit(), { recipe, named = true }, tags, RecipeCard

### Community 141 - "2026-11-03-add-food-spots/verification.md"
Cohesion: 0.29
Nodes (6): Diffstat, Layer 1: PORT=4700 npm run proof:full: ok, Layer 2: spec coverage, Manual checklist, Review, Screenshots (untracked, from this run)

### Community 142 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, package, prepare, preview, proof (+3 more)

### Community 143 - "icon/+page.svelte"
Cohesion: 0.10
Nodes (5): family, grounds, small, variants, worst

### Community 144 - "AddSlot.svelte"
Cohesion: 0.10
Nodes (18): error, { live = false, open = $bindable(false), where, recipes, variant = 'search', freeText = 'Pizza night', worst = false, onadd }, meta(), minutes(), mode, pick, picked, pool (+10 more)

### Community 145 - "Design System: Design fingerprint"
Cohesion: 0.10
Nodes (20): Accent: one per app, Accessibility, Colors, Components, Design System: Design fingerprint, Do:, Do's and Don'ts, Don't: (+12 more)

### Community 146 - "check-slop.mjs"
Cohesion: 0.11
Nodes (14): args, banned, bannedPath, baselineFlag, checkDecl(), explicitBanned, files, NAMED (+6 more)

### Community 147 - "2026-11-17-redesign/design.md"
Cohesion: 0.18
Nodes (10): Context, Decisions, Family moves per surface (brief for every hi-fi and build unit), From scope (gate 3, Rue), Gate log, Goals / Non-Goals, Migration Plan, Open Questions (+2 more)

### Community 148 - "Requirement: Recipe form states"
Cohesion: 0.18
Nodes (10): ADDED Requirements, Requirement: One save action on the recipe form, Requirement: Recipe form states, Scenario: A new recipe form starts with one line, the plate and four suggestions, Scenario: An edited recipe without a title keeps a neutral plate, Scenario: Fifty ingredient lines stay usable, Scenario: HEIC photo the server cannot read is rejected, Scenario: Recipe form has one Save recipe (+2 more)

### Community 149 - "Explore notes: redesign (gate 3), running log"
Cohesion: 0.20
Nodes (9): Decisions (Rue, 2026-11-14), Explore notes: redesign (gate 3), running log, Explorer findings, Round 2 (Rue, 2026-11-14), Round 3 (Rue, 2026-11-14), Round 4 (Rue, 2026-11-14), Round 5 (Rue, 2026-11-14), Round 6 (Rue, 2026-11-14) (+1 more)

### Community 150 - "shell/Button.svelte"
Cohesion: 0.03
Nodes (62): Accessibility, Worst-case data, alert, field, line, Props, { recipe, start = {}, scaled = $bindable(null), worst = false, times = true }, servings (+54 more)

### Community 151 - "2026-11-17-redesign/proposal.md"
Cohesion: 0.20
Nodes (9): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 152 - "Requirement: Tag manager states"
Cohesion: 0.20
Nodes (9): ADDED Requirements, MODIFIED Requirements, Requirement: Free tags, Requirement: Tag manager states, Scenario: Duplicate tag name reuses the existing tag, Scenario: Long tag names wrap in the manager, Scenario: Merge reports both names, Scenario: New tag created while editing a recipe (+1 more)

### Community 153 - "clearDraft"
Cohesion: 0.22
Nodes (8): Contracts, Decisions, Goals / Non-Goals, Risks / Trade-offs, clearDraft(), discardDraft(), submit(), toEditor()

### Community 154 - "2026-11-17-redesign/flow.yaml"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 155 - "Requirement: Motion module"
Cohesion: 0.25
Nodes (8): Requirement: Motion module, Scenario: A new list item settles in, Scenario: Clearing checked items at the page end moves no row to buy, Scenario: Menus and dialogs open softly, Scenario: Motion animates only transform and opacity, Scenario: Press states show on an iPhone, Scenario: Reduced motion makes transitions instant, Scenario: Reduced motion opens menus and dialogs instantly

### Community 156 - "Requirement: Area navigation"
Cohesion: 0.12
Nodes (15): ADDED Requirements, MODIFIED Requirements, Requirement: Area navigation, Requirement: Search recipes focuses the search field, Scenario: Active area is marked, Scenario: Compact tab bar shows icons only, Scenario: Desktop shows the top pill nav, Scenario: Nav marks the open area (+7 more)

### Community 157 - "Requirement: Add spot form"
Cohesion: 0.17
Nodes (12): Requirement: Add spot form, Scenario: Empty name blocks saving a spot, Scenario: Leaving the spot form with unsaved changes asks first, Scenario: Leaving the untouched spot form does not ask, Scenario: New spot defaults to Want to go, Scenario: Price level can be cleared, Scenario: Score field appears only for Visited, Scenario: Spot created with all fields (+4 more)

### Community 158 - "overlays/AddFromPlan.svelte"
Cohesion: 0.05
Nodes (30): error, from, { live = false, open = $bindable(false), variant = 'default', onadd }, message, Props, range, to, touched (+22 more)

### Community 159 - "Requirement: Add spot form"
Cohesion: 0.12
Nodes (16): name(), Form save — `src/lib/spots/save.ts` (server-only imports, used from `+page.server.ts`), Scenario: Server rejects invalid spot input, Requirement: Add spot form, Scenario: Empty name blocks saving a spot, Scenario: Leaving the spot form with unsaved changes asks first, Scenario: Leaving the untouched spot form does not ask, Scenario: New spot defaults to Want to go (+8 more)

### Community 160 - "Requirement: Cook view on the phone"
Cohesion: 0.25
Nodes (8): Requirement: Cook view on the phone, Scenario: Cook view shows every part on the phone, Scenario: Cooking from the phone reads well, Scenario: Ingredients and method side by side from 768 px, Scenario: Long ingredient lines wrap in the cook view, Scenario: Recipe without image and times in the cook view, Scenario: Scaled fractions and ranges read in the cook view, Scenario: Unknown recipe shows Recipe not found

### Community 162 - "toast.svelte.ts"
Cohesion: 0.18
Nodes (15): 15. Dialogs, menus and status notices, dismiss(), DURATION, pause(), resume(), start(), timers, Toast (+7 more)

### Community 163 - "unsaved.ts"
Cohesion: 0.38
Nodes (5): Context, unsavedGuard(), edges(), NAVIGATION_CANCELLED, pill()

### Community 164 - "ci.yml"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 165 - "Requirement: Servings scaling on the recipe page"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Requirement: No planned status on the recipe page, Requirement: Servings scaling on the recipe page, Scenario: Invalid scale target leaves the line unchanged, Scenario: Invalid scale value is rejected, Scenario: Lines without quantity and the recipe's own servings stay unchanged, Scenario: Planned recipe shows no planned status, Scenario: Scale control updates the ingredients (+4 more)

### Community 166 - "ADDED Requirements"
Cohesion: 0.29
Nodes (7): ADDED Requirements, Requirement: Eating Out in the functional contract, Requirement: Eating Out on the shared shell, Scenario: Contract covers Eating Out, Scenario: Product names five areas, Scenario: Spot pages keep their behaviour, Scenario: Spot pages render on the fingerprint

### Community 167 - "FilterBar.svelte"
Cohesion: 0.15
Nodes (10): Archive sort label renamed to Total time, chips, expanded, q, sent, sortLabel, {
		tags,
		query,
		onquery
	}, used (+2 more)

### Community 168 - "Requirement: Proof commands"
Cohesion: 0.29
Nodes (6): MODIFIED Requirements, Requirement: Proof commands, Scenario: Proof fails on a failing check, Scenario: Proof-full runs e2e on an isolated database, Scenario: Proof prints test names and passes, Scenario: Proof runs the fingerprint guards

### Community 169 - "Requirement: Spot page"
Cohesion: 0.29
Nodes (7): Requirement: Spot page, Scenario: Delete a spot from its page, Scenario: Missing address, website and notes hide their rows, Scenario: Spot page makes no external requests, Scenario: Spot page shows hero, panel, rows and actions, Scenario: Spot page without photo shows the placeholder hero, Scenario: Unknown spot answers 404

### Community 170 - "sheet/Sheet.svelte"
Cohesion: 0.29
Nodes (4): closing, { open = $bindable(false), title, kicker, mode = 'sheet', closeLabel = 'Close', onclose, children, actions }, Props, uid

### Community 171 - "Requirement: Local draft of an unsaved recipe"
Cohesion: 0.18
Nodes (10): ADDED Requirements, Requirement: Local draft of an unsaved recipe, Scenario: Clearing removes the draft, Scenario: Draft comparison ignores key order and a malformed draft is not loaded, Scenario: Draft round-trips through storage, Scenario: Draft survives a reload, Scenario: Imported preview survives a reload, Scenario: Save and discard clear the draft (+2 more)

### Community 172 - "Redesign references — Cooking Hub"
Cohesion: 0.33
Nodes (5): C1 Phone bottom bar: 4-5 tabs + separate round context "+", C2 Recipe cooking view (phone): servings scaling, method steps, C3 Weekly meal plan (7 days x slots), phone and desktop, moving entries, C4 Shopping list by aisle, tick-off, "checked" group, Redesign references — Cooking Hub

### Community 173 - "recipes/query.ts"
Cohesion: 0.29
Nodes (10): hasFilters(), ParsedQuery, parseQuery(), parse(), toggleTag(), toSearch(), cards(), featuredRecipes() (+2 more)

### Community 174 - "Requirement: Version 0.4.0"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, RENAMED Requirements, Requirement: Version 0.4.0, Scenario: Package and lockfile carry 0.4.0, Scenario: Release v0.4.0 published

### Community 175 - "2026-11-13-gate-1-decisions/flow.yaml"
Cohesion: 0.20
Nodes (9): base, decisions, gate0, gate1, gate2, learnings, release, track (+1 more)

### Community 176 - "2026-11-13-gate-1-decisions/proposal.md"
Cohesion: 0.15
Nodes (15): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+7 more)

### Community 177 - "Requirement: Import states on every width"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Requirement: Import states on every width, Scenario: Import states render at three widths, Scenario: Long link and title stay usable in the import

### Community 181 - "recipes/wake-lock.test.ts"
Cohesion: 0.14
Nodes (9): Design fingerprint, Harness, Learnings, Rues Cooking Hub, Specs, Scenario: Recipe page requests a wake lock, keepAwake(), request() (+1 more)

### Community 184 - "Requirement: Test-only routes"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Test-only routes, Scenario: Reset leaves an empty archive with the starter tags, Scenario: Seed returns the ids of what it inserted, Scenario: Seeded spots carry their photos, Scenario: Test clock sets today, Scenario: Test routes answer 404 without the test flag

### Community 185 - "Requirement: Sort"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Sort, Scenario: Newest first by default, Scenario: Sort by title, Scenario: Sort by total time puts recipes without time last, Scenario: Sort choice in the archive, Scenario: Total time label

### Community 188 - "2026-11-13-gate-1-decisions/verification.md"
Cohesion: 0.33
Nodes (5): Diffstat (origin/main...flow/gate-1-decisions), Layer 1: proof:full, Layer 2: spec coverage, Manual checklist, Screenshots

### Community 197 - "Requirement: Spot photo transition"
Cohesion: 0.40
Nodes (5): Requirement: Spot photo transition, Scenario: Card and spot page share the photo, Scenario: Reduced motion skips the spot shared element, Scenario: Spot photo carries over smoothly, Scenario: Spot without photo morphs its placeholder

### Community 199 - "2026-11-13-gate-1-decisions/tasks.md"
Cohesion: 0.40
Nodes (4): 2. Servings scaling, 3. Draft storage, 4. Verify, 5. Hand-off to the redesign (not built here)

### Community 200 - "Requirement: Spot ranks"
Cohesion: 0.40
Nodes (5): Requirement: Spot ranks, Scenario: Equal scores share a rank, Scenario: Other sorts show no rank, Scenario: Ranks recount within the filters, Scenario: Ranks show while sorted by score

### Community 203 - "Verification: build-cooking-hub"
Cohesion: 0.40
Nodes (5): Verification: build-cooking-hub, Follow-up: hard-coded animation durations outside tokens, Follow-up: 310+ digit minutes/servings → Infinity → uncaught ValidationError (500), Layer 1: proof:full green (381 passed, 29 skipped by design), Manual checklist for Rue (motion feel, real import, release on GitHub)

### Community 205 - "menu/Menu.svelte"
Cohesion: 0.40
Nodes (3): menu, MenuItem, {
		name,
		items,
		radio = false,
		icon,
		onselect
	}

### Community 206 - "4.5 `/recipes/[id]` Recipe page"
Cohesion: 0.67
Nodes (3): 4.5 `/recipes/[id]` Recipe page, Recipe page planned status dropped, Servings scaling on the recipe page (scaleIngredient, view only)

### Community 209 - "list.test.ts"
Cohesion: 0.83
Nodes (3): category(), row(), toBuy()

### Community 210 - "Requirements"
Cohesion: 0.12
Nodes (15): eating-out Specification, Purpose, Requirement: Eating Out in the functional contract, Requirement: Eating Out on the shared shell, Requirement: Spot cards, Requirements, Scenario: Contract covers Eating Out, Scenario: Location text joins what exists (+7 more)

### Community 214 - "list-plan.test.ts"
Cohesion: 0.83
Nodes (3): row(), rows(), toBuy()

## Ambiguous Edges - Review These
- `app.html document shell` → `Wait for html[data-hydrated] before interacting`  [AMBIGUOUS]
  src/app.html · relation: conceptually_related_to

## Knowledge Gaps
- **45 isolated node(s):** `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)`, `Import fixture: Butter Chicken (RecipeTin Eats, Yoast @graph)`, `Import fixture: Best Chocolate Chip Cookies (Allrecipes, top-level array, Recipe+NewsArticle type)` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2303 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `svelte` to `package.json`, `SpotFilters.svelte`, `recipes/new/+page.svelte`, `(app)/list/+page.svelte`, `FeaturedStack.svelte`, `recipes/RecipeForm.svelte`, `(app)/plan/+page.svelte`, `fold`, `RecipePicker.svelte`, `nav.ts`, `motion.ts`, `overlays/AddFromPlan.svelte`, `recipes/AddToPlan.svelte`, `Frame.svelte`, `unsaved.ts`, `ImageField.svelte`, `wire/list/states/+page.svelte`, `plan/CopyWeek.svelte`, `FilterBar.svelte`, `MenuButton.svelte`, `sheet/Sheet.svelte`, `eating-out/[id]/+page.svelte`, `hifi/plan/data.ts`, `plan/MoveTo.svelte`, `SpotForm.svelte`, `ui/Icon.svelte`, `wire/overlays/+page.svelte`, `recipes/[id]/+page.svelte`, `menu/Menu.svelte`, `(app)/recipes/+page.svelte`, `hifi/form/RecipeForm.svelte`, `#lib`, `hifi/overlays/+page.svelte`, `SectionsEditor.svelte`, `reducedMotion`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `E2E import fixture: Plum crumble (category/keywords tags)`, `E2E import fixture: Lemon tart (HowToStep, times, description)` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.org Recipe JSON-LD` be split into smaller, more focused modules?**
  _Cohesion score 0.056025369978858354 - nodes in this community are weakly interconnected._
- **Why does `spots()` connect `spots` to `server/spots.ts`, `nav.ts`, `getDb`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `with` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._
- **Why does `SORTS` connect `FilterBar.svelte` to `recipes/query.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `app.html document shell` and `Wait for html[data-hydrated] before interacting`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._