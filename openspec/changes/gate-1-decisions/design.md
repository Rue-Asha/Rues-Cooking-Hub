## Context

The recipe page shows ingredient lines as stored original text; the plan and list already scale amounts (`formatAmounts`, `aggregate` in `src/lib/shopping`). The new-recipe forms keep state only in memory behind `unsavedGuard`. The redesign will build the UI; this change gives it two tested logic modules.

## Goals / Non-Goals

**Goals:** a pure scaling function and a small draft helper, both unit-tested, with decisions 5 and 6 specified. **Non-Goals:** any UI, e2e or route change (see proposal).

## Decisions

- **Scaling** is a pure function `scaleIngredient(line: ParsedLine, from: number, to: number): string` in `src/lib/ingredients/scale.ts`. With no quantity, `from === to` or an invalid `to` it returns `line.text`. Otherwise it returns `quantity * to / from` rounded to two decimals (trailing zeros dropped, same rule as `formatAmounts`), then unit, name and note joined by single spaces, the note after a comma. A range line scales its parsed upper bound (the parse keeps only that), so the lower bound is dropped once scaled. Bigger alternative: scale both bounds, which needs the parser to keep ranges; not built.
- **Draft** is `src/lib/recipes/draft.ts`: `saveDraft(storage, draft)`, `loadDraft(storage)`, `clearDraft(storage)`, `isDraftWorthKeeping(draft, initial)`. Storage is injected (a `Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>`) so tests use an in-memory fake and the Svelte code passes `localStorage`. One key `cooking-hub:recipe-draft`, versioned JSON `{ v: 1, imported: boolean, form: ... }`; unreadable, wrong-version or throwing storage yields `null` and writes are swallowed, so a blocked browser degrades to no draft. The photo file is not stored, the image link is.
- Draft payload is the form's own field shape (title, description, servings, minutes, source, notes, tag names, ingredient and step sections, image link). The module defines the type, so the form binds to it later.
- `localStorage` over server storage: decision 5 says "local draft", the app has no accounts, and a draft is per-device scratch state.
- The reload confirmation of the old guard is dropped once the draft exists (contract section 5); the in-app discard dialog stays and its "Discard" must call `clearDraft`. That wiring is redesign work.

## Contracts

- `scaleIngredient(line: ParsedLine, from: number, to: number): string`
- `RecipeFormDraft` (new type, in `draft.ts`) with `title, description, servings, prepMinutes, cookMinutes, sourceUrl, notes, tagNames, ingredients: Section<string>[], steps: Section<string>[], imageUrl`; `StoredDraft = { v: 1; imported: boolean; form: RecipeFormDraft }`.

## Risks / Trade-offs

- Dropping a range's lower bound when scaled is lossy; acceptable for a view-only feature, noted in the contract as "a range line scales its upper bound".
- One draft slot: starting a second new recipe on another tab overwrites the first. Accepted for a one-person app.
