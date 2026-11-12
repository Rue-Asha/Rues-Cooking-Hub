## 1. Contracts

> unit: depends=none · files=src/lib/ingredients/scale.ts, src/lib/recipes/draft.ts

- [ ] 1.1 Create `scale.ts` with the `scaleIngredient` signature returning `line.text` (stub that typechecks) and `draft.ts` with the `RecipeFormDraft` and `StoredDraft` types and stub `saveDraft`, `loadDraft`, `clearDraft`, `isDraftWorthKeeping`

## 2. Servings scaling

> unit: depends=1 · files=src/lib/ingredients/scale.ts, src/lib/ingredients/scale.test.ts

- [ ] 2.1 Write tests "Scenario: Scaling a line doubles its quantity", "Scenario: Scaling rounds to two decimals", "Scenario: Lines without quantity and the recipe's own servings stay unchanged", "Scenario: Invalid scale target leaves the line unchanged" in `scale.test.ts`; plus unit and note ordering and the range upper-bound case from the design
- [ ] 2.2 Implement `scaleIngredient` until the tests pass

## 3. Draft storage

> unit: depends=1 · files=src/lib/recipes/draft.ts, src/lib/recipes/draft.test.ts

- [ ] 3.1 Write tests "Scenario: Draft round-trips through storage", "Scenario: Unreadable or unavailable storage yields no draft", "Scenario: Clearing removes the draft", "Scenario: Unchanged form keeps no draft" against an in-memory fake storage
- [ ] 3.2 Implement the draft helper (one versioned key, JSON, injected storage, swallowed errors) until the tests pass

## 4. Verify

> unit: depends=2,3 · files=none

- [ ] 4.1 Run `npm run proof` and `openspec validate gate-1-decisions --strict`; both green
- [ ] 4.2 Run `graphify update .` so the new modules are in the graph

## 5. Hand-off to the redesign (not built here)

> unit: depends=4 · files=none

- [ ] 5.1 Record in the redesign brief that these are built there, each with its e2e scenario: scale control and scaled display, "Restored your unsaved draft" and "Discard draft" with the wiring that calls the draft helper (and drops the reload confirmation), "Total time" label (`SORTS` in `query.ts`), removal of the Planned status and "Not planned yet" prompt, nav brand link, "Add recipe" and "Search recipes" at every width, search focus on arrival
