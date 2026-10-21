# Research: Mobbin (research subagent, 2026-10-19)

URLs: screens https://mobbin.com/screens/<id>, flows https://mobbin.com/flows/<id>, sections https://mobbin.com/sites/sections/<id>.
Not on Mobbin: Paprika, Mela, Plan to Eat, Samsung Food, Mealime, Pestle, Bring!, AnyList. Coverage from Crouton, Recime, Julienne, NYT Cooking, Kitchen Stories, HelloFresh, CREME, Cherrypick, Centr, Instacart.

## Features
### Archive
- URL import via clipboard-aware toast + Import button — Crouton flows/24463139-4848-404d-a628-355680cdacae (also import menu: link, code, camera, image, text, PDF). MacroFactor scratch/link/AI — flows/10a97380-a3ba-43ad-9dd3-1196f036f801
- Parsed preview before save, "Select cookbook", "Report import mistake" — Recime flows/19d68d56-c76b-436a-847b-ee48b1568cbf
- Collections with mosaic cover + coloured tags — Recime flows/041c90ab-7821-4dc1-8962-41ddc49ad94f; Crouton folders/tags flows/3d70e281-7384-4810-afb1-1c8385a2ae10
- Personal notes card styled as lined paper — Crouton flows/b0f71a84-5206-4d87-8367-aa32e759e48f (last screens)
- Filter sheet as chip groups with live "Show N results" — NYT Cooking screens/74618039-64f1-47b9-8892-7778e3fb5dbc; HelloFresh screens/c1541748-40c0-42db-9aba-ae9573453427
- Search over ingredients + titles — Crouton flows/b0f71a84-5206-4d87-8367-aa32e759e48f
### Cook
- Servings stepper + "Add to groceries" + "Cook step-by-step" on recipe page; "Mark as Cooked" with stars + note — Recime screens/76b7f726-05fc-41a6-bdab-aaa2024eb745; NYT Cooking flows/7c8997bf-48c6-4c24-bd45-c24cee09a9ae
- Scale by amount/serving/ingredient + unit conversion — Crouton screens/79c66163-3bad-4def-baeb-4d74f1e84d50
- Cook mode one step per screen, segmented progress bar — Recime flows/430be35c-f111-45ca-bd89-d450071ffc77
- Inline timers per step — HelloFresh flows/bab3168e-5809-4f68-80a0-c11ca529e60c
- Temperatures/ingredients highlighted in step text — Recime, Crouton
- Split Ingredients/Preparation sheet, tickable ingredients — NYT Cooking flows/7c8997bf-48c6-4c24-bd45-c24cee09a9ae
### Plan
- Day-card list with + per day, "Generate plan for week", "Add to groceries" — Crouton flows/34a8aaab-e859-40df-8ca1-ad8b16f6a5b3
- Meal-type pills + free-text entries — Recime flows/041c90ab-7821-4dc1-8962-41ddc49ad94f
### Shopping
- Grouped by aisle, Sort-by-Aisle toggle, removable "Recipes" strip — Recime flows/0ddb8164-d3d3-4b6a-91a9-86d2f52e93ad
- Collapsible category cards, add-custom-item row, round thumbnails of planned meals — Centr flows/f2ad0223-e2c3-4265-8ca9-18b62623f2e7
- Per-recipe sections "Cooking for 2" + Clear per recipe — Julienne flows/8734e79b-5cfc-436a-be70-89fae0002299
- Per-item "Recipe needs: …" provenance, sort/group chips, Share — Amazon screens/80e787c9-d870-4bba-81f5-5b9fd06075bb; Yazio (Delete Completed) flows/7a5d8400-ef66-4de0-9f99-8d1daec0b1ef
### Cross-cutting / distinctive
- Ingredient photo tiles with per-ingredient (+) — Julienne screens/9ead86ce-70f2-453e-a564-d77f70a3b660
- Cook / Plan / Remix / Ask pill row under hero — CREME screens/88c17cee-e38a-4bcf-bb1f-c1b455f54629
- Ingredient swap, untick to exclude — Cherrypick screens/5e4ba8b5-6fd0-4fb9-8a4d-04e1671b0edd
- Pantry: no researched pattern.

## Flows
1. Import from link — MacroFactor flows/10a97380-a3ba-43ad-9dd3-1196f036f801; Crouton in-app browser "Save Recipe" flows/24463139-4848-404d-a628-355680cdacae
2. Cook mode — Recime flows/430be35c-f111-45ca-bd89-d450071ffc77; HelloFresh timers flows/bab3168e-5809-4f68-80a0-c11ca529e60c
3. Add recipe to plan — Crouton flows/3d70e281-7384-4810-afb1-1c8385a2ae10
4. List from plan — Recime flows/0ddb8164-d3d3-4b6a-91a9-86d2f52e93ad + flows/041c90ab-7821-4dc1-8962-41ddc49ad94f; Apple News flows/e97fce82-eb03-41cd-b491-29d07d316c92
5. Check off — Julienne flows/8734e79b-5cfc-436a-be70-89fae0002299; Centr flows/f2ad0223-e2c3-4265-8ca9-18b62623f2e7

## Visual (matches the UI-inspo vibe)
- Daylight: full-bleed photo, sans + serif italic, frosted pill nav, one orange CTA — sections/a934cc95-697d-4051-8d07-16e8d1a75e34
- Superpower: two-tone headline, accent word, dark pill nav, round prev/next + dots — sections/a66c7229-39c5-4f24-b34c-c09db551575d
- Cosmos: translucent pill nav over full-bleed photo — sections/b3994ca2-d26a-4d79-b1e9-fd4bc4c62410
- mymind: floating pill nav, serif headline, soft rounded cards on muted ground — sections/b9517cc5-a6a8-4ce8-aaf8-9b328bd5d713
- Swap: rounded photo cards, arrow-in-circle at corner, circular prev/next — sections/e10088de-d4dc-469f-bcd0-d2ef9dbeb668
- Seed: peeking next card, dark-green headline, circle-arrow meta — sections/df373550-5784-4a54-b8a9-adeacfd7cfea
- Sweetgreen (web): sand cards, big radius, deep green accent — screens/9d03a449-7ba8-45da-bc74-ef71e61440f8
- Julienne (web): serif section titles, horizontal card rows, floating pill search — screens/73404785-5a9b-4e6f-8e2f-0121e8105b5d
- pillowtalk (iOS): bento of cream cards + one dark-green card, big numerals — screens/8e1292b8-21e7-4756-9f78-791da5530d56
- Alma (iOS): warm cream ground, dark-olive pill button, glass buttons — screens/e8f24bea-4f65-43b7-b3a0-4a7c82331721
- Apple News recipe hero: full-bleed photo + frosted info panel + glass nav — screens/1517c4fa-789a-40d9-9f91-85168bf9af31
- Crouton: frosted floating pill tab bar, glass dialogs/chips — screens/44d6dccf-996c-4685-990b-79eda09bc23b
- AI-generated (not shipped), closest to brief: Variant "ASMOB Bakery" bento — screens/aa91165f-5bdc-4388-aca2-ba149e2e6b18; v0 "Where Flavour Begins" — screens/6d1e0251-1dfe-4ae7-9ec6-76487a7c1d84

## Motion (inferred from static frames)
- Card → detail, hero photo carries over, glass circle buttons — Crouton flows/b0f71a84-5206-4d87-8367-aa32e759e48f; Apple News flows/cb06dc5f-c9d7-4577-aed2-56d9f3ff09a7
- Active cook step bright, neighbours dim (scroll-linked) — CREME flows/b0b5ee7e-d2c2-41c7-a98f-381ea415aa1d
- Segmented progress bar filling — Recime flows/430be35c-f111-45ca-bd89-d450071ffc77
- Check-off: fill, strike, move down — Julienne flows/8734e79b-5cfc-436a-be70-89fae0002299; Instacart flows/3009ab0c-d973-4bdf-82e1-a7978b003f21
- Bottom-sheet / glass-popover entrances — Crouton flows/24463139-4848-404d-a628-355680cdacae
- Drag ghost tilted onto day column — Trello Planner screens/18d7e45e-6346-454c-9006-73dd87072bbf

## Gaps
- No real motion/video; no web meal-plan drag & drop from a recipe app; no leftovers, pantry, desktop cook mode, web collections; no true coverflow with "01/06" counter; no food site with glass pill nav + editorial bento. Most food coverage iOS only.
