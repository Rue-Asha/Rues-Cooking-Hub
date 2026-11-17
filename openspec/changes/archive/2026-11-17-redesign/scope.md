# Scope: redesign

Triage: feature — from-scratch UI redesign of Rue's Cooking Hub on fingerprint 1.0.0 (ecosystem-ui-revamp gates 3–8). Appetite: several sessions, in phases (gate 4 wireframes, gate 5 hi-fi, then the build in waves).

## Problem
Rue cooks from the hub on the phone in the kitchen, ticks the list off on the phone in the shop, and plans the week and imports recipes on the desktop. Navigation is the biggest pain: on the phone the bottom bar has only the areas, so search and add need a detour; on the desktop the top bar is fine in structure but not in look. The UI also has to move onto the shared design fingerprint.

## Usage (Rue, 2026-11-14)
- Phone in the kitchen: a recipe open while cooking (read, scale).
- Phone in the shop: tick off the list.
- Desktop: plan the week, import and edit recipes.
- Biggest pain apart from the look: navigation (phone: search/add missing; desktop: look only).

## Entities (contract §3, confirm at Gate 0)
Recipe (tags, ingredient and step sections, one image, favourite) → plan entry (date, slot, recipe + servings or free text) → via "Add from plan" only → shopping item (name, amounts, origin, category of 9, checked). One list. Tags are free. Food spots and spot tags are separate and link to nothing else.

## Flows
From the contract (jobs J1–J15) plus Eating Out (J16, added by this change):
- Today (J1): Home → today's meal, the week strip, the list preview, Favourite, Recently added → into recipe, plan or list.
- Find a recipe (J2, J7): Search recipes from anywhere → /recipes with the field focused → filters (tags, Favourites), sort → recipe.
- Cook (J3): recipe page → scale servings → read ingredients and method; the screen stays awake while the recipe is open.
- Import (J4): Add recipe → paste link → reading → preview / fallback / duplicate / invalid → edit → save; the draft survives reload.
- Write (J5): Add recipe → write by hand → form → save; the draft survives reload; "Discard changes?" on leaving.
- Edit / delete (J6): recipe → Edit or Delete (dialog names what depends on it).
- Tags (J8): /recipes/tags → rename (collision merges) / delete.
- Plan (J9–J11): /plan week → add (recipe or free text) to a day and slot → change servings/text, Move to…, delete, drag on desktop; Copy week; Add to plan from a recipe.
- List (J12–J14): /list → Add from plan (scaled, merged, grouped by aisle) or type a line → shop: tick off → Checked group → Clear checked.
- Move around (J15): areas from anywhere; unsaved recipe edits are never lost.
- Eating Out (J16): spots list → spot page → add / edit / Mark visited (behaviour as in openspec/specs/eating-out/spec.md).

## Screen inventory (gate 3)
Posture: *pointer* (desktop, top bar) and *touch* (phone, bottom bar). The switch stays at 1024 px (Rue, gate 4); below it tablets get the phone layout.

| # | Screen | Route | Jobs | Posture |
|---|---|---|---|---|
| SC1 | Home: today dashboard | `/` | J1, J15 | both |
| SC2 | Recipes: featured, filters, search, sort | `/recipes` | J2, J7 | both |
| SC3 | Recipe page (cook view) | `/recipes/[id]` | J3, J6, J11 | both, phone first |
| SC4 | Import by link | `/recipes/new` | J4 | both |
| SC5 | Recipe form (new by hand, edit) | `/recipes/new/form`, `/recipes/[id]/edit` | J5, J6, J8 | desktop first |
| SC6 | Manage tags | `/recipes/tags` | J8 | both |
| SC7 | Plan week | `/plan` | J9, J10 | desktop first; phone: days stacked |
| SC8 | Shopping list | `/list` | J12–J14 | phone first |
| SC9 | Eating Out pages (carried along, no IA work) | `/eating-out`, `/eating-out/new`, `/eating-out/[id]`, `/eating-out/[id]/edit` | J16 | both |
| G1 | Desktop top bar: brand, area links, Search recipes, Add recipe | layout | J15, J2, J4 | pointer |
| G2 | Phone bar: Home · Recipes · Plan · List · Spots pills + round context "+" | layout | J15 | touch |
| G3 | "+" choice sheet (Home) | overlay | J4, J9, J13 | touch |
| G4 | Dialogs and menus: Add to plan, entry options, Move to…, Copy week, Add from plan, Delete recipe, Delete tag, category menu, Discard changes? | overlay | J6, J9–J13 | both |
| G5 | Toasts: the existing status notices restyled, no new toast component (Rue, Gate 1) | overlay | J15 | both |

## In scope

Shell and navigation
- **S1** Desktop top bar keeps its structure (brand link, the five area links with Eating Out last, Search recipes, Add recipe) and moves onto the fingerprint look; exactly one nav named "Main" at a time; aria-current marks the area, sub-routes keep it.
  - edges: 1024–1280 widths fit without wrapping; long area labels none (fixed copy); content never covered by the bar.
- **S2** Phone bar: Home · Recipes · Plan · List · Spots as pills plus a separate round "+"; the current area is marked; safe-area insets respected; content is never covered (incl. tablet and landscape phone).
  - edges: 320 px width; soft keyboard open (bar hidden while a text field has focus); five pills + "+" fit at 320 px.
- **S3** The round "+" is context-dependent: Recipes → Add recipe, Plan → add plan entry (the existing Add dialog, for today's Dinner or, when today is not in the shown week, Monday Dinner; no day/meal choice inside the dialog — Rue, Gate 1), List → focus the add field, Spots → Add spot, Home → a choice sheet (Recipe, Plan entry, List item).
  - edges: on a recipe/spot page it acts for its area; on the recipe form it is hidden or inert (no nested add while editing); sheet closes on Escape/back.
- **S4** Gate-1 #8 holds at every width: brand, "Search recipes" and "Add recipe" stay reachable on every screen, in addition to the context "+" (phone: a top strip with brand mark, Search icon and "Add recipe", zero taps — Rue, gate 4). On Eating Out pages "Search spots" and "Add spot" take the recipe actions' place, in the top bar and on the phone; the brand stays (Rue, Gate 1).
  - edges: "Search recipes" lands on /recipes with the field focused, also when already there (gate-1 #7).
- **S5** Unsaved-changes guard on the recipe form survives the new shell: any in-app navigation away (bar, "+", brand) asks "Discard changes?".

Home
- **S6** Home stays the today dashboard: greeting and summary sentence, today's recipe, This week, list preview (first 3), Favourite, Recently added (4), Top spots (kept, Rue, Gate 1).
  - edges: nothing planned today / this week; empty list; no favourite; no recipes at all (welcome state with Add recipe); long titles.

Recipes
- **S7** Recipes page: Featured (7 newest, ignores filters), tag and Favourites filters (AND), search, sort (Newest, Title A–Z, Total time), URL state, favourite toggle, Manage tags, Add recipe.
  - edges: no recipes; filters match nothing (reset); 100+ recipes; long titles; many tags.
- **S8** Recipe page as cook view on the phone: image, tags, favourite, times, servings with "Scale to servings", ingredients, method, notes, source; Add to plan, Edit, Delete.
  - edges: no image; no times; very long ingredient lines; fractions and ranges after scaling; 404 for an unknown id.
- **S9** Keep the screen awake while a recipe page is open (Screen Wake Lock), released on leave or when the page is hidden; silently absent where unsupported.
  - edges: tab hidden and shown again → re-acquired; browser denies → no error shown.
- **S10** Import by link with all states (reading, preview, fallback, duplicate, invalid, restored draft) and the form for writing by hand and editing (sections, photo, tags, source, notes), draft restore with "Discard draft".
  - edges: HEIC/oversized photo errors; duplicate link; 50+ ingredients; the current double "Save recipe" quirk is resolved to one clear save in a sticky bottom bar, on the phone above the phone bar (Rue, gate 4; copy at gate 5).
- **S11** Manage tags: list with counts, rename (collision merges), delete dialog.
  - edges: no tags; long names; merge confirmation copy.

Plan and list
- **S12** Plan week on the desktop: 7 days × 4 slots, recipe picker aside as drag source, Add dialog, entry options (Change servings / Edit text, Move to…, Delete), Copy week, previous / next / This week, `?week=`.
  - edges: empty week; a slot with 5+ entries; long free text; drag has the Move to… alternative; deleted recipe → entry as free text.
- **S13** Plan on the phone: days stacked vertically, slots per day, today marked and first in view; same actions via menus (no drag needed).
  - edges: past week (today not in it); empty days compact.
- **S14** Shopping list: add field, Add from plan dialog, To buy grouped by 9 aisles, Checked N group, item edit, category menu, Clear checked; deletes immediate (gate-1 #3).
  - edges: empty list; only checked items; 80+ items; long names and amounts; one-handed ticking on the phone (targets ≥44 px).

Eating Out (carried along)
- **S15** Eating Out pages move onto the new shared components and shell with their current behaviour; no IA work, no own wireframes; behaviour per openspec/specs/eating-out/spec.md stays green.
  - edges: as the eating-out spec lists (want/visited, score, photo transition).
- **S16** The functional contract gains Eating Out minimally: job J16, the four spot routes (data, actions, required states), their English copy, and the nav entry ("Eating Out", "Search spots", "Add spot"); the route coverage line becomes 16 of 16.
  - edges: none (documentation).

Cross-cutting
- **S17** All contract states per route (empty, loading, error, single, many, overlong) and the English copy list; WCAG 2.2 AA; every drag has a Move to… alternative; phone targets ≥44 px; no horizontal scroll at 320 px.
- **S18** Master icon `icons/Rues-Cooking-Hub/icon.svg` from the app's main jobs, in the family sheet (ecosystem 9.5).

Gate 4 additions (Rue, 2026-11-15; accepted from the wireframes, client-only)
- **S19** Recipes tag filter: with more than 8 tags it shows 8 plus a "Show all N tags" toggle ("Show fewer tags" when open).
- **S20** Recipes list pages by 24: "Showing 24 of N" and "Show 24 more"; a filter, search or sort change starts at 24 again.
- **S21** The Recipes head keeps its own "Add recipe" primary pill and "Manage tags", in addition to the shell's "Add recipe" and the "+".

## Non-goals
- Redesigning Eating Out (its IA, cards, list) — a later change of its own (Rue).
- New cook-view features beyond keep-awake: step-by-step mode, ticking off ingredients/steps — Rue chose "keep as is".
- Server, load, action or migration changes — the redesign is UI-only (ecosystem 11.1); Wake Lock is client-only.
- A global search across recipes and spots.
- Dark mode — decided at checkpoint B (ecosystem 12.2).

## Codebase touchpoints
- `src/lib/nav.ts`, `src/lib/shell/AppNav.svelte`, `src/lib/ui/PillNav.svelte`, `src/routes/(app)/+layout.svelte` — shell, area model, header actions, compact mode, view transitions (explorer: contract and nav).
- `docs/functional-contract.md`, `PRODUCT.md` — Eating Out added (S16).
- `openspec/specs/navigation/spec.md`, `openspec/specs/eating-out/spec.md` — nav and spot behaviour the build must keep green.
- `/__mockups/redesign/*` — gate 4 wireframes and gate 5 hi-fi.

## Risks
- R1 Five pills + "+" at 320 px may not fit → gate 4 kept labels, superseded at checkpoint A (2026-11-16, fingerprint 2.0.0): pills are icon-only below 360 px and labelled from 360 px.
- R2 Gate-1 #8 plus a context "+" can mean two add affordances on the phone → accepted at gate 4 (strip "Add recipe" and "+" both on Recipes); copy at gate 5.
- R3 Eating Out pages break when shared components are replaced → resolved by S15 (they move onto the new components in the build).
- R4 Contract drift (Eating Out) → resolved by S16.

## Decisions
- Desktop top bar: structure stays, look changes (Rue, round 3).
- Phone bar like Notes: area pills + round "+"; pills Home · Recipes · Plan · List · Spots; search as an icon on Recipes plus gate-1 #8 reachability (Rue, rounds 2, 4, 5).
- "+" is context-dependent; on Home a choice sheet (Rue, rounds 4, 5).
- Gate-1 #8 holds (Rue, round 5).
- Home stays the today dashboard (Rue, round 3).
- Cook view: read + scale + keep-awake (Rue, round 3).
- Plan on phone: days stacked (Rue, round 5).
- Eating Out: carried along minimally, added to the contract minimally (Rue, rounds 3, 6).
- Gate 4 (Rue, 2026-11-15): phone recipe actions in a top strip (placement A); List add field under the title, "+" focuses it, no docked bar; recipe form Save in a sticky bottom bar; posture switch 1024, tablets get the phone layout, Plan stacks days in one column at 768–1023; labelled pills at 320 px; everything else as drawn (Plan days as rows with the picker aside ≥1024 hidden on touch, dialogs centred card ≥768 / bottom sheet below, delete confirms on a secondary pill, Home order hero · week · list · Favourite · Recently added · Top spots, recipe page two columns ≥768, form two columns ≥768, 404 "Recipe not found" card). Open for gate 5: compact bar state, "+" labels and Home sheet copy, "Reset to 1 servings".
- Gate 1 (Rue, 2026-11-15): Plan "+" opens the Add dialog for today's Dinner, else Monday Dinner of the shown week, with no day/meal choice in the dialog; on Eating Out pages the spot actions replace Search recipes / Add recipe (top bar and phone), the brand stays; Top spots stays on Home; G5 toasts are the existing status notices restyled; the slop-baseline filter is kept until the cleanup.
- References: `references.md` (Mobbin, agent-found).

## Done when
- Rue signs off gate 4 wireframes and gate 5 hi-fi for every screen in the inventory.
- After the build: every contract route renders on the fingerprint at 375/768/1280, proof:full green, the phone bar offers search and Add recipe from every screen outside Eating Out (the spot actions there), and the recipe page keeps the screen awake.

## Split off
- Eating Out redesign (IA, cards, spot page) — later change.
