## Context

Rues Cooking Hub (SvelteKit 3, adapter-node, `node:sqlite`, light warm design system, approved mockups from
build-cooking-hub) has four areas: Home, Recipes, Plan, List. This change adds a fifth, visibly separate area for
restaurants and cafés ("spots"). Scope and its decisions come from `scope.md` (Gate 0, 2026-11-02); codebase and Mobbin
findings from `research.md`. The archive's patterns are the model: `src/lib/server/recipes.ts` (CRUD + `search_text`),
`src/lib/recipes/save.ts` (form → input, image resolution), `query.ts` (URL state), `FilterBar.svelte`, `Card`,
`ImageField`, `TagInput`, `DiscardDialog` + `unsaved.ts`, `src/lib/plan/Sheet.svelte`, `DeleteRecipe`.

## Goals / Non-Goals

**Goals:** S1–S18 of scope.md: nav area with divider, Spot entity with own tags, add/edit/delete, Mark visited, score
input and display, list with segments, cards, search, filters, sort and ranks, spot page with external links, area-aware
header actions, Home "Top spots", mockup first with CC0 photos, seed/reset support, release 0.2.0.

**Non-Goals:**
- Embedded map or map view — the app must not make external requests; "Open in Maps" links out instead.
- Visit history (several dated visits per spot), per-person scores, "who did you go with" — one household, one score.
- Beli-style pairwise ranking — rank is derived from the entered score only.
- Spot tag management page (rename/merge/delete) — unused tags simply drop out of the filters; can follow later.
- Planning a spot into the meal plan or shopping list — Eating Out stays its own area apart from Home's section.
- Opening hours, phone number, favourite-dishes list, visit date — notes cover these for now.
- Import of spots from Google Maps / Beli — manual entry only.
- Dark mode — the app is light-only.

## Decisions

From scope.md (Rue), unchanged:
- Tab label "Eating Out", route `/eating-out`, map-pin icon, placed last after a divider — Rue: content is different from cooking.
- Status Want to go / Visited; Visited always has a score, set via "Mark visited" — Rue.
- Score 1.00–10.00, two decimals, number field — Rue; comma accepted and dot display — German keyboard vs English UI.
- One score per spot — Rue: one household.
- Separate spot tags — Rue: recipe tags (Soup, Breakfast …) don't belong on spots.
- City and neighbourhood as separate fields, city filterable — Rue.
- Card: photo, tags, location, price (+ score badge on Visited) — Rue; no notes snippet on card.
- Detail extras: address + Open in Maps, website, notes — Rue.
- Rank within the filtered list, no rank on detail — Rue; ties share a rank — standard competition ranking, so equal scores look equal.
- Header actions context-aware — Rue. Home "Top spots" (top 4) — Rue. Otherwise no integration with plan/list — Rue.
- Price € … €€€€, optional — Rue.
- Mockup first with CC0 photos — Rue.
- Gate 1: additions (a) desktop fit at 1024px and (b) card→hero photo transition accepted; (c) accent-insensitive search declined — search behaves like Recipes.

Technical decisions (planner):
- **Score as integer hundredths** (`score_hundredths`, 100–1000). Parsing is string-based (`^\d{1,2}([.,]\d{1,2})?$`
  after trim, then integer arithmetic), never `parseFloat`, so "8.75" cannot drift. Alternative REAL + rounding: rejected
  (R4 in scope).
- **Own tables, no `kind` column on `tags`.** `spot_tags` mirrors `tags` (`name`, `name_key` = `fold(name)`, UNIQUE) so
  recipe tag code (`tags.ts`, starter tags, tag manager) stays untouched (R3). Alternative shared table with a kind
  column: would touch every recipe tag query.
- **Unused spot tags are deleted** after every spot save, update and delete (`DELETE FROM spot_tags WHERE id NOT IN
  (SELECT tag_id FROM spot_tag_links)`). With no tag manager nothing else would ever clean them, and "values in use"
  for chips and suggestions becomes simply "all spot tags".
- **Case folding is JS `fold()`, never SQLite `lower()`/`NOCASE`** (they fold ASCII only, so `MÜLLER` ≠ `müller`).
  Search uses a stored `search_text = fold(name, neighbourhood, city, tag names, notes)` and `instr()` exactly like
  recipes; city filter and city facets compare `fold(city)`. Like the recipe search, letters keep their accents
  (`muller` does not find "Müller").
- **City filter is single-choice, price filter single-choice, tags multi-choice (AND)** — matches the scope wording
  ("a city filter", "a price filter", tag chips like the archive).
- **Default segment** is computed from unfiltered totals: Visited unless Visited is empty and Want to go is not.
- **URL state** `?status=visited|want&q=&tags=1,2&city=<fold key>&price=1..4&sort=score|newest|name`. `toSpotSearch`
  always writes `status` once the user picked a segment and omits `sort` when it equals the segment default, so an
  explicit sort in the URL is exactly "a sort the user chose". Segment switch: keep the sort if it is explicit and valid
  for the target, else the target default (S8). Stale values (unknown tag id, city not in use, price outside 1–4) are
  dropped by `dropStale` before querying.
- **Sorting** in JS after the filtered SQL read: score desc → name (`localeCompare(…, { sensitivity: 'base' })`) → id;
  newest = `created_at` desc → id desc; name = `localeCompare` base → id. Ranks via `rankScores` on the sorted Visited
  list only when sort = score (competition ranking: 875, 875, 810 → 1, 1, 3).
- **Header search focus** uses the hash: "Search spots" → `/eating-out#search`; the list page focuses `input#search`
  when the URL hash is `#search` (on load, after navigation, on `hashchange`).
- **Maps link**: `https://www.google.com/maps/search/?api=1&query=` + `encodeURIComponent([name, address, city]
  .filter(Boolean).join(', '))`, only when an address exists. Plain link with `target="_blank" rel="noopener
  noreferrer"`; no preview, no embed, no request from the app.
- **Notes** render with the existing `renderMarkdown` (raw HTML off), like recipe notes.
- **Photo handling** reuses `resolveImage` from `src/lib/recipes/save.ts` (exported, unchanged logic) and the
  recipe ImageField, so errors and the "saved without image" notice are identical; a failed photo download opens
  `/eating-out/<id>/edit?imageFailed=1|kept` like recipes.
- **Seed photos**: `image: true` stores the existing synthetic PNG; `image: '/mockups/<file>'` stores a fixture photo
  through `storeImageFromUrl(new URL(path, request.url))` (same origin), so Gate 2 screenshots show real photos.
- **Motion** follows the archive and Rue's standing condition from the first mockup approval: list cards rise in
  staggered and glide on filter/sort changes (FLIP via `#lib/motion.ts`), the Mark visited sheet uses `Sheet`'s
  animation, errors use `rise`; every path has the reduced-motion branch.
- **Spot photo transition (S18)** mirrors the recipe one instead of generalising it: `spotHeroName(id)` →
  `spot-hero-<id>` next to `heroName` in `#lib/motion.ts`; the card passes it through `Card`'s existing `heroName`
  prop (the placeholder sits inside the same `.media`, so it morphs too) and the spot hero sets it with
  `view-transition-class: recipe-hero`, so the existing `::view-transition-group(*.recipe-hero)` styles in
  `(app)/+layout.svelte` apply unchanged. The layout's `onNavigate` starts a view transition when either side is
  `/(app)/eating-out/[id]`, exactly as for `/(app)/recipes/[id]`. Reduced motion: no name, no transition (the existing
  `@media (prefers-reduced-motion: no-preference)` guard in Card and the `viewTransition` helper). Alternative
  (one generic `hero-<kind>-<id>` helper reworking the recipe code): more churn in recipe files for no visible gain.
- **Mark visited** reuses `src/lib/plan/Sheet.svelte`; the sheet stays in the DOM during its closing animation, so
  `Sheet` sets `aria-hidden="true"` while `data-closing` is set (repo learning: duplicate "Save" in the role tree).

### Phone bar fit (R1)

Measured budget at 320 px: bar `min(100% − 24px, 520px)` = 296 px, minus 2 × 5 px list padding and 5 × 2 px gaps =
276 px, minus the divider (1 px line + 2 × 4 px margin ≈ 9 px) = 267 px → ≈ 53 px per link; "Eating Out" at 11 px is
≈ 52–56 px wide. The nav unit measures first and applies this ladder, stopping at the first step that passes
"Five labels fit the phone tab bar": (1) `.bar a` inline padding `var(--s-2)` → 2 px; (2) `letter-spacing: 0` below
360 px; (3) list gap 0 and divider margin 3 px below 360 px; (4) `font-size: 10.5px` below 340 px. Divider:
`flex: 0 0 auto`, a 1 px × 20 px line in `--line` (top pill: 1 px × 18 px, `margin-inline: 4px`). Compact bar:
`inline-size: min(<5 × 48 px + divider + paddings>, 100% − 24px)` ≈ 270–290 px, narrower than the full bar at 390.
If step 4 still fails, the unit stops and reports — a different label is Rue's call, not the builder's.

### Desktop header fit (S17)

At 1024 px the column is 960 px. Estimated widths: brand ≈ 240 px; pill ≈ Home 78 + Recipes 96 + Plan 70 + List 64 +
Eating Out 112 + divider 9 + gaps/padding 20 ≈ 450 px; actions ≈ 44 + 8 + "Add recipe" button ≈ 130 → ≈ 185 px. The
`1fr auto 1fr` grid leaves (960 − 450) / 2 = 255 px per side, so it should fit with ≈ 15 px to spare. The nav unit
measures first; if "Desktop header fits at 1024 px" fails, the fallback is `padding-inline: var(--s-4)` on top-pill
links between 1024 and 1279 px, then the brand word at 17 px in that range. Labels and actions are not shortened.

### Narrowest card

At 320 px: column 288 px, two columns with a 12 px gap → card 138 px, photo 126 px, body text ≈ 110 px. At 390 px the
card is 173 px, at 1280 px 288 px. Phone cards are already inside `Card`'s `@container (max-width: 240px)` regime.
The badge ("10.00", tabular numerals, 13 px, ≈ 54 px with padding) and the rank ("#10", ≈ 36 px) together with two
8 px insets need ≈ 106 px < 126 px, so both fit on the photo at 320 px. The location line clamps to one line with an
ellipsis; price and chips wrap in the meta row. The mockup unit re-measures these numbers in the browser before it
changes or adds any container-query threshold.

## Contracts

Shared by units 1–7. Unit 1 implements the data layer fully (no stubs: the UI units start only after the mockup stop,
when unit 1 is merged). Unit 2 and unit 3 own the nav and Card contracts below.

### Schema — `migrations/0003_food_spots.sql` ⚠ irreversible on Rue's database once deployed

```sql
CREATE TABLE spot_tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE spots (id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  status TEXT NOT NULL CHECK (status IN ('want','visited')),
  score_hundredths INTEGER CHECK (score_hundredths BETWEEN 100 AND 1000),
  price INTEGER CHECK (price BETWEEN 1 AND 4),
  city TEXT, neighbourhood TEXT, address TEXT, website TEXT, notes TEXT,
  image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  search_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  CHECK ((status = 'visited') = (score_hundredths IS NOT NULL)));
CREATE TABLE spot_tag_links (spot_id INTEGER NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES spot_tags(id) ON DELETE CASCADE, PRIMARY KEY (spot_id, tag_id));
CREATE INDEX spots_status ON spots(status);
```

**Stored vs derived** (every write path — `createSpot`, `updateSpot`, `markVisited`, seed — uses these names):

| Field | Stored | Notes |
|---|---|---|
| `name`, `status`, `price`, `image_id`, `created_at`, `updated_at` | yes | `name` trimmed; `price` 1–4 or NULL |
| `score_hundredths` | yes | integer 100–1000, NULL exactly when `want`; TS `scoreHundredths` |
| `city`, `neighbourhood`, `address`, `website`, `notes` | yes | trimmed; blank → NULL; `website` only `http:`/`https:` |
| `search_text` | yes (cache) | `fold([name, neighbourhood, city, …tag names, notes].join('\n'))`, rewritten by `refreshSpotSearchText(id)` after every write |
| score text "8.75" | derived | `formatScore(scoreHundredths)` |
| location "Mitte, Berlin" | derived | `locationText(neighbourhood, city)` |
| price "€€" | derived | `priceText(price)` |
| rank | derived | `listSpots` only, Visited + sort score |
| Maps URL | derived | `mapsUrl(spot)` |
| city key | derived | `fold(city)` (filter and facets) |

`resetDb()` deletes in this order: `plan_entries`, `shopping_items`, `category_memory`, `spots` (links cascade),
`spot_tags`, `recipes`, `images`, `tags`, then re-seeds the starter tags.

### Types — `src/lib/types.ts`

```ts
export type SpotStatus = 'want' | 'visited';
export type SpotSort = 'score' | 'newest' | 'name';
export type Price = 1 | 2 | 3 | 4;

// stored fields; scoreHundredths is 875 for 8.75 and null exactly when status is 'want'
export interface Spot {
	id: Id;
	name: string;
	status: SpotStatus;
	scoreHundredths: number | null;
	price: Price | null;
	city: string | null;
	neighbourhood: string | null;
	address: string | null;
	website: string | null;
	notes: string | null;
	imageId: Id | null;
	createdAt: string;
	updatedAt: string;
	tags: Tag[];
}
export interface SpotCard {
	id: Id;
	name: string;
	status: SpotStatus;
	scoreHundredths: number | null;
	price: Price | null;
	city: string | null;
	neighbourhood: string | null;
	imageId: Id | null;
	tags: Tag[];
	createdAt: string;
	rank: number | null; // derived: only Visited cards while sorted by score
}
export interface SpotInput {
	name: string;
	status: SpotStatus;
	scoreHundredths: number | null;
	price: Price | null;
	city: string | null;
	neighbourhood: string | null;
	address: string | null;
	website: string | null;
	notes: string | null;
	imageId: Id | null; // on update a different id or null deletes the old image row
	tagNames: string[]; // ensureSpotTags() resolves them
}
export interface SpotQuery {
	status: SpotStatus;
	q: string;
	tagIds: Id[];
	city: string | null; // fold(city)
	price: Price | null;
	sort: SpotSort;
}
export interface SpotCounts {
	visited: number;
	want: number;
}
export interface SpotFacets {
	tags: Tag[]; // spot tags in use, by name
	cities: { key: string; name: string }[]; // one per fold(city), name = spelling of the oldest spot, by name
}
```

### Pure modules (browser-safe)

```ts
// src/lib/spots/score.ts
export type ScoreParse = { ok: true; hundredths: number } | { ok: false; reason: 'empty' | 'invalid' };
export function parseScore(raw: string): ScoreParse;
export function formatScore(hundredths: number): string; // 875 → "8.75"

// src/lib/spots/format.ts
export const PRICES: readonly { id: Price; label: string }[]; // € … €€€€
export function priceText(price: Price): string;
export function locationText(neighbourhood: string | null, city: string | null): string | null;
export function mapsUrl(spot: { name: string; address: string | null; city: string | null }): string | null;

// src/lib/spots/query.ts
export const SPOT_SORTS: readonly { id: SpotSort; label: string }[]; // Highest score · Newest first · Name A–Z
export function sortsFor(status: SpotStatus): SpotSort[]; // visited: score, newest, name · want: newest, name
export function defaultSort(status: SpotStatus): SpotSort; // visited → score, want → newest
export function defaultStatus(totals: SpotCounts): SpotStatus;
export function parseSpotQuery(params: URLSearchParams, totals: SpotCounts): SpotQuery;
export function dropStale(query: SpotQuery, facets: SpotFacets): SpotQuery;
export function toSpotSearch(query: SpotQuery): string; // order: status, q, tags (sorted), city, price, sort (omitted when default)
export function switchStatus(query: SpotQuery, to: SpotStatus, explicitSort: boolean): SpotQuery;
export function hasSpotFilters(query: SpotQuery): boolean; // q, tags, city or price
export function rankScores(sortedDesc: number[]): number[]; // [875, 875, 810] → [1, 1, 3]
```

### Server — `src/lib/server/spots.ts` (throws `ValidationError` from `#lib/errors.ts` on invalid input)

```ts
export function ensureSpotTags(names: string[]): Tag[];
export function spotTags(): Tag[]; // every spot tag (= in use), by name: TagInput suggestions
export function createSpot(input: SpotInput): Id;
export function updateSpot(id: Id, input: SpotInput): void;
export function getSpot(id: Id): Spot | null;
export function deleteSpot(id: Id): void; // image row, links (cascade), unused tags
export function markVisited(id: Id, scoreHundredths: number): void;
export function listSpots(query: SpotQuery): SpotCard[]; // status + filters, sorted, ranked
export function spotCounts(query: SpotQuery): SpotCounts; // same filters, both statuses
export function spotTotals(): SpotCounts; // unfiltered
export function spotFacets(): SpotFacets;
export function topSpots(limit: number): SpotCard[]; // Visited, score desc, name; rank null
export function refreshSpotSearchText(id: Id): void;
```

### Form save — `src/lib/spots/save.ts` (server-only imports, used from `+page.server.ts`)

```ts
export type SpotSaved = { id: Id; imageFailed: boolean; imageKept: boolean };
export type SpotSaveResult = SpotSaved | { errors: Record<string, string> }; // keys: name, score, website, image
export async function saveSpotFromForm(form: FormData, existingId?: Id): Promise<SpotSaveResult>;
export function visitFromForm(form: FormData, id: Id): { ok: true } | { errors: { score: string } };
export const spotSavedLocation: (saved: SpotSaved) => string; // /eating-out/<id> or /eating-out/<id>/edit?imageFailed=1|kept
```

Form field names: `name`, `status` (`want` | `visited`), `score`, `price` (`''` | `1`–`4`), `city`, `neighbourhood`,
`address`, `website`, `notes`, `tag` (repeated, from TagInput), `image`, `imageUrl`, `removeImage` (from ImageField).
A `score` posted with status `want` is ignored (S12: switching to Want clears the score).

### Routes

| Route | Load | Actions |
|---|---|---|
| `(app)/eating-out` | `{ query, spots, counts, totals, facets }` | — |
| `(app)/eating-out/new` | `{ tags: spotTags() }` | default → 303 `spotSavedLocation`, or `fail(400, { errors })` |
| `(app)/eating-out/[id]` | `{ spot, notes (html), maps: string \| null }`, 404 unknown | `visit` → `{ visited: true }` or `fail(400, { errors })`; `delete` → 303 `/eating-out`; both 404 unknown |
| `(app)/eating-out/[id]/edit` | `{ spot, tags }`, 404 unknown | default → 303 `spotSavedLocation`, or `fail(400, { errors })`; 404 unknown |

### Components

- `NavItem` (`src/lib/ui/PillNav.svelte`, unit 2): gains `divider?: boolean` — PillNav renders
  `<li role="presentation" aria-hidden="true" data-divider>` before that item, in both variants.
- `src/lib/nav.ts` (unit 2): `Area` gains `'eating-out'`; `areas` gains `{ area: 'eating-out', href: '/eating-out',
  label: 'Eating Out', icon: 'pin', divider: true }`; new
  `headerActions(area: Area): { search: { label: string; href: string }; add: { label: string; href: string } }`.
- `Icon` (unit 2): new name `pin`. Unit 3 uses only icons that exist on main (the nav pin arrives via unit 2's merge).
- `spotHeroName(id: Id): string` → `` `spot-hero-${id}` `` in `src/lib/motion.ts` (unit 4). SpotCard passes it as
  `heroName`; the spot hero (unit 6) sets the same name with `view-transition-class: recipe-hero`; unit 6 adds
  `/(app)/eating-out/[id]` to the layout's `onNavigate` hero check. Home's Top spots cards get the name through
  SpotCard; no other element on any page carries `spot-hero-<id>`.
- `Card` (`src/lib/ui/Card.svelte`, unit 3; post-approval corrections unit 4) gains optional props, all defaulting to
  today's behaviour so recipe cards stay unchanged:
  `heart?: boolean = true` (false: no favourite control), `badge?: Snippet` (top-end corner over the photo),
  `rank?: number | null` (`#<n>` top-start corner over the photo), `subtitle?: string | null` (one line under the
  title, clamped with ellipsis), `extra?: Snippet` (leading items of the meta row, before the chips).
- `SpotCard.svelte` (`src/lib/spots/`, unit 4): `{ spot: SpotCard }` → Card with `heart={false}`, badge for Visited,
  `rank={spot.rank}`, `subtitle={locationText(…)}`, price in `extra`, `href="/eating-out/{id}"`. Home (unit 7) uses it.
- `ScoreField.svelte` (`src/lib/spots/`, unit 5): `{ value: string ($bindable), error?: string, id?: string }`;
  renders label "Score", `<input name="score" inputmode="decimal" autocomplete="off">`, hint "1.00–10.00" and the
  error line. MarkVisited (unit 6) uses it.

### Copy (`src/lib/copy.ts`, unit 1; corrections after the mockup stop: unit 4 only)

`nameRequired: 'Name is required'`, `scoreRequired: 'Visited spots need a score'`,
`scoreInvalid: 'Enter a score from 1.00 to 10.00, at most two decimals'`, `spotsNoMatch: 'No spots match'`. Reused:
`invalidUrl`, `notImage`, `tooLarge`, `imageFailed`, `imageKept`, `discard`. UI labels (English) live inline as in the
recipe screens: "Eating Out", "Add spot", "Search spots", "Visited", "Want to go", "Mark visited", "Open in Maps",
"Address", "Website", "Notes", "Top spots", "All spots", "Start your list", "No visited spots yet.", "Nothing on your
want-to-go list yet.", "Clear filters", "Delete “<name>”?".

### Error and danger style (no new colours)

Field errors: `<p class="error" role="alert">` at the field, 14 px / 500, `color: var(--brick)`, entering with `rise`;
the invalid control gets `aria-invalid="true"` and `border-color: var(--brick)` — the RecipeForm pattern. Delete uses
the DeleteRecipe dialog look. The score badge and rank use existing tokens only (e.g. `--dark`/`--on-dark`,
`--olive`/`--white`, glass); a new colour is a new token in `tokens.css` + `tokens.ts` with its contrast pair, added by
unit 3 only. The design-token test bans raw colours everywhere else.

### Test data and e2e isolation

`SeedInput.spots?: { name: string; status?: SpotStatus /* default 'want' */; scoreHundredths?: number;
price?: Price; city?: string; neighbourhood?: string; address?: string; website?: string; notes?: string;
tags?: string[]; createdAt?: string; image?: boolean | string /* '/mockups/<file>' */ }[]`, `SeedResult.spots: Id[]`;
seed runs `refreshSpotSearchText` per spot. Isolation: Playwright stays `workers: 1` on `.e2e/$PORT.db`; every e2e test
that touches spots starts with `reset()` (which clears spots and spot tags once unit 1 lands) and seeds what it needs;
no test depends on another test's spots; each task gets its own e2e file. Existing tests need no change: without
Visited spots Home shows no "Top spots".

## Mockup approval

Filled in by the orchestrator after Rue's review of `/__mockups/eating-out` (wave 1). Rue's corrections are written
here AND into every requirement/scenario they contradict before units 4–7 start.

**Approved by Rue on 2026-11-02, round 1, as shown, with no corrections** ("sieht super aus, ist approved"). The approved
mockup is `/__mockups/eating-out` at merge `cf2e3e9`. Units 4–7 build to it. No spec changes were needed.
- Kept as shown: score badge as a dark pill on the photo's top right, rank as a glass pill on the top left (ties both
  show #1), segment as a dark pill with counts, desktop filter row (tag chips · City · € to €€€€), kicker
  "Spots · N places", title "Eating *Out*".
- The dashed "Add a place" tile as the last cell of the Want to go grid is accepted as part of the approved design.
  It links to `/eating-out/new` and is not a card (no badge, no rank, not counted).
- Defect, not a design change: on the desktop spot page the tag chips sit just below the glass panel's edge and look
  clipped. Unit 6 keeps every tag inside the glass panel.

## Risks / Trade-offs

- [R1 five labels at 320 px] → measured budget and fallback ladder above; label change escalates to Rue.
- [Compact bar narrower by less than before] → the scenario asks "narrower" at 390 and "no wider" at 320 instead of
  the old 75 % ratio.
- [Mockup approval pauses the build] → accepted (R6); wave 2 waits.
- [CC0 photo sources flaky] → Openverse, then Wikimedia Commons, cap ~10 fetches, existing synthetic image or recipe
  photos for missing shapes (R5).
- [Two wave-2 units need a score input] → `ScoreField` lives in unit 5; unit 6 (spot page + sheet) waits one wave for it.
- [Card change affects recipe cards] → all new props default to today's rendering; existing archive/Home e2e stay
  unchanged and must stay green.
- [Duplicate view-transition names make `startViewTransition` fail] → only SpotCard and the spot hero carry
  `spot-hero-<id>`, and a page shows each spot's card at most once.
- [Header search link with a hash] → the list page handles hash on load, navigation and `hashchange`.

## Migration Plan

`0003_food_spots.sql` only adds tables and an index; `migrate()` applies it in one transaction on the next start.
Rollback before any spot exists: deploy the previous version (it ignores the extra tables). After spots exist, data in
the new tables is kept by older versions but invisible; no down-migration is planned.

## Open Questions

- none (Rue's mockup corrections are collected under "Mockup approval").
