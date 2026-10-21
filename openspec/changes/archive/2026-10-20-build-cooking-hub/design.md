## Context

`~/Repos/Rues-Cooking-Hub` holds only `openspec/` and this change; `main` has no commits and there is no remote.
Everything is created here. The shape (Kit 3, `#lib` imports, migrations runner, harness, CI, release) is copied
from `~/Repos/Rues-Arcade`; the test routes, the `html[data-hydrated]` wait and the tokens.css approach from
`~/Repos/Life-Manager` (research-stack.md). The app runs later on the Homelab LXC `rues-cooking-hub01` behind nginx
on plain HTTP (research-infra.md), single user, no login. Supporting notes: scope.md (Gate 0, source of the S-items),
decisions.md, research-*.md in this directory; UI inspiration in `/home/Rue/Pictures/UI-inspo/` (all five images).

## Goals / Non-Goals

**Goals:** everything in scope.md S1–S32, built so the later Food Spots change (split-food-spots.md) adds an area
without rewriting the shell, design system or data layer.

**Non-Goals:** as in proposal.md → Non-Goals (Food Spots, Homelab work, cook mode, cook log/ratings/collections,
leftovers/suggestions, pantry/provenance/auto-categories, unit conversion, offline/PWA/HTTPS, login, dark mode, other
import sources, multiple lists).

## Decisions

From scope.md (Gate 0), unchanged:
- Everything in `decisions.md` holds; key ones: single user, no login; structured ingredients; URL import with
  preview; English UI; images as BLOB; desktop and phone equal; light warm theme; motion set confirmed by Rue (S8,
  S15, S16, S18, S21, S22, S31, nav shrink); mockups approved before feature UI.
- Names follow Rues-Arcade: repo `Rue-Asha/Rues-Cooking-Hub` (public, needed for the release download), app title
  "Rues Cooking Hub", service `rues-cooking-hub`.
- Ship: `ship: merge`, `release: tag` (tag v0.1.0 after merge). Ruleset in Life-Manager shape (required checks),
  applied on Rue's go.
- Outward steps (each asked when reached): create GitHub repo + bootstrap commit, secrets
  `HOMELAB_BUMP_APP_ID`/`HOMELAB_BUMP_APP_KEY`, ruleset, push/PR/merge/tag.
- Homelab names: host `rues-cooking-hub01`, variable `rues_cooking_hub_version`, data dir
  `/var/lib/rues-cooking-hub/rues-cooking-hub.db`, tarball `rues-cooking-hub-X.Y.Z.tgz`.

Technical decisions (planner):
- **Git root.** `main` is unborn. Before Build the orchestrator creates the one empty bootstrap commit of R6 on
  `main` locally (`git commit --allow-empty -m "chore: bootstrap"`, reversible, nothing pushed) and only then runs
  `git switch -c flow/build-cooking-hub` and commits the plan, so `main` is an ancestor of the feature branch: Gate 2
  diffs `main...flow/build-cooking-hub`, and at Ship (Rue's go) the shipper creates the public repo, pushes `main`
  (just the bootstrap commit), then the branch, and opens the PR. Alternative rejected: creating the bootstrap commit
  on GitHub at Ship gives unrelated histories, which a PR cannot compare without an extra
  `--allow-unrelated-histories` merge. Steps in `docs/release.md` (U3).
- **Version.** U1 scaffolds `0.0.0`; the last unit bumps to `0.1.0` (feature → minor, ship.md *Release*) with the
  retitled version test written first, and the shipper tags `v0.1.0` after the merge.
- **Stack.** SvelteKit ^3, svelte ^5.57, vite ^8.3, vitest ^5, TS ^6, adapter-node ^6, @playwright/test ^1.64; no
  `svelte.config.js`; `vite.config.ts` from Rues-Arcade with `test.include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']`;
  `#lib` / `#lib/*` imports with explicit `.ts`; `check` with `--fail-on-warnings`; engines `node >=22.18`.
- **Images (R1): sharp** in `dependencies` (native, not bundled by adapter-node; prebuilt `@img/sharp-linux-x64` +
  libvips land in the tarball through `npm ci --omit=dev --ignore-scripts`, which installs optional deps). Stored as
  WebP: resize to long side ≤ 1600 px, quality 80 → 40 in steps of 10 until ≤ 200 KB, then shrink the long side by 20 %
  and repeat. Proven on Debian-like glibc by gate.yml's e2e against the unpacked tarball. Alternative rejected:
  client-side canvas downscaling (works on http) — URL import downloads images on the server, so it needs a server
  path anyway.
- **Upload size.** adapter-node's default `BODY_SIZE_LIMIT` (512K) and nginx's default `client_max_body_size` (1m)
  would reject photos before the app sees them. The e2e server runs with `BODY_SIZE_LIMIT=16M`; the Homelab follow-up
  needs `BODY_SIZE_LIMIT=16M` and `client_max_body_size 16m` (runbook). The 15 MB check runs in the browser first
  (message before upload) and again on the server.
- **Markdown: markdown-it** with `html: false`, `linkify: false`, a `validateLink` allowing only http/https/mailto;
  rendered on the server into the page. Bigger alternative: a DOM sanitiser (DOMPurify + jsdom) — buys allowing safe
  inline HTML, costs a heavy dependency for nothing in scope.
- **Search (S19).** `recipes.search_text` holds `fold(title + description + ingredient names + tag names)`, rebuilt
  by `refreshSearchText(id)` on every recipe save and on tag rename/delete; queries use `instr(search_text, fold(q))`.
  `fold()` = NFC, trim, collapse whitespace, `toLowerCase()` (JS folds ä/Ä, SQLite NOCASE folds ASCII only). Tag
  uniqueness uses the same `fold()` in a `name_key` column; list items and category memory use `nameKey()` (below).
- **Parse on save.** Ingredient lines are stored with their original `text` plus the parse; the parse is edited by
  editing the text (the live preview shows the result). Bigger alternative: per-field overrides of quantity/unit/name
  — buys fixing a bad parse without rewording, costs three more inputs per line.
- **Import.** `fetch` with `AbortSignal.timeout`, streamed body cut at 5 MB, http(s) only (R8), redirects followed;
  JSON-LD found by regex over `<script type="application/ld+json">`, meta by regex over `<meta property="og:…">` /
  `<title>`, entities decoded — no HTML parser dependency. Only `totalTime` → cook minutes. `recipeCategory` and
  `keywords` (string split on commas, or array) become `draft.tagNames`, trimmed and de-duplicated by `fold()`; the
  preview's tag field shows them and Save resolves them through `ensureTags` (existing tags reused, new ones created;
  Gate 1 addition d). The preview is the normal
  form prefilled; the image is downloaded on Save through the form's image-URL path (one path for import and manual
  "image URL"). Duplicate check compares `normaliseUrl()` (parsed `href` without hash) against stored source URLs.
  Real-site fixtures for unit tests are saved once by U7's builder (the only network access in the build); e2e uses a
  local fixture server started inside the test (`e2e/fixture-server.ts`), so nothing test-only ships in the build.
- **Route layout.** App pages live in the group `src/routes/(app)/` whose `+layout.svelte` holds the nav (U10); the
  root `+layout.svelte` only sets `html[data-hydrated]` and the global CSS. `/__mockups/*` and `/__test/*` sit
  outside the group and are 404 unless `COOKING_HUB_TEST=1` (`requireTestFlag()`, U1).
- **Server API style.** Pages use `load` + form actions with `use:enhance`; drag & drop, favourite and check-off
  submit the same kind of actions programmatically (`requestSubmit` on a small form), so there is no separate JSON
  API. Every write goes through a function in `src/lib/server/*.ts` (Contracts); routes only parse FormData and map
  errors to field messages.
- **Archive state in the URL.** `?tags=<id,id>&fav=1&q=<text>&sort=newest|title|time`; chip and toggle changes push a
  history entry, typing in search replaces it (debounced 200 ms). The featured stack ignores filters.
- **Today.** `today()` in `src/lib/server/clock.ts` (server local date, overridable by `/__test/clock`); Plan, Home
  and "Add to plan" defaults take it from the server load, never from the browser clock.
- **Drag & drop.** Native HTML5 DnD (`draggable`, `dragover`/`drop`), desktop only (≥1024 px and a fine pointer);
  dropping on an entry inserts before it, on a slot's empty area appends. The "Move to…" menu is on every entry on
  every device and is the keyboard path.
- **Shopping amounts (Gate 1 addition g).** Each item keeps two parts as JSON text
  `[{ "quantity": n, "unit": "g" | null }]`: `manual_amounts` (what Rue typed) and `plan_amounts` (what the last
  "Add from plan" contributed); the list shows `mergeAmounts(manual, plan)`. `origin` says who created the row. "Add
  from plan" in one transaction: delete open `plan`-origin rows, clear `plan_amounts` on open `manual` rows, then per
  aggregated name: skip it if a checked row with that key is `plan`-origin or has a plan part; else write it into the
  open `manual` row with that key (plan part only, the manual part kept); else insert a `plan` row. Editing an item's
  amount edits the manual part of a manual row (the plan part is shown read-only as "From plan: …") and the plan part
  of a plan row (lost at the next regenerate, as scope says). Metric families sum in the base unit (g, ml) and display
  in kg / l from 1000. Quantities display with at most two decimals, trailing zeros trimmed.
- **Name keys (Gate 1 addition c).** List items, category memory and manual merges match on `nameKey(name)` =
  `fold(name)` with the last word singularised (`ies`→`y`, `oes`→`o`, `ches`/`shes`/`sses`/`xes`/`zes` drop `es`, a
  final `s` drops unless the word ends in `ss`, `us` or `is`). The shown name is the longest variant seen
  (`1 onion` + `2 onions` → "onions", 3). Tags and search keep plain `fold()`.
- **E2E isolation.** One server, one `.e2e/$PORT.db`, `workers: 1`, every data test starts with `reset()`. Bigger
  alternative: one server + DB per project (two webServers) — buys roughly half the suite time, costs a second port per
  unit that `flow-unit` does not hand out.
- **Motion primitives live in `motion.ts`** (U4) and are not edited by feature units; a feature that needs more creates
  its own module next to its component (e.g. `src/lib/recipes/coverflow.ts`). The CSS twin of `reducedMotion()` is
  `@media (prefers-reduced-motion: reduce)`.

## Visual brief

Builders and the design unit work from this section, not from the conversation.

**Inspiration read** (`/home/Rue/Pictures/UI-inspo/`, all five):
- *architect website hero* and *traveling website hero* (same template): a full-bleed warm photo inside a large
  rounded frame; a centred frosted-glass pill nav with the active item as a dark filled pill; a dark pill CTA ending in
  an arrow inside a white circle; a thin letter-spaced kicker with em-dashes ("ARCHITECTURE — INTERIORS —
  LANDSCAPES"); a large light serif headline with one accent word in warm brown; a bottom row of glass cards — a
  featured card with photo, a `01 / 06` counter and a round prev/next pair (one outlined, one dark filled), a stats
  card with thin icons, and one dark tile with an arrow-in-circle at its corner. Take: glass pill nav, kicker, serif
  headline with accent word, arrow-in-circle, counter + round prev/next, glass card row, one dark tile.
- *Modern Modular Architecture (Mindframe)*: white ground, headline mixing upright sans and serif italic; a coverflow
  of tall rounded photo cards, the centre card largest, neighbours smaller and behind, each with its own `01/20`
  counter, a title over the photo and small chips; outlined pill tags. Take: the Featured stack (S16).
- *Website concept for drink bar (NOAL)*: a bento of rounded tiles in olive green, brick red and photo; the red tile
  carries a date ("12 Sep 2024") and a ruled list ("Drinks of the day", amounts right-aligned in ml); a big photo tile
  with serif caps and an arrow-in-circle; "Next" with dots; a dark bar with round photo thumbnails, one in an olive
  card. Take: the Home bento (S32), the brick-red list tile with ruled lines and right-aligned amounts, round
  thumbnails for "This week", olive and brick as the two accents.
- *Joseph UGC Media Kit (grey AI platform)*: monochrome grey, glass rounded panels joined by thin curved lines, a
  vertical numbered pill (1, 2, 3), black pill buttons with ↗. Take only: glass panels with arrow-in-circle; not its
  grey palette or bold caps.
- Mobbin (research-mobbin.md): Apple News recipe hero (full-bleed photo + frosted info panel → S22), Crouton frosted
  floating tab bar (→ S7 phone) and card → detail hero carry-over (→ S22), pillowtalk bento of cream cards + one dark
  card (→ S32), Alma warm cream + dark-olive pill (→ buttons), Julienne serif section titles (→ section headings),
  NYT Cooking chip groups with live count (→ S18), Julienne/Instacart check-off fill-strike-move (→ S31). The design
  unit uses the Mobbin MCP (`mcp__mobbin__*`) for any further research, in a subagent, and cites screens by URL.

**Palette** (starting values; U4 tunes them under the contrast tests, names stay):
`--ground` cream #F4EFE6 · `--sand` #E8DFD0 · `--surface` #FBF8F2 · `--line` #DDD3C2 · `--stone` #8A847A ·
`--ink` #2B2723 · `--ink-2` #5C564E · `--olive` #55633F · `--olive-soft` #E4E7D6 · `--brick` #B4432F ·
`--brick-soft` #F3DED7 · `--dark` #2A2724 (the one dark tile style) · `--on-dark` #F4EFE6 · `--glass`
rgb(251 248 242 / 0.72) + `backdrop-filter: blur(18px) saturate(1.2)` + 1px border rgb(255 255 255 / 0.55) ·
`--scrim` bottom gradient to rgb(20 16 12 / 0.55) under text on photos. Olive = primary accent (active chip,
selected states, primary dark-olive pill where the dark pill would be too heavy); brick = second accent (list tile,
delete, "today"). Glass fill opacity never below 0.72 where it carries body text.

**Type:** one serif display face (light 300–400 with italic, high contrast, for page titles, hero headlines, section
headings, the accent word in italic or brick) and one sans text face (400/500/600 for UI and body), both OFL, chosen
by U4 from `@fontsource` packages (`npm pack`, copy the woff2 + licence into `static/fonts/`, do not keep the package).
Shortlist to try: Fraunces, Cormorant Garamond, Instrument Serif for display; Inter, DM Sans, Manrope for text.
Scale: display 56/40/32 desktop, 40/32/26 phone; body 16; small 13; kicker 11–12 uppercase with 0.2em tracking;
counters in tabular numerals.

**Components:** GlassPanel (radius 28), PillNav (glass, active item dark pill), ArrowButton (40–48 px circle, dark
with light arrow or light with dark arrow, → or ↗), RoundNav (prev outlined + next dark), Card (photo top, radius 24,
title in sans 600, meta in `--ink-2`), Chip (outlined pill, active filled olive), Button (dark pill with trailing
ArrowButton; secondary outlined), Kicker, Counter (`01/07`), Tile (bento cell: light, photo, brick, olive or the one
dark style), ImagePlaceholder (sand ground, a line-drawn plate/fork motif, never a broken image).

**Motion set** (confirmed with Rue; transform/opacity only; reduced motion → instant or fade):

| Item | Behaviour | Test-visible proxy | Reduced motion |
|---|---|---|---|
| S8 page transitions | cross-fade + slight rise between areas via View Transitions | `startViewTransition` called | not called |
| S7 nav shrink | nav scales/tightens after 48 px scroll | `data-compact` | instant |
| S15 staggered entrance | cards rise in, 40 ms apart | increasing animation start | no animation |
| S16 coverflow | stacked cards with depth, step slides | counter, front card | instant swap |
| S18 FLIP | cards glide to new positions on filter/sort | running animation on a card | none |
| S21 favourite | heart pops and fills | `aria-pressed` | fade |
| S22 hero | parallax + slight zoom on scroll; card ↔ hero shared element | transform changes; `view-transition-name` | none |
| S31 check-off | fill, strike, slide into "Checked" | item in Checked section | no slide |

**Alignment rule (one for all main screens):** content sits in one centred column, `max-width: 1200px`, side gutter
16 px on phone and 32 px from 768 px; the page header (kicker + serif title) and every section heading start at the
column's left edge; only full-bleed heroes (recipe page, Home hero tile on phone) and the nav leave the column. The
top nav is centred on the column.

**Desktop (≥1280) is judged as seriously as phone** — use the width, no empty whitespace:
- Home: 4-column bento; hero 2×2, This week 2×1, Shopping list (brick) 1×1, Favourite (olive or dark) 1×1.
- Recipes: Featured coverflow across the column; chip row + search + sort on one line; grid of 4 cards (≈282 px).
- Recipe page: hero ~60 vh full-bleed, glass info panel overlapping its lower left; below, ingredients (sticky,
  360 px) beside steps, notes under the steps.
- Import: URL field + "Start from scratch" as one glass panel; the preview form in two columns (meta left,
  ingredients/steps right), live parse beside each line.
- Plan: recipe rail 248 px + 7 day columns. Fit: 1200 − 248 − 16 gap = 936 / 7 ≈ 133 px per day; entries show a
  32 px thumbnail and a 2-line clamped 13 px title; four slots stacked per day column. Legibility exception: day
  columns use the small size (13 px) for entry titles.
- List: categories in two columns, the "Checked" section full width at the bottom; add field and "Add from plan" in
  the header row.
Phone: one column; Plan days stacked; tab bar at the bottom with content padded above it.

## Contracts

Created by U2 (types + stubs that typecheck; `fold`, `dates`, `clock`, `copy`, `errors`, test routes and e2e helpers
are real). Later units fill the stubs and must not change shapes without re-planning. Stubs throw
`new Error('not implemented')`, except `parseIngredient` (returns `{ text, quantity: null, unit: null, name: text,
note: null }`) and `refreshSearchText` (no-op), which the seed route calls. U2 also creates placeholder pages for `/recipes`, `/plan`
and `/list` (an empty `<main>`, no heading, no behaviour) so the nav (U10) has targets; the owning units replace them.

### Schema

`migrations/0001_tags.sql` (U1):
```sql
CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
INSERT INTO tags (name, name_key) VALUES ('Breakfast','breakfast'),('Main Course','main course'),('Side','side'),
  ('Dessert','dessert'),('Snack','snack'),('Soup','soup'),('Salad','salad'),('Baking','baking');
```
`migrations/0002_core.sql` (U2):
```sql
CREATE TABLE images (id INTEGER PRIMARY KEY, mime TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
  bytes BLOB NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE recipes (id INTEGER PRIMARY KEY, title TEXT NOT NULL CHECK (length(trim(title)) > 0), description TEXT,
  source_url TEXT, servings INTEGER NOT NULL DEFAULT 2 CHECK (servings >= 1),
  prep_minutes INTEGER CHECK (prep_minutes >= 0), cook_minutes INTEGER CHECK (cook_minutes >= 0), notes TEXT,
  favourite INTEGER NOT NULL DEFAULT 0, favourited_at TEXT, image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  search_text TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX recipes_source_url ON recipes(source_url);
CREATE TABLE recipe_tags (recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (recipe_id, tag_id));
CREATE TABLE ingredient_lines (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  section INTEGER NOT NULL, section_title TEXT, position INTEGER NOT NULL, text TEXT NOT NULL,
  quantity REAL, unit TEXT, name TEXT NOT NULL, note TEXT);
CREATE TABLE step_lines (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  section INTEGER NOT NULL, section_title TEXT, position INTEGER NOT NULL, text TEXT NOT NULL);
CREATE TABLE plan_entries (id INTEGER PRIMARY KEY, date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast','lunch','dinner','snacks')), position INTEGER NOT NULL,
  recipe_id INTEGER REFERENCES recipes(id), servings INTEGER, text TEXT,
  CHECK ((recipe_id IS NOT NULL AND servings >= 1 AND text IS NULL)
      OR (recipe_id IS NULL AND servings IS NULL AND length(trim(text)) > 0)));
CREATE INDEX plan_entries_day ON plan_entries(date, slot, position);
CREATE TABLE shopping_items (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL,
  manual_amounts TEXT NOT NULL DEFAULT '[]', plan_amounts TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN
  ('produce','dairy-eggs','meat-fish','bakery','pantry','frozen','drinks','household','other')),
  checked INTEGER NOT NULL DEFAULT 0, checked_at TEXT, origin TEXT NOT NULL CHECK (origin IN ('manual','plan')),
  position INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE category_memory (name_key TEXT PRIMARY KEY, category TEXT NOT NULL);
```
`plan_entries.recipe_id` has no ON DELETE action on purpose: `deleteRecipe` converts the entries first, so a missed
conversion fails loudly instead of losing entries.

### Types — `src/lib/types.ts`

```ts
export type Id = number;
export type IsoDate = string;                                  // 'YYYY-MM-DD'
export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const SLOTS: readonly { id: Slot; label: string }[];    // Breakfast, Lunch, Dinner, Snacks
export type Category = 'produce' | 'dairy-eggs' | 'meat-fish' | 'bakery' | 'pantry' | 'frozen' | 'drinks' | 'household' | 'other';
export const CATEGORIES: readonly { id: Category; label: string }[];  // Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks, Household, Other
export type ArchiveSort = 'newest' | 'title' | 'time';

export interface Section<T> { title: string | null; lines: T[] }
export interface ParsedLine { text: string; quantity: number | null; unit: string | null; name: string; note: string | null }
export interface Tag { id: Id; name: string }
export interface TagWithCount extends Tag { count: number }

// stored fields; totalMinutes is derived = (prep ?? 0) + (cook ?? 0), null when both are null
export interface Recipe {
  id: Id; title: string; description: string | null; sourceUrl: string | null; servings: number;
  prepMinutes: number | null; cookMinutes: number | null; totalMinutes: number | null;
  notes: string | null; favourite: boolean; favouritedAt: string | null; imageId: Id | null;
  createdAt: string; updatedAt: string;
  tags: Tag[]; ingredients: Section<ParsedLine>[]; steps: Section<string>[];
}
export interface RecipeCard {
  id: Id; title: string; description: string | null; imageId: Id | null; totalMinutes: number | null;
  servings: number; tags: Tag[]; favourite: boolean; createdAt: string;
}
export interface RecipeInput {
  title: string; description: string | null; sourceUrl: string | null; servings: number;
  prepMinutes: number | null; cookMinutes: number | null; notes: string | null; favourite: boolean;
  imageId: Id | null;                   // already stored via images.ts; on update a different id or null ("Remove image") deletes the old row
  tagNames: string[];                   // ensureTags() resolves them
  ingredients: Section<string>[];       // raw lines; parsed with parseIngredient on save; empty sections dropped
  steps: Section<string>[];
}
export interface ArchiveQuery { q?: string; tagIds?: Id[]; favouritesOnly?: boolean; sort?: ArchiveSort }

export interface RecipeDraft {          // import result and form prefill
  title: string; description: string | null; sourceUrl: string; servings: number;
  prepMinutes: number | null; cookMinutes: number | null; imageUrl: string | null;
  tagNames: string[];                   // recipeCategory + keywords, de-duplicated by fold()
  ingredients: Section<string>[]; steps: Section<string>[];
}
export type ImportResult =
  | { kind: 'recipe'; draft: RecipeDraft }
  | { kind: 'fallback'; draft: RecipeDraft }   // sourceUrl, title from meta or '', imageUrl from og:image, rest empty
  | { kind: 'invalid' };

export interface PlanEntry {
  id: Id; date: IsoDate; slot: Slot; position: number;
  recipe: { id: Id; title: string; imageId: Id | null; servings: number } | null;   // servings = recipe default
  servings: number | null;              // entry servings (recipe entries only)
  text: string | null;                  // free-text entries only
}
export type PlanEntryInput =
  | { date: IsoDate; slot: Slot; recipeId: Id; servings: number }
  | { date: IsoDate; slot: Slot; text: string };

export interface Amount { quantity: number; unit: string | null }
export interface ShoppingItem {
  id: Id; name: string; category: Category; checked: boolean; origin: 'manual' | 'plan'; position: number;
  manualAmounts: Amount[]; planAmounts: Amount[];   // stored parts
  amounts: Amount[];                    // derived = mergeAmounts(manualAmounts, planAmounts), what the list shows
}
export type AddFromPlanResult = { kind: 'added'; count: number } | { kind: 'empty' };

export interface Dashboard {
  hero: { kind: 'today'; recipe: RecipeCard; slot: Slot } | { kind: 'newest'; recipe: RecipeCard } | { kind: 'welcome' };
  week: { date: IsoDate; entries: { title: string; imageId: Id | null; recipeId: Id | null }[] }[];   // Mon–Sun
  list: { open: number; first: string[] };      // first ≤ 3 open item names in display order
  favourite: RecipeCard | null;
}
```

### Shared helpers (real in U2)

```ts
// src/lib/text.ts
export function fold(s: string): string;          // NFC, trim, collapse whitespace, toLowerCase()
// src/lib/dates.ts
export function weekStart(d: IsoDate): IsoDate;   // the Monday of d's week
export function addDays(d: IsoDate, n: number): IsoDate;
export function weekDays(monday: IsoDate): IsoDate[];   // 7 dates
export function isIsoDate(s: string): boolean;
// src/lib/server/clock.ts
export function today(): IsoDate;                 // test override when COOKING_HUB_TEST=1
export function setTestToday(d: IsoDate | null): void;
// src/lib/errors.ts
export class ValidationError extends Error { constructor(public errors: Record<string, string>) }
export class ImageError extends Error { constructor(public reason: 'not-image' | 'too-large' | 'download') }
// src/lib/copy.ts — every user-facing message used by more than one file
export const COPY: {
  titleRequired: 'Title is required'; servingsMin: 'Servings must be at least 1';
  entryEmpty: 'Enter a recipe or some text'; notImage: "That file isn't an image";
  tooLarge: 'Images can be at most 15 MB'; imageFailed: "Saved without image: the image couldn't be downloaded.";
  importFailed: "Couldn't read a recipe from this page"; invalidUrl: 'Enter a valid web address (http or https)';
  duplicate: 'Already in your archive';
  amountInvalid: 'Enter an amount like 200 g'; nothingToCopy: 'Nothing to copy';
  nothingPlanned: 'Nothing planned in this range'; noMatch: 'No recipes match';
  discard: 'Discard changes?';
};
// src/lib/server/test-flag.ts (U1)
export function testFlag(): boolean;              // process.env.COOKING_HUB_TEST === '1'
export function requireTestFlag(): void;          // throws error(404) otherwise
```

### Server functions (stubs in U2, owner in brackets)

```ts
// src/lib/ingredients/parse.ts [U5]
export function parseIngredient(text: string): ParsedLine;
export function canonicalUnit(word: string): string | null;
// src/lib/shopping/aggregate.ts [U5]  (pure)
export interface Contribution { factor: number; lines: ParsedLine[] }   // factor = entry servings / recipe servings
export interface AggregatedItem { name: string; nameKey: string; amounts: Amount[] }
export function aggregate(contributions: Contribution[]): AggregatedItem[];
export function mergeAmounts(a: Amount[], b: Amount[]): Amount[];
export function nameKey(name: string): string;                        // fold() + last word singularised (design.md → Name keys)
export function formatAmounts(amounts: Amount[]): string;            // "1 cup + 200 g", "1.5 kg", ""
export function parseAmounts(text: string): Amount[] | null;          // "1 cup + 200 g" → 2 amounts; "" → []; unreadable → null

// src/lib/server/recipes.ts [U6]
export function createRecipe(input: RecipeInput): Id;                  // throws ValidationError
export function updateRecipe(id: Id, input: RecipeInput): void;        // throws ValidationError
export function getRecipe(id: Id): Recipe | null;
export function listRecipes(query: ArchiveQuery): RecipeCard[];
export function featuredRecipes(): RecipeCard[];                       // 7 newest, createdAt desc, id desc
export function findBySourceUrl(url: string): { id: Id; title: string } | null;
export function planUsage(id: Id): number;
export function deleteRecipe(id: Id): { convertedEntries: number };
export function setFavourite(id: Id, favourite: boolean): void;        // sets/clears favouritedAt
export function refreshSearchText(id: Id): void;
// src/lib/server/tags.ts [U6]
export function listTags(): TagWithCount[];                            // by name
export function ensureTags(names: string[]): Tag[];
export function renameTag(id: Id, name: string): { mergedInto: Id | null };   // onto an existing name: recipes move to that tag, this one is deleted
export function deleteTag(id: Id): { removedFrom: number };
// src/lib/server/images.ts [U8]
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; export const MAX_LONG_SIDE = 1600; export const TARGET_BYTES = 200 * 1024;
export function storeImage(bytes: Uint8Array): Promise<Id>;           // throws ImageError
export function storeImageFromUrl(url: string): Promise<Id>;          // throws ImageError('download' | 'not-image' | 'too-large')
export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null;
// src/lib/server/import.ts [U7]
export const IMPORT_TIMEOUT_MS = 10_000; export const MAX_PAGE_BYTES = 5 * 1024 * 1024;
export function normaliseUrl(input: string): string | null;          // null = not a valid http(s) URL
export function readRecipe(url: string, opts?: { timeoutMs?: number }): Promise<ImportResult>;
export function extractRecipe(html: string, pageUrl: string): RecipeDraft | null;
export function extractMeta(html: string, pageUrl: string): { title: string | null; imageUrl: string | null };
export function parseDuration(iso: string): number | null;
export function parseYield(y: unknown): number | null;
// src/lib/server/plan.ts [U9]
export function weekEntries(monday: IsoDate): PlanEntry[];
export function entriesInRange(from: IsoDate, to: IsoDate): PlanEntry[];
export function addEntry(input: PlanEntryInput): Id;                   // appended; throws ValidationError
export function updateEntry(id: Id, patch: { servings?: number; text?: string }): void;
export function moveEntry(id: Id, to: { date: IsoDate; slot: Slot; position?: number }): void;   // no position = end
export function deleteEntry(id: Id): void;
export function copyWeek(fromMonday: IsoDate, toMonday: IsoDate): { copied: number };
// src/lib/server/shopping.ts [U9]
export function listItems(): ShoppingItem[];                           // category order, then position; checked last by checkedAt
export function addManual(text: string): Id | null;                    // null = nothing added
export function updateItem(id: Id, patch: { name?: string; amounts?: Amount[] }): void;   // amounts = manual part (manual rows) or plan part (plan rows)
export function deleteItem(id: Id): void;
export function setChecked(id: Id, checked: boolean): void;
export function clearChecked(): number;
export function setCategory(id: Id, category: Category): void;        // also writes category_memory
export function addFromPlan(from: IsoDate, to: IsoDate): AddFromPlanResult;
// src/lib/server/home.ts [U19]
export function dashboard(): Dashboard;
```

**Unit table** (parse.ts): `g` (g, gram, grams), `kg` (kg, kilogram(s)), `ml` (ml, millilitre(s), milliliter(s)),
`l` (l, litre(s), liter(s)), `tsp` (tsp, teaspoon(s)), `tbsp` (tbsp, tbs, tablespoon(s)), `cup` (cup(s)), `oz`
(oz, ounce(s)), `lb` (lb, lbs, pound(s)), `pinch` (pinch, pinches), `clove` (clove(s)), `can` (can(s), tin(s)),
`slice` (slice(s)), `bunch` (bunch, bunches), `sprig` (sprig(s)); case-insensitive, a trailing `.` allowed. Families:
{g, kg ×1000}, {ml, l ×1000}.

### Motion — `src/lib/motion.ts` (U4)

```ts
export function reducedMotion(): boolean;
export function rise(node: Element, opts?: { delay?: number; y?: number }): TransitionConfig;   // entrance
export function stagger(index: number): number;                                                // delay ms (40 × index, capped)
export const flipOptions: () => { duration: number; easing: (t: number) => number };            // for animate:flip
export function pop(node: Element): TransitionConfig;                                          // favourite heart
export function slideOut(node: Element): TransitionConfig;                                     // check-off leave
export function viewTransition(navigation: OnNavigate): Promise<void> | void;                  // for onNavigate; no-op without support or under reduced motion
export const heroName: (id: number) => string;                                                 // 'recipe-hero-' + id
```

### Routes (owner)

| Route | Files | Owner |
|---|---|---|
| `/` | `src/routes/(app)/+page.svelte`, `+page.server.ts` | U1 placeholder, U19 |
| (layout) | `src/routes/(app)/+layout.svelte`, `src/lib/shell/AppNav.svelte`, `src/lib/nav.ts` (`activeArea(pathname)`) | U10 |
| `/recipes` | `src/routes/(app)/recipes/+page.svelte`, `+page.server.ts` | U2 placeholder, U12, U17 adds the stack |
| `/recipes/[id]/favourite` (POST, FormData `favourite=0|1`) | `src/routes/(app)/recipes/[id]/favourite/+server.ts` | U12 |
| `/recipes/new` (URL import) | `src/routes/(app)/recipes/new/+page.svelte`, `+page.server.ts` | U14 |
| `/recipes/new/form` (scratch) | `src/routes/(app)/recipes/new/form/+page.svelte`, `+page.server.ts` | U11 |
| `/recipes/[id]` | `src/routes/(app)/recipes/[id]/+page.svelte`, `+page.server.ts` | U15 |
| `/recipes/[id]/edit` | `src/routes/(app)/recipes/[id]/edit/+page.svelte`, `+page.server.ts` | U11 |
| `/recipes/tags` | `src/routes/(app)/recipes/tags/+page.svelte`, `+page.server.ts` | U17 |
| `/plan` | `src/routes/(app)/plan/+page.svelte`, `+page.server.ts` | U2 placeholder, U13, U18 |
| `/list` | `src/routes/(app)/list/+page.svelte`, `+page.server.ts` | U2 placeholder, U16 |
| `/images/[id]` | `src/routes/images/[id]/+server.ts` | U8 |
| `/healthz` | `src/routes/healthz/+server.ts` | U1 |
| `/__test/{reset,seed,clock}` | `src/routes/__test/*/+server.ts` | U2 |
| `/__mockups/[screen]` | `src/routes/__mockups/**` | U4 |

The recipe form component `src/lib/recipes/RecipeForm.svelte` (U11) takes
`{ draft: RecipeDraft | Recipe-shaped values; errors?: Record<string, string>; tags: Tag[]; action: string }` and is
reused by U14 for the import preview. `src/lib/recipes/save.ts` (U11) exports
`saveFromForm(form: FormData, existingId?: Id): Promise<{ id: Id; imageFailed: boolean } | { errors: Record<string, string> }>`
(FormData → RecipeInput, image file or URL → images.ts, create/update), used by U11 and U14.
`src/lib/recipes/RecipeCard.svelte` and `FavouriteButton.svelte` (U12) are reused by U15, U17 and U19.

### E2E helpers — `e2e/helpers.ts` (U2; later units add helpers in their own test files, not here)

```ts
export async function reset(request: APIRequestContext): Promise<void>;
export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult>;
export async function setToday(request: APIRequestContext, date: IsoDate | null): Promise<void>;
export async function open(page: Page, path: string): Promise<void>;   // goto + wait for html[data-hydrated]
export const calm: (page: Page) => Promise<void>;                      // emulateMedia({ reducedMotion: 'reduce' })

export interface SeedInput {
  recipes?: { title: string; description?: string; sourceUrl?: string; servings?: number; prepMinutes?: number;
    cookMinutes?: number; notes?: string; favourite?: boolean; favouritedAt?: string; createdAt?: string;
    tags?: string[]; image?: boolean; ingredients?: Section<string>[]; steps?: Section<string>[] }[];
  entries?: { date: IsoDate; slot: Slot; recipe?: number; servings?: number; text?: string }[];   // recipe = index into recipes
  items?: { name: string; manualAmounts?: Amount[]; planAmounts?: Amount[]; category?: Category; checked?: boolean; origin?: 'manual' | 'plan' }[];
  categoryMemory?: { name: string; category: Category }[];
}
export interface SeedResult { recipes: Id[]; entries: Id[]; items: Id[] }
```
The seed route inserts with SQL (explicit timestamps), parses ingredient lines with `parseIngredient` and calls
`refreshSearchText` per recipe, so seeded data gains real parses and search once U5/U6 are merged. `image: true`
inserts a small generated image constant (no sharp needed).

### E2E conventions
- Each unit owns its own e2e files (named in its `files=`); no unit edits another unit's e2e file.
- Device-specific tests skip the other project: `test.skip(testInfo.project.name !== 'desktop', 'drag & drop is desktop-only')`.
- Screenshots go to `test-results/shots/<project>-<slug>.png` and are not committed.
- Exact-text locators (`getByText(x, { exact: true })`) for short labels.

## Risks / Trade-offs

- R1 sharp is native → mitigated: prebuilt linux-x64 in the tarball, image e2e runs against the unpacked tarball in
  gate.yml; if it fails on Debian 13 at deploy, the Homelab change surfaces it before any data exists.
- R2 sites block fetches or lack JSON-LD → fallback form with meta prefill; real fixtures saved once.
- R3 fuzzy parsing → original text always kept and shown; editing the text re-parses.
- R4 first bump fails → accepted; publish still succeeds.
- R5/R6 check01 and the empty `main` → handled at Ship via the runbook (U3).
- R7 animation jank → transform/opacity only, reduced-motion path, judged at the mockup stop and Gate 2.
- R8 SSRF on the LAN → http(s) only, 10 s, 5 MB; single user. No private-address blocking (the e2e fixture server is
  on localhost).
- `workers: 1` makes `proof:full` slow (estimate 8–12 min for phone + desktop) → builders run it in the background
  and only once per unit (flow LEARNINGS).
- Mockup routes stay in the build (404 without the flag) as the reference for later changes; cost: a few KB.

## Migration Plan

New app, no data to migrate. Rollout after merge is the runbook in `docs/release.md`: tag v0.1.0 (release
workflow), then the Homelab follow-up change creates `rues-cooking-hub01` and deploys the pinned tarball. Rollback =
the Homelab pin back to a previous tag; migrations are additive.

## Open Questions

None open. Resolved at Gate 1 (2026-10-19):
- **Mockup photos.** U4's builder downloads ~8 free-licence food photos once into `static/mockups/` (the only web
  download allowed in U4) and records each file's source URL, author and licence in `static/mockups/CREDITS.txt`.
- **Planner additions** a, c, d, e, f, g accepted (comma decimals, singular/plural name keys, tags from import, tag
  rename merges, "Remove image", plan amounts merge into manual items); b (German units) declined.

## Mockup approval (2026-10-19)
Rue approved the `/__mockups/*` screens (structure and design) as the reference for all feature UI. Phone hero edge to edge, desktop framed.
Rue's explicit condition: the real screens get smooth transitions and fitting animations throughout (page transitions, shared-element card → detail, stagger + FLIP, parallax hero, shrinking glass nav, coverflow, check-off, favourite, sheets/popovers, drag ghost). Build them with `#lib/motion.ts` (transform/opacity only, `reducedMotion()` path); a UI unit is not done while its screen is static.

## Build notes (handoffs between units, written by the orchestrator)
- U10: `(app)/+layout.svelte` owns `<main>`; pages render section/div. The layout's View Transition runs only on area changes; in-area transitions (card → detail, U15) call their own `viewTransition`.
- U11: a failed image download on save redirects to `/recipes/<id>/edit?imageFailed=1` with the notice (`savedLocation()` in save.ts); other saves go to `/recipes/<id>`.
- U12: every archive card's media carries `view-transition-name: recipe-hero-<id>` (reduced motion off) via `Card`'s `heroName`. U15 attaches the detail hero to the same name. U17: a Featured card for the same recipe must not carry the same name at the same time (duplicate names make startViewTransition fail); the stack goes in `(app)/recipes/+page.svelte` between `</header>` and `<section class="archive">`, inside the `{:else}` branch, with a `featured` field from load.
- U12: chips with 0 recipes are hidden unless selected; selected tags lead the chip row only on load; "Clear filters" keeps the sort. Kit 3: `goto(url, { replace, reset: false })` and `refreshAll()` (no keepFocus/noScroll/invalidateAll).
- U13: `src/lib/plan/Sheet.svelte` is the shared `<dialog>` wrapper (bottom sheet on phone, centred on desktop, animated) — U18's "Move to…" and U15's "Add to plan" may reuse it. Picker/rail search filters client-side on title + tag names. Copy week lets Rue step the source week (default previous). The rail has no drag affordance yet (U18).
- Fix after U16 merge: exiting menus/forms keep a 160 ms outro; `src/lib/plan/Entry.svelte` sets aria-hidden on outrostart and clears it on introstart so only one "Save" exists in the role tree. Reuse this pattern for any outro'd control (U17–U19).
- Ship step 1 done early on Rue's request (2026-10-19): repo `Rue-Asha/Rues-Cooking-Hub` created (public), bootstrap `main` pushed, fork-PR approval = `all_external_contributors`. Finding for Verify: docs/release.md step 1's `gh api … -f approval_policy=…` did not apply (policy stayed first_time_contributors); the working form is `echo '{"approval_policy":"all_external_contributors"}' | gh api -X PUT …/fork-pr-contributor-approval --input -`.
- U15: card ↔ recipe page shared hero via `recipe-hero-<id>` + `view-transition-class: recipe-hero`; the layout's onNavigate also starts a VT when either side is `/(app)/recipes/[id]`. The mockup's desktop stats card was replaced by the spec's one-line times/servings; the dark "Planned" tile links to the next planned week. U19 Home cards reuse Card and get the same hero transition for free.
- U18: optimistic moves (`placed()` in dnd.ts, POST `?/move`, `refreshAll()`); drag context via `setBoard/getBoard`.
- U14: /recipes/new uses `/mockups/penne-arrabbiata.jpg` (static/mockups) as its band photo — static/mockups ships in production; keep it or replace the photo. Import e2e uses own small fixtures (relative image URLs) via e2e/fixture-server.ts; imported tag names map to existing tags' spelling.
- U17: the archive now has a Featured stack whose front card is a link named after the newest recipe — e2e lookups of recipe links on /recipes must scope to the grid (`getByRole('list', { name: 'Recipes' })`). Only the clicked Featured card carries `recipe-hero-<id>` (grid card drops it via `li.handoff`). Tag manager at /recipes/tags.
