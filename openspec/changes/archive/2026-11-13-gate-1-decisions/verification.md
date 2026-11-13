verified-at: a231640

## Layer 1: proof:full

```
  - 566 [desktop] e2e/transitions.test.ts:57:1 > Navigation inside one area skips the page transition (160ms)

  41 skipped
  525 passed (6.9m)
exit 0
```

vitest: 36 files, 413 tests passed. The 41 skipped are per-project viewport skips (phone-only / desktop-only tests).

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Newest first by default | unit | `src/lib/server/archive.test.ts` "Scenario: Newest first by default" pass |
| Sort by title | unit | `src/lib/server/archive.test.ts` "Scenario: Sort by title" pass |
| Sort by total time puts recipes without time last | unit | `src/lib/server/archive.test.ts` pass |
| Sort choice in the archive | e2e | `e2e/archive-filters.test.ts` pass (phone, desktop) |
| Total time label | e2e | deferred (Rue, Gate 1) |
| Desktop shows the top pill nav | e2e | `e2e/nav.test.ts` pass (desktop; phone project skip) |
| Phone shows the bottom tab bar | e2e | `e2e/nav.test.ts` pass (phone; desktop project skip) |
| Active area is marked | unit | `src/lib/nav.test.ts` pass |
| Nav marks the open area | e2e | `e2e/nav.test.ts` pass (both) |
| Tablet and phone landscape use one layout without overlap | e2e | `e2e/nav.test.ts` pass (768x1024, 844x390, phone project) |
| Nav shrinks on scroll | e2e | `e2e/nav.test.ts` pass (both) |
| Compact tab bar shows icons only | e2e | `e2e/nav.test.ts` pass (390px, 320px, phone project) |
| Reduced motion shrinks the tab bar instantly | e2e | `e2e/nav.test.ts` pass (phone) |
| Nav shrink looks calm | manual (visual judgement by Rue) | see checklist |
| Same actions at every width | e2e | deferred (Rue, Gate 1) |
| Search action focuses the field | e2e | deferred (Rue, Gate 1) |
| Scaling a line doubles its quantity | unit | `src/lib/ingredients/scale.test.ts` pass |
| Scaling rounds to two decimals | unit | `src/lib/ingredients/scale.test.ts` pass |
| Scaling a range scales both ends | unit | `src/lib/ingredients/scale.test.ts` pass |
| Lines without quantity and the recipe's own servings stay unchanged | unit | `src/lib/ingredients/scale.test.ts` pass |
| Invalid scale target leaves the line unchanged | unit | `src/lib/ingredients/scale.test.ts` pass |
| Unprintable scaled amounts leave the line unchanged | unit | `src/lib/ingredients/scale.test.ts:93` "Scenario: Unprintable scaled amounts leave the line unchanged" pass |
| Scale control updates the ingredients | e2e | deferred (Rue, Gate 1) |
| Invalid scale value is rejected | e2e | deferred (Rue, Gate 1) |
| Planned recipe shows no planned status | e2e | deferred (Rue, Gate 1) |
| Draft round-trips through storage | unit | `src/lib/recipes/draft.test.ts` pass |
| Unreadable or unavailable storage yields no draft | unit | `src/lib/recipes/draft.test.ts` pass |
| Clearing removes the draft | unit | `src/lib/recipes/draft.test.ts` pass |
| Unchanged form keeps no draft | unit | `src/lib/recipes/draft.test.ts` pass |
| Draft comparison ignores key order and a malformed draft is not loaded | unit | `src/lib/recipes/draft.test.ts:123` "Scenario: Draft comparison ignores key order and a malformed draft is not loaded" pass |
| Draft survives a reload | e2e | deferred (Rue, Gate 1) |
| Save and discard clear the draft | e2e | deferred (Rue, Gate 1) |
| Imported preview survives a reload | e2e | deferred (Rue, Gate 1) |

Deferred: 9 UI e2e scenarios (Total time label, Same actions at every width, Search action focuses the field, Scale control updates the ingredients, Invalid scale value is rejected, Planned recipe shows no planned status, Draft survives a reload, Save and discard clear the draft, Imported preview survives a reload); the redesign must cover them.

Gaps: 0. Round 1 naming gaps closed by a231640. Coverage: pass 23 · deferred 9 · manual 1 · gaps 0.

## Manual checklist

- Nav shrink looks calm: `npm run dev` (http://localhost:5173), scroll a long page on phone width and on desktop; the nav shrinks and grows smoothly, content does not jump.

## Diffstat (origin/main...flow/gate-1-decisions)

122 files changed, 4767 insertions(+), 6 deletions(-). Code: `src/lib/ingredients/scale.ts` (+24), `scale.test.ts` (+90), `src/lib/recipes/draft.ts` (+84), `draft.test.ts` (+120), `parse.ts` (+13/-), `parse.test.ts` (+17), `aggregate.ts`, `types.ts`; plus `docs/functional-contract.md` (+524), `PRODUCT.md`, change artifacts and graphify-out.

## Screenshots

none

## Review

Fresh-context review (strong tier), verdict **approve** with nits. All resolved before round 2:

| Finding | Resolution |
|---|---|
| `isDraftWorthKeeping` compared via JSON.stringify, which depends on key order | cf7c1ea: field-by-field deep comparison; tests for key order, `structuredClone`, changed line |
| draft test shared array references, so a shallow `===` would pass | cf7c1ea: tests added |
| `shown` duplicated `shownQuantity` from aggregate.ts | 22b6ff2: one shared helper in scale.ts, aggregate imports it |
| no guard for unprintable scaled amounts (exponent notation, 0) | 22b6ff2: returns `line.text` unchanged; tests |
| untested edges (fractions, mixed numbers, "2-2", reversed range, decimal comma, invalid `from`, malformed stored draft, quota error) | cf7c1ea, 22b6ff2: tests added; malformed stored form is now rejected on load |
| verifier round 1: two scenarios had no test under their title | a231640: scenario-named tests |

Round 2 (at a231640): proof:full green, 23 pass · 9 deferred (Rue, Gate 1) · 1 manual · 0 gaps.
