# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One household, effectively one person (Rue), on a private self-hosted instance with no accounts or sharing. Used daily on desktop (planning the week, browsing, writing recipes) and on a phone (cooking from a recipe, shopping in a store, glancing at tonight's meal). Primary jobs: decide what to cook, keep recipes worth keeping, plan the week, and turn the plan into one shopping list.

## Product Purpose

Rues Cooking Hub keeps a personal recipe archive, a weekly meal plan and a shopping list in one place, so a recipe found on the web ends up cooked, planned and bought without retyping. Success is that a recipe goes from a link to a scaled, merged, aisle-grouped shopping list in a few steps (and can be scaled on its own page while cooking), and that Home answers "what's for dinner, what do I need to buy" at a glance.

## Positioning

A single-household tool rather than a service: self-hosted, no account, no ads, data in one SQLite file. Its mechanism is the closed loop between archive, plan and list: ingredients are parsed into quantity, unit and name, scaled by planned servings, merged across recipes and grouped by aisle, with aisle choices remembered per item.

## Operating Context

- Four areas: Home, Recipes (archive, import, tag manager), Plan (week Monday to Sunday with Breakfast, Lunch, Dinner, Snacks), List (one shopping list). Navigation offers the brand link, "Add recipe" and "Search recipes" (focusing the archive search) at every width.
- Recipes arrive by importing a web page link (schema.org recipe data, with a manual fallback) or by hand with ingredient and step sections, a photo, tags, a source and Markdown notes. An unsaved new or imported recipe is kept as a local draft in the browser and restored after a reload.
- A recipe page scales its ingredients to the servings you choose (view only, nothing stored); it shows no planned status, only "Add to plan".
- The plan is edited by drag and drop on desktop and by a "Move to…" menu everywhere; whole weeks can be copied.
- The list is filled by typed lines, parsed like ingredient lines, and by "Add from plan" for a date range.
- Runs as one Node process with SQLite behind a reverse proxy; there is no offline mode and no sync.
- Phone and desktop are both first-class; the interface is English.

## Capabilities and Constraints

- The functional contract at `docs/functional-contract.md` is the authority for behavior, validation, required states, copy and the few behavioral `data-*` hooks. A redesign changes how things look, not what they do.
- Fixed vocabulary: slots Breakfast, Lunch, Dinner, Snacks; categories Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks, Household, Other; tags are free names seeded with Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad, Baking.
- Filter state of the archive and the shown week of the plan live in the URL.
- Images are stored downscaled in the database (upload limit 15 MB); notes and steps are Markdown with raw HTML disabled.
- No accounts, no multi-user, no notifications.
- Deletes of a plan entry, a list item and "Clear checked" are immediate, with no confirm and no undo (decided). Home keeps "Recently added" and the summary sentence (decided).
- Rue's gate-1 decisions are settled in section 10 of the contract; no questions remain open.

## Brand Commitments

Name: "Rues Cooking Hub". The product addresses its owner by name on Home ("What's cooking, Rue?"). All interface copy is English; the redesign moves every string to English using the copy table in the contract. Visual identity is deliberately not set here; it comes from the shared design system.

## Evidence on Hand

- Specs per capability in `openspec/specs/`, end-to-end tests in `e2e/` (phone and desktop viewports), seeded and fixture recipe pages in `fixtures/import/`.
- No user research, testimonials, analytics or usage numbers exist; none may be invented.

## Product Principles

1. The closed loop is the product: archive, plan and list must stay connected, and nothing the user plans or buys is retyped.
2. Phone in a kitchen or a store comes first for reading and ticking off; desktop comes first for planning and writing. Neither is a degraded version of the other.
3. Never lose the user's work: unsaved recipe edits are guarded, failed image downloads still save the recipe, deletes explain their consequences.
4. Every action has a keyboard and a touch path; drag and drop is a shortcut, never the only way.
5. Calm and quick over clever: no accounts, no setup, empty states that point at the next useful action.

## Accessibility & Inclusion

Behavior must work with keyboard only and with assistive technology: real roles and names for controls, `aria-current` for the open area, `aria-pressed` for toggles, checkbox semantics for list items, modal dialogs that trap focus and close on Escape. Reduced-motion preferences must disable non-essential motion without changing behavior. The target is WCAG 2.2 level AA on every route and dialog (decided at gate 1; details in section 5 of the contract).
