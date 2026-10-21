# Explore decisions (live notes, folded into scope.md at the end)

2026-10-19, answered by Rue:
- Users: only Rue. No login; LAN/Tailscale only (like Life Manager, Rues Arcade).
- Ingredients: structured (quantity · unit · name) with a parser for typed lines ("2 tbsp olive oil").
- URL import: in the first cut, with an editable preview before save; image stored locally.
- Meal plan: slots per day — main meals (breakfast, lunch, dinner) plus snacks.
- Offline: not needed; list works over network. No service worker, no HTTPS in this change.
- UI language: English.
- Images: BLOB in SQLite, downscaled (~200 KB) — covered by the existing nightly .db backup.
- Devices: desktop (≥1280) and phone treated as equal; both layouts designed seriously.
- Consequence of plain HTTP: no Wake Lock, no navigator.clipboard (secure context only).
- Archive extras: full-text search incl. ingredients; favourites. NOT: cook log, "not cooked in a while", collections.
- Cook mode: dropped entirely (no step-by-step, no timers, no ingredient check-off, no servings stepper on the recipe page).
- Servings: recipe has default servings; each plan entry has its own servings → shopping list scales.
- Meal plan extras: drag & drop (desktop; tap on phone), copy week. NOT: leftovers entry, suggestions for empty slots.
- Shopping list extras: grouped by category. NOT: pantry basics, provenance strip, quick-add suggestions.
- NEW area "Food Spots" (Rue, 2026-10-19): separate tab, thematically food, unrelated to recipes/plan/list.
  Name, tags, address and other attribute fields, one overall rating out of 10 plus a notes field,
  a special tag/button for places not yet visited that Rue wants to go to. One entry per spot (no visit log, no dish list).
- "Not cooked in a while" dropped — favourites only.
- Food Spots fields: name, tags, address, city/neighbourhood (filterable), price level €–€€€€, links (website, Instagram, menu), hero photo, overall rating /10 + notes.
- Food Spots map: none; "Open in Maps" link built from the address. No external geocoding/tiles.
- Food Spots status: "Want to go" | "Been". Want-to-go has no rating; marking "Been" switches status and opens the rating. Own filter.
- Recipe tags: free tags, seeded starter set (Breakfast, Main Course, Dessert, Snack, …); filter combines tags.
- Motion (confirmed by Rue): page transitions, animated check-off, card → detail shared-element (View Transitions), staggered entrance + FLIP on filter/sort, hero parallax/zoom on scroll + shrinking glass nav, coverflow/stacked card carousel with 01/07 counter. prefers-reduced-motion → calm.
- Home: bento dashboard — full-bleed hero (today's meal), tiles: this week, open shopping items, a favourite, a want-to-go spot; each tile leads to its area.
- Theme: light, warm — cream/sand ground, stone grey, olive + brick-red accents, one dark bento tile. No dark mode.
- Shopping list from plan: button, choose a date range → ingredients scaled by entry servings and merged; regenerating replaces only open plan-derived items; manual and checked items stay.
- Coverflow/stacked carousel: archive header "Featured", grid below.
- Shopping categories: manual only — new items land in "Other"; Rue's assignment is remembered per item name.
- Split: this change = foundation + CI/release + archive/import + meal plan + shopping list + home. Food Spots = its own later change in this repo (see split-food-spots.md); its home tile comes with it. Homelab container + deploy = own change in Homelab-Managment after the first release tag.
- Mockups first: wave 1 builds design system + static mockups (home, archive, detail, import, plan, list) at phone + desktop as screenshots; Rue approves before feature units build on them.
- Featured stack: the 7 most recently added recipes.
- Extra recipe fields: prep + cook time (minutes; card shows total, sortable), sections for ingredients and steps ("For the sauce"), Markdown in notes (and steps). NOT: gallery.
- Import failure (blocked page, no recipe data): message "Couldn't read a recipe from this page", then the manual form prefilled with the URL (and title/image if readable).
- Plan slots: Breakfast, Lunch, Dinner, Snacks; any number of entries per slot.
- Deleting a recipe used in the plan: its plan entries become free text with the recipe's name; shopping list unchanged; confirm dialog names the count.
- Units: kept as written/imported; list merges equal units and metric families (g/kg, ml/l); others as separate amounts on one line ("1 cup + 200 g flour").
- Name: "Rues Cooking Hub" → repo Rue-Asha/Rues-Cooking-Hub (public), local ~/Repos/Rues-Cooking-Hub, like Rues-Arcade naming. ship: merge, release: tag.
- Appetite: a few sessions (~1 week).
- Gate 1 (2026-10-19): planner additions accepted: (a) comma decimals, (c) singular/plural folding, (d) tags from import recipeCategory/keywords, (e) tag rename onto existing name merges, (f) "Remove image", (g) plan items merge into a manual item with the same name. Declined: (b) German units (EL, TL, Prise, Bund, Zehe).
- Mockup photos: builder downloads ~8 free-licence food photos once into static/mockups/, sources + licence recorded.
- Mockups approved by Rue (2026-10-19, task 4.6): "Sieht sehr sehr gut aus … von der Struktur und Design sieht das wirklich sehr gut aus." Phone hero stays edge to edge, desktop framed (U4's taste call a, no change requested).
  Rue's condition for the final implementation: smooth transitions and fitting animations everywhere — the app must feel lively, not static. Every UI unit treats the motion set as part of done, not polish.
- Nav taste (Rue, 2026-10-19, after U10): phone/tablet tab bar shrinks to icons-only on scroll (labels fade out, icons centre); the ~150 ms label hide during the active-pill glide is fine as is.
