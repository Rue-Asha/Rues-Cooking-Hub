# Split off: Food Spots (later change in Cooking-Hub)

Split from build-cooking-hub at explore, 2026-10-19 (Rue: "Kern jetzt, Food Spots danach").

## Intent
Separate tab "Food Spots": places to eat/drink Rue has been to or wants to go to. Thematically food,
not connected to recipes, meal plan or shopping list.

## Decisions already made (Rue, 2026-10-19)
- One entry per spot (no visit log, no dish list).
- Fields: name, tags, address, city/neighbourhood (filterable), price level €–€€€€,
  links (website, Instagram, menu), hero photo, overall rating out of 10, notes.
- Status "Want to go" | "Been". Want-to-go has no rating; marking "Been" switches status and opens the rating. Own filter.
- No map: an "Open in Maps" link built from the address; no external geocoding or tiles.
- Cards like the recipe archive (hero photo, name, short info); same design system and motion.
- Home bento gets a want-to-go spot tile when this lands.
- Images: BLOB in SQLite like recipes; UI English; single user, no login.

## Still open for its explore
- Tag starter set for spots, sort options (rating, recently added), rating input (0–10, halves?), edge cases.
