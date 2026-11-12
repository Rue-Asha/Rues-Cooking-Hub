## Why

Rue answered the nine gate-1 questions of `docs/functional-contract.md`. The redesign that follows takes that contract as its only input, so the decisions must be recorded in the specs, and the logic they need (servings scaling, draft storage) must exist and be tested before the redesign builds UI on it.

## What Changes

- Build `scaleIngredient` (recipe-page servings scaling) in `src/lib/ingredients/scale.ts` with unit tests.
- Build the local draft storage helper (save, load, clear, change detection) in `src/lib/recipes/draft.ts` with unit tests.
- Spec deltas for every decision, UI ones included, so the specs match the contract:
  - recipe-detail: ADDED servings scaling; ADDED no planned status on the recipe page (the old Planned status was never specced, so nothing is REMOVED from the spec; its code and the "Not planned yet" prompt go in the redesign).
  - archive: MODIFIED Sort (control label "Total time").
  - recipes: ADDED local draft of an unsaved new or imported recipe.
  - navigation: MODIFIED Area navigation (brand link, "Add recipe", "Search recipes" at every width); ADDED "Search recipes" focuses the search field.
- Decisions 2, 3 and 9 need no spec change beyond what exists (Home extras and immediate deletes are already specced as they are; WCAG 2.2 AA is recorded in the contract and `PRODUCT.md`).
- **The UI affordances are built in the redesign, not here**: the scale control and scaled display, the draft notice and "Discard draft", the "Total time" label, removal of the Planned status, nav actions at every width and the search focus. This change ships only tested logic modules and specs; no Svelte component or route is touched. Scenarios that need UI carry `e2e` proof lines and are satisfied when the redesign lands.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `recipe-detail`: servings scaling on the recipe page; no planned status.
- `archive`: sort option label "Total time".
- `recipes`: local draft of unsaved new or imported recipes.
- `navigation`: same actions at every width; "Search recipes" focuses the search field.

## Impact

- New: `src/lib/ingredients/scale.ts`, `scale.test.ts`, `src/lib/recipes/draft.ts`, `draft.test.ts`.
- Specs: four delta files; `docs/functional-contract.md` and `PRODUCT.md` already updated (uncommitted, outside this change's task list).
- Later, in the redesign: `recipes/[id]/+page.svelte`, `RecipeForm.svelte`, new-recipe routes, `AppNav.svelte`, `query.ts` (`SORTS` label), and e2e files.

## Appetite

One evening for the two logic modules and their tests; the UI work belongs to the redesign's budget.

## Non-Goals

- No UI, route, copy or e2e change in this change.
- No server-side draft storage, no cross-device drafts, no draft for recipes being edited.
- No stored scale, no scaling of steps, notes or times, no scaling effect on the plan or the list.
- No undo for deletes, no change to Home.

## Done criteria

- [ ] `npm run proof` is green with the new unit tests.
- [ ] `openspec validate gate-1-decisions --strict` passes.
- [ ] `scaleIngredient` and the draft helper are importable via `#lib/...` and nothing else imports them yet.
- [ ] Contract section 10 and the four spec deltas describe the same decisions.
