## Why

Rue collects recipes from the internet and from learning, but has no single place to keep them with notes,
plan the week's meals from them, and turn that plan into a shopping list. Rue wants one lively,
good-looking self-hosted app for that, used on desktop and phone.

The repo is empty (only `openspec/`), so this change builds the whole first version: foundation, harness, CI and
release like Rues-Arcade, then the recipe archive with URL import, the weekly meal plan, the shopping list and the
home dashboard, behind a mockup approval before any feature UI.

## What Changes

- New SvelteKit 3 app "Rues Cooking Hub" (adapter-node, Node 22, `node:sqlite`, numbered migrations, `/healthz`),
  copied in shape from Rues-Arcade, with the flow harness (`proof`, `proof:full` on phone + desktop, `package`).
- CI (`ci.yml` + `gate.yml`, security baseline, dependabot) and a tag-triggered release (`release.yml` → GitHub
  release with tarball + `.sha256`, bump job to the Homelab pin), first release v0.1.0.
- Design system (light warm tokens, self-hosted serif + sans, glass panel, pill nav, arrow-in-circle button, card,
  chip, `motion.ts`) and static mockups of six screens at 390 and 1280, approved by Rue before feature UI is built.
- Navigation (top glass pill nav on desktop, bottom pill tab bar on phone) with animated page transitions.
- Recipe archive: structured recipes (ingredient and step sections, Markdown notes, hero image as BLOB), ingredient
  parser (incl. comma decimals), manual form, image upload/replace/remove, import from URL via schema.org JSON-LD
  (categories/keywords → tags) with an editable preview and a fallback, edit/delete,
  card grid with a "Featured" stack, tags, filters, search incl. ingredients, sort, favourites, recipe detail.
- Weekly meal plan (Mon–Sun × Breakfast/Lunch/Dinner/Snacks) with recipe and free-text entries, drag & drop on
  desktop, "Move to…" everywhere, copy week, "Add to plan" from a recipe.
- One shopping list: manual items, "Add from plan" (scaled, merged by name incl. singular/plural and metric family,
  plan amounts joining manual items), manual categories
  with name memory, animated check-off, "Clear checked".
- Home bento dashboard: today hero, this week, shopping list, favourite.

## Capabilities

### New Capabilities
- `harness`: proof / proof-full / package commands, e2e projects and isolation, test-only routes, harness declaration.
- `runtime`: database, migrations, `DATABASE_PATH`, `/healthz`, proxy and server configuration.
- `release`: CI and gate workflows, dependabot, release workflow with the Homelab bump, release runbook, version 0.1.0.
- `design-system`: tokens, fonts, shared components, motion module, mockups and the approval stop.
- `navigation`: area navigation (desktop pill nav, phone tab bar, shrink on scroll) and page transitions.
- `recipes`: recipe fields and validation, manual form, sections, Markdown, images, edit and delete.
- `ingredients`: the ingredient line parser and its live preview.
- `recipe-import`: reading a recipe from a URL, preview, fallback, duplicates, failures.
- `archive`: card grid, featured stack, filters, search, sort, favourites.
- `tags`: starter tags, free tags, tag manager.
- `recipe-detail`: the recipe page, hero motion, shared-element transition, delete and "Add to plan".
- `meal-plan`: week view, entries, drag & drop, "Move to…", copy week.
- `shopping-list`: items, "Add from plan", categories, check-off, the end-to-end journey.
- `home`: the bento dashboard.

### Modified Capabilities
None (no specs exist yet).

## Impact

- New repo `~/Repos/Rues-Cooking-Hub`; everything is created. Later `Rue-Asha/Rues-Cooking-Hub` (public) on GitHub.
- New runtime dependencies: `sharp` (image downscaling, native prebuilt for linux-x64) and `markdown-it`
  (Markdown with raw HTML disabled).
- Outward steps at Ship (each on Rue's go): create the GitHub repo + bootstrap commit, bump secrets, ruleset,
  push/PR/merge/tag v0.1.0 (runbook in `docs/release.md`).
- Follow-ups in Homelab-Managment (separate changes): check01 registration before the PR; the `rues-cooking-hub01`
  service after tag v0.1.0. Names this change uses: host `rues-cooking-hub01`, variable `rues_cooking_hub_version`,
  data `/var/lib/rues-cooking-hub/rues-cooking-hub.db`, tarball `rues-cooking-hub-X.Y.Z.tgz`.

## Non-Goals

- Food Spots — split off (split-food-spots.md).
- Homelab container, role, playbook, DNS — separate changes in Homelab-Managment (see Split off in scope.md).
- Cook mode (step-by-step, timers, ingredient check-off, servings stepper on the recipe page) — Rue: not wanted.
- Cook log, ratings for recipes, "not cooked in a while", collections/cookbooks, recipe gallery — Rue chose against them.
- Leftovers entries, suggestions for empty slots — not chosen.
- Pantry basics, provenance strip, quick-add suggestions, automatic categorisation — not chosen.
- Unit conversion (cups ↔ g) — Rue: keep units as written.
- Offline/PWA, Wake Lock, HTTPS — plain HTTP on the LAN; not a secure context.
- Login, multiple users, sharing — single user behind LAN/Tailscale.
- Dark mode — light warm theme only.
- Import from photos/PDF/text, or sites without schema.org Recipe data beyond the meta-tag fallback.
- Multiple shopping lists.

## Done criteria

- [ ] Rue approved the mockups (phone + desktop) before feature UI was built.
- [ ] `npm run proof:full` is green with a named test per scenario, phone and desktop.
- [ ] Rue can import a recipe from a real recipe URL, edit it, tag it, find it by tag and by ingredient search, plan
      it for a day with 4 servings, and generate a list that shows the scaled, merged ingredients grouped by category.
- [ ] The motion set is visible in the running app (`npm run dev`) and calm under reduced motion.
- [ ] The PR's checks (`ci / ci`, security-baseline) are green on GitHub, it is merged, and the v0.1.0 release with
      tarball + .sha256 exists.

## Appetite

A few sessions (~1 week).
