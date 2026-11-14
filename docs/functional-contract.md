# Rues Cooking Hub: functional contract

This document states what the app does. It says nothing about how it looks. A redesign may change layout, components, motion, colour and typography freely, but must keep every behavior, state, validation rule and the English copy listed here. Sources: README, `openspec/specs/*`, the e2e suite in `e2e/`, and behavior-only reads of the route code. Accessibility target: WCAG 2.2 level AA (see section 5). Rue's gate-1 decisions are applied throughout and listed in section 10.

Words in this contract: "area" is one of the four top-level destinations (Home, Recipes, Plan, List). "Slot" is one of the four meals of a day (Breakfast, Lunch, Dinner, Snacks). "Dialog" means any modal interaction that blocks the rest of the page until it is answered or dismissed. "Context label" is a short line of copy that names the area or task a heading belongs to; the strings are fixed, where and how they appear is not.

## 1. Purpose and usage context

Rues Cooking Hub is a self-hosted recipe archive, weekly meal plan and shopping list in one app. Recipes are imported from web pages or written by hand, planned onto days and meals, and their ingredients are rolled up into one shopping list.

Users: one household (a single person, "Rue", no accounts, no login, no multi-user separation). Devices: desktop and phone, both first-class (the e2e suite runs a phone and a desktop viewport). Frequency: daily or near-daily. Home is opened to see tonight's meal, the Plan and List areas are used while planning the week and while shopping in a store on a phone, the archive is used when choosing what to cook. All data lives on the server; there is no offline mode.

## 2. Jobs-to-be-done

- J1. See at a glance what is cooking today, what is planned this week, what is left to buy, and my favourite recipe.
- J2. Browse the recipe archive: see featured and recent recipes, filter by tags and favourites, search by title, description, ingredient or tag, and sort.
- J3. Open a recipe and read its ingredients, steps and notes while cooking, scaling the ingredients to the number of servings I am cooking for.
- J4. Import a recipe from a web page link, check and edit the result, and save it; an unsaved draft survives a reload.
- J5. Write a recipe by hand, with ingredient and step sections, a photo, tags, a source and notes; an unsaved draft survives a reload.
- J6. Edit or delete a recipe, knowing what depends on it.
- J7. Mark recipes as favourites and find them again.
- J8. Organise recipes with free tags: create them while editing, rename, merge and delete them.
- J9. Plan meals: put recipes or free text into the day and meal of any week, change servings or text, remove, and reorder.
- J10. Move planned meals between days and slots (drag on desktop, a menu everywhere), and copy a past week into the shown week.
- J11. Add a recipe to the plan straight from its page.
- J12. Build a shopping list from the plan: ingredients scaled by servings, merged by name and unit, grouped by aisle.
- J13. Keep the list by hand: add items by typing a line, edit names and amounts, delete, recategorise.
- J14. Shop: tick items off, see them gather in a Checked group, clear checked items.
- J15. Move between the four areas from anywhere, and never lose unsaved recipe edits by accident.

## 3. Entities

### Recipe
- Fields: id; title (required, not blank); description (optional text); image (0..1); source URL (optional, stored normalised: fragment dropped, host lowercased, percent-encoded); servings (integer, at least 1, default 2); prep minutes and cook minutes (whole numbers 0 or more, or empty); total minutes (derived: prep + cook, empty when both empty; when only one is set the total is that one); notes (Markdown, optional); favourite flag with the time it was favourited; created time.
- Relations: many tags; ordered ingredient sections; ordered step sections; used by zero or more plan entries; one image row.
- Lifecycle: created by manual form or import save; edited in place; deleted. On delete the image is deleted, every plan entry using it becomes a free-text entry holding the recipe title (same date, slot, position), and the shopping list is untouched.
- Display text: notes and step lines are Markdown with raw HTML disabled (HTML in the source appears as literal text, no script runs, only http, https and mailto links become links). Ingredient lines show their original text in full, except while the recipe page is scaled to other servings than the recipe's own (see 4.5).

### Ingredient section and ingredient line
- Section: optional title, ordered lines. A section with no lines is dropped on save.
- Line: original text (always kept) plus a parse: quantity, unit, name, optional trailing note. Quantities read integers, decimals with point or comma, fractions (`1/2`, `1 1/2`, `½`, `1½`) and ranges (`2-3` keeps both ends; the upper bound is the quantity other features use; text keeps the range). Units are recognised (also attached, `200g`) and stored canonically (`tablespoons` becomes `tbsp`); an unknown word belongs to the name. A line with no readable quantity has no quantity or unit and the whole line (minus trailing note) is its name.

### Step section and step line
- Section: optional title, ordered lines (Markdown, inline-rendered). Empty sections are dropped on save. Steps are numbered continuously across sections on the recipe page.

### Tag
- Fields: id, free name, derived count of recipes using it. Seeded with Breakfast, Main Course, Side, Dessert, Snack, Soup, Salad, Baking.
- Name matching ignores case and non-ASCII case (`dessert` and `KÄSE` match Dessert and Käse). Created implicitly while saving a recipe with a new name; renamed; deleted (removed from its recipes, recipes stay).
- Renaming onto an existing name (ignoring case) merges: the renamed tag's recipes get the existing tag, the renamed tag disappears, the existing tag keeps its own name.

### Image
- Source is an uploaded file or an image URL. Stored downscaled (long side at most 1600 px, at most 200 KB). Served at `GET /images/<id>` with a one-year immutable cache header; unknown id answers 404. Replacing or removing a recipe's image deletes the old image. Files must be images and at most 15 MB.
- A recipe without an image has an image placeholder wherever its image would be shown, with accessible name "No photo yet" (in the form and on pages).

### Recipe draft (browser-local, not stored on the server)
- At most one draft, held in the browser of the device in use. Fields: everything the recipe form holds (title, description, servings, prep and cook minutes, source, notes, tag names, ingredient sections and lines, step sections and lines, the image link) plus whether it came from an import. A chosen photo file is not part of it. Created and kept up to date while a new or imported recipe is edited and differs from its starting state; restored when a new-recipe route (`/recipes/new`, `/recipes/new/form`) is opened; cleared on save, on discarding the changes, and by "Discard draft". If the browser refuses local storage the form works as before, without a draft and without an error. Recipes being edited (`/recipes/[id]/edit`) have no draft.

### Plan entry
- Fields: id, date, slot (Breakfast, Lunch, Dinner, Snacks), position within the slot (any number of entries per slot, ordered), and either a recipe with servings (integer, at least 1, default the recipe's servings) or non-empty free text.
- Lifecycle: added at the end of a slot; servings or text edited; moved to another date, slot or position; deleted; copied in bulk from another week. A recipe entry whose recipe is deleted becomes free text.

### Shopping item
- Fields: id, name, amounts (free text such as `200 g` or `1 cup + 200 g`, may be empty), origin (manual or plan), category (Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks, Household, Other), checked flag. A merged item remembers its manual part and its plan part separately.
- There is exactly one shopping list.
- Lifecycle: added by a typed line (manual) or by "Add from plan" (plan); edited; moved between categories; checked and unchecked; deleted; checked items cleared in bulk. Regenerating from the plan replaces open plan items only.

### Category memory
- The category last chosen for an item name (case-insensitive) is remembered and applied to new items of that name; otherwise Other.

### Dashboard (derived, not stored)
- Today's featured recipe, the seven days of the current week with their entries, the number of open list items with the first three, the most recently favourited recipe, the four newest recipes and the total recipe count.

## 4. Routes

Applicability marks per route: E empty, L loading, X error, 1 single item, N many items, T overlong text. "n/a" means the state does not exist on that route.

### 4.1 `/` Home

Serves: J1, J15 (and entry to J2, J9, J12).

Data shown:
- Page title "Rues Cooking Hub". Today's weekday and date. A greeting heading ("What's cooking, Rue?"). A summary sentence: "N meals planned this week, N things to buy." (singular forms for 1: "1 meal", "1 thing"; "meals" counts every entry of the week, recipe and free text).
- Today's recipe: today's planned recipe (the first Dinner recipe entry of today, else the first recipe entry of today by slot and position): image or placeholder, title, a label ("Tonight · Dinner" for Dinner, otherwise "Today · <slot>"), total minutes when present, "Serves N", the first tag if any.
- If no recipe is planned today but recipes exist: the newest recipe takes that place, with "Plan your day".
- If the archive is empty: a welcome message ("Every recipe worth keeping, in one place" with an explanatory line) and "Add your first recipe".
- "This week": the week range and the seven days (Mon to Sun) with day number, the first entry of each day (recipe image or placeholder, or the free text's initial; title) and "+N" when a day holds more entries; today is marked; days without entries read "Nothing planned".
- "Shopping list": "N open" and the first three open item names; with none, "List is empty" and a hint.
- "Favourite": the most recently favourited recipe (title, minutes and first tag); with none, "Tap the heart on a recipe to keep it here".
- "Recently added" (only when recipes exist): up to four newest recipes, each with image or placeholder, title, description, minutes, tags and favourite toggle, and an "All N recipes" link.

Actions:
- Open today's recipe, the favourite recipe or any recently added recipe: goes to `/recipes/<id>`. "Plan your day": `/plan`. Welcome "Add your first recipe": `/recipes/new`. "Open the plan": `/plan`. The "This week" summary: `/plan`. The "Shopping list" summary: `/list`. With no favourite the "Favourite" summary goes to `/recipes`. "All N recipes": `/recipes`.
- Toggle favourite on a recently added recipe (see 4.5 favourite behavior).

Required states: empty archive (welcome message, no "Recently added", no favourite) E; no recipe today; no favourites; empty list; empty week (all seven days "Nothing planned"); 1 and N recipes; overlong titles and descriptions T. Loading: server-rendered, no spinner expected L (n/a). Error: n/a X.

Keyboard and touch: every summary and recipe link is reachable and activatable by keyboard; touch targets sized for a phone; favourite toggles are toggle buttons.

### 4.2 `/recipes` Archive

Serves: J2, J7, J8 (link), J4/J5 (entry), J15.

Data shown:
- Page title "Recipes · Rues Cooking Hub", heading "Recipes worth keeping", context label "Archive" plus recipe count.
- "Featured": the seven newest recipes (newest first), presented one at a time with a position counter (`01/07`, `01/03`, `01/01`), a screen-reader announcement "<title>, N of M", previous and next controls (absent for a single recipe, disabled at the first and last recipe). Featured ignores filters. Absent when there are no recipes. Supporting line: "The seven newest additions" (7), "The newest additions" (2 to 6), "Your newest addition" (1).
- "All recipes": the tag filter (group "Filter by tag": one toggle "Favourites", then one toggle per tag with its recipe count, alphabetical; tags used by no recipe are left out unless selected; tags selected when the page loads come first), a search field (label "Search recipes", placeholder "Search recipes or ingredients"), a sort control, a live count ("12 recipes", "1 recipe"), context text for active filters ("in Dessert, Baking", "for “lemon”"), and the recipe list (accessible name "Recipes").
- Recipe in the list: image or placeholder, title, description (absent when none), total minutes ("30 min", absent when none), tags, favourite toggle; activating the recipe anywhere except the favourite toggle opens it. Long titles and descriptions may be shortened in the list; the recipe page shows them in full.
- Empty archive: heading "Start your archive", explanatory line, "Add your first recipe" to `/recipes/new`; no Featured, filters or list.
- Link "Manage tags" to `/recipes/tags`; "Add recipe" to `/recipes/new` (also offered by the navigation at every width, see 5).

Actions:
- Select or deselect several tags: shows recipes carrying all selected tags (AND).
- Toggle "Favourites": only favourites.
- Search: case- and accent-insensitive over title, description, ingredient names and tag names, combined with tags (AND); applied after a short pause while typing (about 200 ms); an empty or all-space query shows everything.
- Sort: "Newest first" (default), "Title A–Z" (case and accent aware: Ä sorts as A), "Total time" (ascending total, recipes without time last).
- Filter state lives in the URL: `?tags=<ids>&fav=1&q=<text>&sort=<newest|title|time>`. Reload and back/forward restore it. Search typing replaces the history entry instead of adding one per keystroke where possible.
- No match: "No recipes match" with a hint ("Try fewer tags or a different word.") and "Clear filters". "Clear filters" also appears whenever any filter is active and matches exist. Clearing removes all filter parameters, empties the search field, and shows every recipe.
- Toggle favourite on a recipe in the list.
- Open a recipe from the list or from Featured: `/recipes/<id>`.
- Featured: next/previous controls, swipe on touch, Left/Right arrow keys while Featured has focus.

Required states: empty archive E; zero matches; 1 recipe (count "1 recipe", Featured `01/01` without previous/next); 3 recipes; 9+ recipes (Featured capped at 7); recipes without image, description or time; overlong title (120 characters) and description (600 characters) T; loading n/a; error n/a.

Keyboard and touch: arriving through the navigation's "Search recipes" action puts focus in the search field (also when already on `/recipes`); search is focusable and keeps focus while filtering; tag and Favourites filters are toggle buttons (`aria-pressed`); sort is a single-choice control labelled "Sort recipes"; Featured is a focusable group handling Left/Right; swipe on phone; previous/next controls labelled "Previous recipe" and "Next recipe".

### 4.3 `/recipes/new` Import a recipe

Serves: J4, J5 (via link).

Data shown:
- Page title "Import a recipe · Rues Cooking Hub", heading "Bring a recipe home", context label "Recipes · New".
- A link field labelled "Paste a link to a recipe page" (placeholder "https://"), an "Import" button, help text with a "Start from scratch" link to `/recipes/new/form`.

Actions:
- Import: server reads the page (10 s timeout, at most 5 MB, redirects followed, only http and https). While working: the button reads "Reading…" and is disabled, the field is read-only, a status "Reading the page…" shows.
- Result "recipe": status "Read from <host>" ("Everything stays editable. New tags are created when you save."), then the recipe form (see 4.6) prefilled, inside a region named "Recipe preview", headed "Check and save". Fields mapped from schema.org Recipe data (title, description, servings, prep/cook minutes, ingredients as one untitled section, steps incl. titled sections, image URL, tags from category and keywords, source URL). Tag names equal to an existing tag ignoring case use that tag's spelling; new ones are created on save.
- Result "fallback" (page unreachable, error status, timeout, too large, or no recipe data): alert "Couldn't read a recipe from this page" with "We kept <what was kept>. Add ingredients and steps below." and the form prefilled with what was found (source URL; title from og:title or the page title; image URL from og:image), in the "Recipe preview" region, headed "Fill in the rest".
- Invalid input (not http or https, e.g. `recipe pie`): error "Enter a valid web address (http or https)" attached to the field, no "Recipe preview" region appears.
- Known source URL (matching an existing recipe's source URL after normalisation): status "Already in your archive" naming the existing recipe as a link, and "Import anyway" which proceeds to the preview.
- Saving from the preview behaves like manual save (4.6), downloading the image URL; if the download fails the recipe still saves without image and the notice "Saved without image: the image couldn't be downloaded." is shown.
- Cancel from the form returns to `/recipes`.
- The unsaved-changes guard applies once the preview form is edited (see 5), and the preview form is kept as a local draft (see 5, Local draft). Opening `/recipes/new` while a draft exists shows the draft's form (region "Recipe preview") with status "Restored your unsaved draft" and a "Discard draft" action instead of the empty link field.

Required states: initial; reading L; preview (recipe); preview (fallback) X; restored draft; invalid URL X; duplicate; empty n/a; many n/a; overlong input T (long titles, descriptions and URLs must stay usable).

Keyboard and touch: the URL field is submittable with Enter; URL keyboard on phones; autocorrect and autocapitalize off.

### 4.4 `/recipes/new/form` Write a recipe

Serves: J5.

Data shown: page title "New recipe · Rues Cooking Hub", heading "Write it down", context label "Recipes · New", the recipe form (4.6) empty with servings 2, headed "The recipe". When a local draft exists the form is prefilled from it instead, with status "Restored your unsaved draft" and a "Discard draft" action (see 5, Local draft).

Actions: as 4.6. Save opens the new recipe at `/recipes/<id>` (or, when an image URL failed, at its edit page with the notice). Cancel goes to `/recipes`.

Required states: empty form; restored draft; validation errors X; loading while saving L ("Saving…"); T for long text; 1 and N for sections and lines.

### 4.5 `/recipes/[id]` Recipe page

Serves: J3, J6, J7, J11, J15. Unknown or non-numeric id answers 404.

Data shown:
- Page title "<title> · Rues Cooking Hub". Back link "Back to recipes" to `/recipes`.
- Recipe image or the placeholder ("No photo yet").
- Info: tags (or "Recipe" when none), favourite toggle, title, description (only when present), times line "Prep 10 min · Cook 20 min · 30 min total" (parts shown only when set; absent when no times), "N servings", "Source" link with the host (only with a source URL; opens in a new tab).
- There is no planned status on the recipe page; the only route to the plan from here is "Add to plan".
- "Ingredients" with "for N" (N is the servings the ingredients are currently scaled to, initially the recipe's servings): by section (section titles as headings), each line's text; "No ingredients yet." when none. A servings control scales them (see Actions).
- "Method": steps by section, numbered continuously, Markdown rendered; "No steps yet." when none.
- "Notes" (only when present): rendered Markdown.

Actions:
- Favourite toggle: switches the flag, records when it was favourited, updates instantly without page reload; accessible name "Add <title> to favourites" / "Remove <title> from favourites", state exposed via `aria-pressed`. Persists across reload; the recipe then appears under the archive's Favourites filter.
- Scale servings: a control labelled "Scale to servings" (group name "Scale recipe") with a number field starting at the recipe's servings, buttons "Scale down" and "Scale up" (one serving each) and, whenever the value differs from the recipe's servings, "Reset to N servings". Whole numbers, at least 1; a value below 1 or not whole is not applied, the previous scale stays and the alert "Servings must be at least 1" is shown. Scaling is a view only: nothing is stored, the recipe's servings stay, "Add to plan" still defaults to the recipe's servings, and the scale resets on reload and on leaving the page. Scaling multiplies each ingredient line's quantity by (chosen servings / recipe servings). A scaled line reads quantity, unit, name and note in that order (quantities shown with at most two decimals, trailing zeros dropped, a range line keeps both ends and scales both, so "2–3 cloves" at double servings reads "4–6 cloves"); a line with no readable quantity is shown unchanged; at the recipe's own servings every line shows its original text. "for N" and the line texts update at once without reload and without moving focus away from the control. Steps, notes and times are not scaled.
- "Add to plan": dialog titled "Add to plan" (context label is the recipe title) with a day picker (seven days of a week, defaults to today's week and today; "Earlier week" and "Later week" step the shown week), a meal choice (Breakfast, Lunch, Dinner, Snacks; default Dinner), servings (default the recipe's servings, at least 1, with "Fewer servings" and "More servings" buttons and a number field). Confirm "Add to plan" appends a recipe entry at the end of that slot, then the dialog shows a status "Added to <Weekday> · <Slot>" with "Done" and "Open the week" (to `/plan?week=<monday>`). Servings below 1: alert "Servings must be at least 1", nothing added.
- "Edit": goes to `/recipes/<id>/edit`.
- "Delete recipe": dialog titled "Delete “<title>”?" (context label "Delete recipe"); when plan entries use it: "It's used in N plan entries; they'll stay in the plan as text." (singular: "It's used in 1 plan entry; it'll stay in the plan as text."); with none, no extra line. "Cancel" and "Delete". On delete: recipe and image removed, plan entries become text, list unchanged, the archive opens.
- "Source": external link.

Required states: with and without image, source, times, description, notes; scaled up, scaled down and at the recipe's own servings; scaled lines with and without quantity; invalid scale value X; no ingredients; no steps; one section and many sections; overlong title, description and lines T; 404 X; loading n/a; Markdown with HTML or scripts shows them as inert text.

Keyboard and touch: dialogs are modal and close on Escape, on a close control labelled "Close", and on clicking or tapping outside them; focus enters the dialog; favourite is a toggle button; the scale field takes a numeric keyboard on phones and its buttons are touch-sized.

### 4.6 The recipe form (used by `/recipes/new` preview, `/recipes/new/form`, `/recipes/[id]/edit`)

Serves: J4, J5, J6, J8.

Fields and controls:
- Photo: current image or placeholder; "Add photo" (or "Replace" when one exists) opens a file chooser (images only; the file input is labelled "Photo file" and is operated through the "Add photo"/"Replace" button); a link field labelled "Image link" (placeholder "Or paste an image link"); "Remove image" (only when an image exists). The chosen file name is shown. A pasted link previews when it loads.
- "Title" (required), "Description" (marked optional), "Servings" (number, default 2), "Prep, min", "Cook, min", "Source" (marked optional, URL).
- "Tags": selected tags listed (accessible name "Selected tags") each with "Remove <name>"; new names carry a "new" marker; input labelled "Add a tag" (placeholder "Add a tag") where Enter or comma confirms a name (pasting `a, b, c` adds three), Backspace on an empty input removes the last tag; "Tag suggestions" lists existing unselected tags as one-tap additions; a name matching an existing tag ignoring case reuses it.
- "Ingredients": ingredient sections (group name "Ingredient section N"), each with "Section title" (placeholder "Section title (optional)"), lines labelled "Ingredient line" (Enter adds a new line right after it and focuses it), a live parse of each non-empty line (group "Parsed ingredient": quantity, unit, name, note, or "no amount"), "Remove line" (when more than one line), "Add line", "Remove section" (when more than one section), "Add ingredient section".
- "Method": step sections (group name "Step section N"), lines labelled "Step N" (multi-line text; placeholder "Describe the first step" on the first), "Remove step" when more than one, "Add step", "Remove section", "Add step section".
- "Notes" (placeholder "Tips, variations, storage. Markdown works.").
- Actions "Cancel" and "Save recipe" (currently offered twice, before and after the fields; tests use the first instance); while saving, "Save recipe" reads "Saving…" and is disabled.

Actions and validation (server-authoritative, mirrored in the form; each error is attached to its field (`aria-invalid` and the field's accessible description); after a failed save focus moves to the first invalid field; an error disappears as soon as its field is edited and comes back with the next server answer; the form stays, input kept, nothing stored):
- Empty title: "Title is required".
- Servings below 1 or not a whole number: "Servings must be at least 1".
- Prep or cook not whole minutes 0 or more: "Enter whole minutes, 0 or more".
- Image file not an image: "That file isn't an image". Over 15 MB: "Images can be at most 15 MB" (shown immediately before upload; Save without the image stays possible).
- Image link that cannot be downloaded: recipe saves without image; on create, the edit page opens with a notice "Saved without image: the image couldn't be downloaded."; on edit with an existing image, the old image stays and the notice reads "The new image couldn't be downloaded; the previous image was kept."
- Save stores the recipe and opens `/recipes/<id>` (or the edit page with the image notice). Empty ingredient or step sections (no lines) are dropped. Tags are created as needed. Source URL is stored normalised.
- Cancel: from create and import, `/recipes`; from edit, `/recipes/<id>`.
- Unsaved-changes guard and local draft (new and imported recipes only): see 5.

Required states: empty, prefilled, errors, saving L, one and many sections and lines, overlong text T, image present and absent.

Keyboard and touch: Enter in an ingredient line adds a line; Enter in the tag input adds a tag; every control has a label; numeric fields bring up a numeric keyboard on phones; the file chooser is reachable through the "Add photo"/"Replace" button.

### 4.7 `/recipes/[id]/edit` Edit recipe

Serves: J6. Unknown id answers 404. Title "Edit <title> · Rues Cooking Hub", heading "Edit recipe", context label "Recipes · Edit". The form (4.6) is prefilled with all stored values (including ingredient original lines, sections in order, step sections, notes and image); form heading is the recipe's title. Save updates the recipe and opens its page. Notice (status) when an image download failed (see 4.6).

Required states: as 4.6 plus 404 X.

### 4.8 `/recipes/tags` Manage tags

Serves: J8.

Data shown: title "Tags · Rues Cooking Hub", heading "Manage tags", context label "Archive" with tag count ("1 tag", "N tags"), explanatory line ("Rename a tag onto one that already exists and the two become one. New tags are added while editing a recipe."), link "All recipes" to `/recipes`, the list (accessible name "Tags") of every tag with its recipe count ("0 recipes", "1 recipe", "N recipes"), and a status area for outcomes.

Actions:
- "Rename <name>": opens a rename form for that tag (replacing the tag's actions while open) with a field labelled "New name for <name>" prefilled with the current name, "Save", "Cancel"; Escape cancels. Empty name: "Enter a name". Renaming onto an existing name (ignoring case) merges, status "Merged <from> into <into>"; otherwise the tag and all its recipes show the new name.
- "Delete <name>": dialog "Delete tag “<name>”?" (context label "Delete tag"); for a used tag "It's used by N recipes."; for an unused tag no extra line; "Cancel" and "Delete". Deleting removes the tag from its recipes; the recipes remain.

Required states: empty list (all tags deleted) E; one tag; many tags; unused tag (count 0); overlong tag name T; loading n/a; error (empty name) X.

Keyboard and touch: rename field takes focus when opened; Escape cancels; actions without visible text have accessible names ("Rename <name>", "Delete <name>"); the dialog closes on Escape, the close control and a click outside.

### 4.9 `/plan` Meal plan

Serves: J9, J10, J11 (landing), J15.

Data shown:
- Title "Plan · Rues Cooking Hub". Heading: "This week", "Next week", "Last week", or "Week N" for other weeks; context label with week number and date range (for example "19 – 25 October"). Week is chosen by `?week=<any iso date>`, normalised to that week's Monday; default is the week containing today.
- Seven days Monday to Sunday, each with the weekday and day number; today is marked ("Today"). Each day has four slots (Breakfast, Lunch, Dinner, Snacks); a slot is a group named "<Weekday> <Slot>" holding any number of entries in position order. Each slot always offers an add control named "Add to <Weekday> <Slot>".
- Entry: recipe entries show title, image or placeholder and servings ("N servings"); free-text entries show the text. Each entry has an "Options for <title>" control.
- Recipe picker (a complementary region named "Recipes") listing all recipes sorted by title, each with image or placeholder, title and minutes; it is the drag source for adding recipes; a search field "Find a recipe" (placeholder "Find a recipe"), "No recipes yet" when the archive is empty and "No recipes match" when the search finds nothing; on drag-capable devices a hint "Drag onto a day".

Actions:
- Previous and next week ("Previous week", "Next week", links that change `?week=`), "This week" (back to the current week).
- Add entry: the add control opens a dialog (context label "Add to plan", title "<Weekday> · <Slot>", accessible name "Add to <Weekday> <Slot>") with choice "Recipe" or "Free text". Recipe mode: search field "Search recipes" (placeholder "Search recipes"; focused on open only on fine-pointer devices), result list with title, "N servings" and minutes, "No recipes yet" or "No recipes match" when empty; picking a recipe reveals a "Servings" number field prefilled with the recipe's servings and "Add to plan". Free text mode: field "Text" (placeholder "Pizza night, leftovers, eating out") and "Add to plan". The entry is appended at the end of the slot. Errors shown in the dialog: empty text "Enter a recipe or some text"; servings below 1 "Servings must be at least 1".
- Entry options menu (keyboard reachable; opens with focus on the first item; Escape closes and returns focus to the trigger): "Change servings" (recipe entries) or "Edit text" (free text) opens an edit form for that entry with field "Servings" or "Text", "Save" and "Cancel", errors as above; "Move to…"; "Delete" (immediate, no confirm).
- "Move to…": dialog "Move to…" (accessible name "Move <title>") with a Day choice (the seven days of the shown week, each named like "Friday 24", initial selection is the entry's current day, focused) and a Meal choice (four slots), a live summary line ("Into <day> · <slot>" or "To the end of <current place>" when unchanged), "Cancel" and "Move here". The entry lands at the end of the chosen slot. Works on phone and desktop and by keyboard alone.
- Drag (desktop, fine pointer only): drag a recipe from the recipe picker onto a slot to add it with the recipe's servings; drag an entry to another slot, another day, or another position within a slot (dropping on an entry places it before that entry). The slot the pointer is over is the drop target (exposed as `data-drop-target`) and shows a hint ("Drop to add" for a recipe, "Move here" for an entry). A drop outside any slot returns the entry to its origin and saves nothing. Every drag result persists across reload.
- "Copy week": dialog "Copy week" (context label "Meal plan") that copies every entry of a source week into the shown week, same weekday and slot, appended after existing entries. The source defaults to the week before; "Earlier week" and "Later week" step the source (up to 26 earlier weeks); each source shows its range ("12 – 18 October") and its entry count ("1 entry", "N entries") or "No entries in this week". Primary button reads "Copy 1 entry" / "Copy N entries", or "Copy" when the source is empty; an empty source reports "Nothing to copy" and changes nothing. When the shown week already has entries, the first press asks first: "This week already has N entries. The copied entries are added after them." with "Back" and "Add anyway". Source and target must differ (the server rejects a copy onto itself with 400).

Required states: empty week (28 empty slots, each with an add control) E; 1 entry; many entries per slot; recipe entries without image; free text; overlong recipe or free-text titles T; entries whose recipe was deleted show as text; empty archive (recipe picker and add dialog say "No recipes yet"); today in the shown week and not; past, current and far-future weeks; loading n/a; error states inside dialogs X.

Keyboard and touch: all drag actions have the "Move to…" alternative; day and meal choices are radio groups with arrow-key selection; dialogs are modal, close on Escape, "Close", outside click; add controls and options controls are at least touch-sized; on touch (coarse pointer) drag is absent and every move goes through "Move to…"; with a fine pointer a single drag must be able to reach from the recipe picker to any slot of the shown week.

### 4.10 `/list` Shopping list

Serves: J12, J13, J14.

Data shown:
- Title "List · Rues Cooking Hub", heading "Things to buy", context label "Shopping list" plus "N open".
- An add field (accessible name "Add an item", placeholder "Add an item, e.g. 2 l oat milk"), an "Add from plan" button, and a status area announcing "Added N item(s) from the plan" (singular "Added 1 item from the plan"; clears itself after about 6 seconds).
- "To buy" (region) with supporting line "By aisle": open items grouped by category (Produce, Dairy & Eggs, Meat & Fish, Bakery, Pantry, Frozen, Drinks, Household, Other in that order, empty categories omitted), each group named by its label with an item count. Empty: "Nothing to buy" with "Type an item above, or add the ingredients of the meals you planned."
- Item: a checkbox named by the item's name; the name; the amount (or none); items that came from the plan are marked as such ("From the plan"); an item merged from manual and plan parts shows the combined amount with "incl. <plan part> from plan".
- "Checked N" (region named starting "Checked", after all categories in reading order, present whenever the list has any item): checked items (list named "Checked items"); "Tick things off as you shop; they gather here." when none; "Clear checked" button, disabled when nothing is checked.

Actions:
- Add item: type a line and press Enter. The line is parsed like an ingredient line (`2 l milk` gives name `milk`, amount 2 l). Empty or whitespace adds nothing. A name equal (ignoring case, singular/plural folded) to an open manual item merges amounts into it. The new item takes the category last remembered for its name, else Other. The field empties after adding.
- Check and uncheck: checking sets the checkbox to checked, marks the item as done, and moves the item to Checked (appended at the end of Checked); unchecking returns it to its category. Optimistic: the item moves immediately.
- Edit item (activate the item name): an edit form for that item named "Edit <name>" with "Name", "Amount" (placeholder "e.g. 200 g"; free text such as `1 cup + 200 g`), for a merged item the manual part is edited and the line "From plan: <part>" is shown; "Delete", "Cancel", "Save". Unreadable amount: alert "Enter an amount like 200 g" at the amount field (`aria-invalid`), previous amount kept. Escape closes the editor. Delete removes the item at once.
- Move to category: a "Move <name> to another category" control opens a menu named "Move <name> to" of nine radio items (current one checked and focused on open); choosing moves the item and remembers the choice for that name; focus returns to the item's control.
- "Clear checked": deletes every checked item.
- "Add from plan": dialog titled "Add from plan" with explanation ("Ingredients of every recipe planned in these days, scaled to their servings."), quick ranges "This week" and "Next week" (group "Quick ranges", the active one marked), date fields "From" and "To" (default the current Monday to Sunday), "Cancel" and "Add to list" ("Adding…" while working). Behavior: every recipe entry in the range contributes its ingredients scaled by entry servings divided by recipe servings; free-text entries contribute nothing; lines merge by name (case and plural folded, longest name shown); equal units sum; g with kg and ml with l sum within the family (displayed as kg or l from 1000); other units stay as separate amounts on one line ("1 cup + 200 g flour"); a line without quantity appears once without amount; a plan amount for a name that has an open manual item merges into that item (manual part kept). Running again replaces every open plan-derived item and recalculates the plan part of open manual items; manual parts and checked items stay, and a name already present as a checked plan-contributed item is not added again. Empty range: "Nothing planned in this range", list unchanged. Missing or invalid dates: "Choose a start and an end date". Success closes the dialog and announces the count.

Required states: empty list E; only checked items; open items in one category and in many; item without amount; merged manual+plan item; overlong item names and amounts T; 1 and N items; loading n/a; error (bad amount, nothing planned, invalid dates) X.

Keyboard and touch: the add field submits on Enter (phone keyboard "done" key); checkboxes are real checkbox semantics (role checkbox, checked state); the category menu supports arrow keys and focuses the current category; Escape closes menu, editor and dialog; actions are touch-sized and usable one-handed in a store.

### 4.11 Non-page endpoints

- `POST /recipes/<id>/favourite` (form field `favourite` = `0` or `1`): sets the flag, answers 204; unknown recipe 404, other value 400. Used by every favourite toggle.
- `GET /images/<id>`: serves a stored image with `Cache-Control: public, max-age=31536000, immutable`; unknown or non-numeric id answers 404.
- `GET /healthz`: `ok` with 200 while the database answers, 503 otherwise.

## 5. Cross-cutting behavior

- Navigation: four areas are reachable from every page: Home `/`, Recipes `/recipes`, Plan `/plan`, List `/list` (navigation named "Main", links named "Home", "Recipes", "Plan", "List"). The current area is marked with `aria-current="page"`, also on pages within it (`/recipes/12`, `/recipes/new/form`, `/recipes/tags` all mark Recipes). At every viewport width the navigation offers the same actions: the brand name "Rues Cooking Hub" (link home), an "Add recipe" action (to `/recipes/new`) and a "Search recipes" action (to `/recipes`, where the search field takes focus on arrival), besides the four area links; how they are presented may differ by width, availability does not. Content is never covered by the navigation at any viewport, including a tablet and a phone in landscape. Exactly one navigation named "Main" is exposed to users and assistive tech at a time, whatever the viewport.
- Scroll state: after scrolling more than 48 px the navigation reports a scrolled state (`data-compact`, see 7) and drops it again when back within 48 px of the top. How, or whether, the presentation changes is free; link names stay available to assistive tech in both states, and under reduced motion any change is instant.
- Page transitions: navigation between areas and from a recipe in a list to its page use view transitions when the browser supports them and reduced motion is not requested; otherwise navigation is instant and error-free. Reduced motion (`prefers-reduced-motion`) disables all non-essential motion: entrance animations, scroll-linked motion, transitions between pages, animated reordering when filtering the archive, and animated movement of checked list items; behavior stays identical.
- Persistence: all data is server-side SQLite; every mutation persists across reload. There are no accounts. The filter state of the archive and the shown week of the plan live in the URL. The UI applies some changes optimistically (favourite toggles, list check and clear, category moves) and settles to server state after the request.
- Offline and sync: none. No service worker, no manifest, no background sync. A failed request is not queued.
- Local draft: a new or imported recipe form with edits keeps a draft in the browser (see Entities, Recipe draft). Returning to `/recipes/new` or `/recipes/new/form` after reload, closing the tab or leaving the page restores it with status "Restored your unsaved draft"; "Discard draft" and a successful save clear it, as does "Discard" in the discard dialog. Because the draft survives, reload and tab close no longer need the browser's own confirmation.
- Unsaved-changes guard: on the recipe form, leaving by in-app navigation with edits cancels the navigation and asks "Discard changes?" ("What you changed on this recipe isn't saved yet.") with "Keep editing" (stay, edits kept) and "Discard" (continue to the destination). Escape in the dialog keeps editing. Typing back to the original value is not a change. Leaving without changes asks nothing. Edits to new or imported recipes are kept as a local draft (above); editing an existing recipe has no draft. A successful save navigates away without asking.
- Import flow: the single entry is `/recipes/new` (link in, server reads, editable preview, save). Fallback and duplicate handling per 4.3. Server-side import reading, normalisation of source URLs and the duplicate check are part of the behavior.
- Add-to-plan entry points: recipe page "Add to plan" dialog, plan slot add dialog, drag from the recipe picker, "Copy week", and "Move to…".
- Plan to list: "Add from plan" on the List area is the only way plan data reaches the list; deleting a recipe or changing the plan afterwards never changes the list until it is run again.
- Dialogs: every dialog is modal, traps focus, closes on Escape, via the "Close" control and by clicking outside, and moves focus in on open and back on close; the discard dialog is an alert dialog.
- Shortcuts and keys: Enter submits add fields and adds ingredient lines and tags; comma confirms a tag; Backspace on an empty tag input removes the last tag; Escape closes dialogs, menus, in-place editors and the discard dialog; Left and Right arrows step Featured when it has focus; arrow keys move within radio groups and the category menu.
- Dates: weeks run Monday to Sunday; "today" is the server's clock (a test clock can override it); dates are plain calendar dates without time zone arithmetic. UI language is English with day and month names in English (British ordering, for example "19 – 25 October").
- Plurals: "1 recipe" / "N recipes", "1 entry" / "N entries", "1 item" / "N items", "1 tag" / "N tags", "1 meal" / "N meals", "1 thing" / "N things", "N servings" (always plural form "servings" in the recipe meta and plan).
- Error pages: unknown recipe or image ids answer 404 (recipe pages show the framework's not-found page; no custom page exists).
- Accessibility: the target is WCAG 2.2 level AA on every route and dialog. Beyond what is stated per route this means: text and interface contrast and non-text contrast at AA, text resizable to 200% and reflow at 320 px wide without two-dimensional scrolling, visible keyboard focus that is never hidden behind the navigation or a dialog (2.4.11), pointer targets of at least 24 by 24 CSS px (2.5.8), no function that depends on dragging alone (2.5.7; "Move to…" covers every drag), consistent placement of repeated navigation and help (3.2.6), no information carried by colour alone, status messages announced without taking focus, and redundant entry avoided (the draft and the import preview).
- Runtime facts relevant to the product: `BODY_SIZE_LIMIT` must be raised (16M) for photo uploads; the app is served from one Node process with SQLite.

## 6. Copy list

Every UI string matched exactly (getByText, getByRole name, getByLabel, placeholder, toHaveText) by the e2e suite for user-facing routes. All current UI copy is already English, so every target equals the current string. Strings with a trailing "…" keep it. `<x>` marks dynamic parts. Specs: `ar`=archive.test.ts, `arf`=archive-filters.test.ts, `fe`=featured.test.ts, `ho`=home.test.ts, `im`=import.test.ts, `jo`=journey.test.ts, `lc`=list-check.test.ts, `lp`=list-plan.test.ts, `li`=list.test.ts, `na`=nav.test.ts, `pc`=plan-copy.test.ts, `pe`=plan-entries.test.ts, `pm`=plan-move.test.ts, `pl`=plan.test.ts, `re`=recipe-edit.test.ts, `rf`=recipe-form.test.ts, `ri`=recipe-image.test.ts, `rp`=recipe-page.test.ts, `ta`=tags.test.ts, `tr`=transitions.test.ts (all under `e2e/`).

| current string | English target | used in spec file |
|---|---|---|
| Home | Home | na, tr, jo |
| Recipes | Recipes | na, tr, jo |
| Plan | Plan | na, rf, tr, jo |
| List | List | na, tr, jo |
| Main (navigation name) | Main | na, jo, tr |
| Add your first recipe | Add your first recipe | ar, ho |
| Start your archive | Start your archive | fe |
| Featured | Featured | ar, fe |
| Next recipe | Next recipe | fe |
| Previous recipe | Previous recipe | fe |
| Recently added | Recently added | ho |
| Plan your day | Plan your day | ho |
| List is empty | List is empty | ho |
| Tap the heart on a recipe to keep it here | Tap the heart on a recipe to keep it here | ho |
| Tonight · Dinner | Tonight · Dinner | ho |
| This week | This week | ho, pl, lp |
| Next week | Next week | ho, pl, lp |
| N open (e.g. "5 open") | N open | ho |
| Mon, Tue, Wed, Thu, Fri, Sat, Sun | Mon, Tue, Wed, Thu, Fri, Sat, Sun | ho |
| Sort recipes | Sort recipes | arf |
| Title A–Z | Title A–Z | arf |
| Shortest time (sort option) | Total time | none yet (arf to add) |
| Filter by tag | Filter by tag | arf, ar, fe, jo |
| Search recipes | Search recipes | arf, pe, jo |
| Add recipe (navigation action, archive link) | Add recipe | none yet (na to add) |
| Clear filters | Clear filters | arf, jo |
| No recipes match | No recipes match | arf |
| Recipes (list name) | Recipes | arf, ar, fe, jo, rp |
| No photo yet | No photo yet | ar, ri, rp |
| 1 recipe / 2 recipes / 5 recipes (status) | N recipe(s) | arf |
| Favourites (toggle) | Favourites | ar |
| Add Lasagne to favourites | Add <title> to favourites | rp |
| Remove Lasagne from favourites | Remove <title> from favourites | rp |
| 15 min / 30 min / 5 min | N min | ar |
| Paste a link to a recipe page | Paste a link to a recipe page | im, jo |
| Import | Import | im, jo |
| Reading the page… | Reading the page… | im |
| Reading | Reading… | im |
| Import anyway | Import anyway | im |
| Already in your archive | Already in your archive | im |
| Couldn't read a recipe from this page | Couldn't read a recipe from this page | im |
| Enter a valid web address (http or https) | Enter a valid web address (http or https) | im |
| Read from <host> | Read from <host> | im |
| Recipe preview | Recipe preview | im, jo |
| Start from scratch | Start from scratch | im |
| Save recipe | Save recipe | im, jo, re, rf, ri |
| Remove <name> (tags in form) | Remove <name> | im, rf |
| Selected tags | Selected tags | im, jo, re, rf |
| Title | Title | im, jo, re, rf, ri, rp |
| Description | Description (optional) | im, re |
| Image link | Image link | im, ri |
| Ingredient line | Ingredient line | im, jo, re, rf |
| Servings | Servings | im, jo, re, rf, rp, pe |
| Source | Source (optional) | im, re, rp |
| Prep, min | Prep, min | re |
| Cook, min | Cook, min | re |
| Notes | Notes | re, rp |
| Section title | Section title | re, rf |
| Step 1 / Step 2 | Step N | re, rf |
| Add a tag | Add a tag | jo, rf |
| Tag suggestions | Tag suggestions | rf |
| Add line | Add line | jo, rf |
| Remove line | Remove line | rf |
| Add step | Add step | rf |
| Add ingredient section | Add ingredient section | rf |
| Add step section | Add step section | rf |
| Remove section | Remove section | rf |
| Ingredient section N | Ingredient section N | re, rf |
| Step section N | Step section N | rf |
| Parsed ingredient | Parsed ingredient | rf |
| Discard changes? | Discard changes? | rf |
| Keep editing | Keep editing | rf |
| Discard | Discard | rf |
| Restored your unsaved draft (new) | Restored your unsaved draft | none yet (rf to add) |
| Discard draft (new) | Discard draft | none yet (rf to add) |
| Cancel | Cancel | rf, re, rp |
| Remove image | Remove image | ri |
| Title is required | Title is required | im, rf |
| Servings must be at least 1 | Servings must be at least 1 | rf, rp, pe |
| That file isn't an image | That file isn't an image | ri |
| Images can be at most 15 MB | Images can be at most 15 MB | ri |
| Saved without image: the image couldn't be downloaded. | Saved without image: the image couldn't be downloaded. | im, ri |
| The new image couldn't be downloaded; the previous image was kept. | The new image couldn't be downloaded; the previous image was kept. | ri |
| Edit | Edit | jo, rp |
| Add to plan | Add to plan | jo, pe, rp |
| Delete | Delete | rp, ta, pe, li |
| Delete recipe | Delete recipe | rp |
| Delete “<title>”? | Delete “<title>”? | rp |
| It's used in 2 plan entries; they'll stay in the plan as text. | It's used in N plan entries; they'll stay in the plan as text. | rp |
| More servings | More servings | jo, rp |
| Added to Wednesday · Dinner | Added to <Weekday> · <Slot> | jo, rp |
| Open the week | Open the week | rp |
| Done | Done | jo |
| Prep 10 min · Cook 20 min · 30 min total | Prep 10 min · Cook 20 min · 30 min total | rp |
| N servings (e.g. "4 servings") | N servings | jo, rp, pe, pc, pm |
| Ingredients | Ingredients | jo, rp |
| Scale to servings (new) | Scale to servings | none yet (rp to add) |
| Scale recipe (group name, new) | Scale recipe | none yet |
| Scale down / Scale up (new) | Scale down / Scale up | none yet (rp to add) |
| Reset to 4 servings (new) | Reset to N servings | none yet (rp to add) |
| Method | Method | rp |
| Dinner | Dinner | jo, rp, pm |
| Breakfast / Snacks | Breakfast / Snacks | pm |
| Monday 19 October / Wednesday 21 October (day choice) | <Weekday> <D> <Month> | jo, rp |
| Manage tags | Manage tags | ta |
| Tags (list name) | Tags | ta |
| Delete <name> (tag) | Delete <name> | ta |
| Rename <name> | Rename <name> | ta |
| New name for <name> | New name for <name> | ta |
| Delete tag “<name>”? | Delete tag “<name>”? | ta |
| It's used by 4 recipes. | It's used by N recipes. | ta |
| Enter a name | Enter a name | ta |
| Merged Side into Dessert | Merged <from> into <into> | ta |
| 0 recipes / 2 recipes / 3 recipes / 4 recipes | N recipes | ta |
| Previous week | Previous week | pl |
| 19 – 25 October | <D> – <D> <Month> | pl, pc |
| Add to <Weekday> <Slot> (e.g. Add to Tuesday Dinner) | Add to <Weekday> <Slot> | pl, pe |
| Options for <title> | Options for <title> | pe, pm |
| Change servings | Change servings | pe, pm |
| Edit text | Edit text | pe |
| Move to… | Move to… | pm |
| Move here | Move here | pm |
| Move <title> (dialog name) | Move <title> | pm |
| Free text | Free text | pe |
| Text | Text | pe |
| Save | Save | pe, li |
| Enter a recipe or some text | Enter a recipe or some text | pe |
| Copy week | Copy week | pc |
| Copy | Copy | pc |
| Copy 1 entry / Copy 2 entries | Copy N entry/entries | pc |
| Earlier week | Earlier week | pc |
| Add anyway | Add anyway | pc |
| This week already has 1 entry | This week already has N entries | pc |
| No entries in this week | No entries in this week | pc |
| Nothing to copy | Nothing to copy | pc |
| Add an item | Add an item | li |
| Add from plan | Add from plan | jo, li, lp |
| Add to list | Add to list | jo, lp |
| Added 3 items from the plan | Added N items from the plan | jo, lp |
| From | From | jo, lp |
| To | To | lp |
| Nothing planned in this range | Nothing planned in this range | lp |
| To buy | To buy | jo, lp, lc, li |
| Checked (region name prefix) | Checked | lc |
| Clear checked | Clear checked | lc |
| Dairy & Eggs / Produce / Other | Dairy & Eggs / Produce / Other (all nine categories keep their names) | lc, li |
| Edit <name> (item and form) | Edit <name> | li |
| Move <name> to another category | Move <name> to another category | li |
| Move <name> to (menu name) | Move <name> to | li |
| Name | Name | li |
| Amount | Amount | li |
| Enter an amount like 200 g | Enter an amount like 200 g | li |
| From plan: 500 ml | From plan: <amount> | li |

Count: 152 rows (about 170 distinct strings counting alternates inside rows); 8 rows are new from gate-1 decisions and marked "none yet" in the spec column, the e2e suite does not match them until the redesign's tests are written. "Shortest time" appears nowhere in the e2e suite. German strings: 0. The only German text in the tests is data (recipe titles such as "Käse-Spätzle", "Äpfel im Schlafrock"), which is fixture content, not UI copy.

Strings in the UI that the e2e suite does not match, but which are part of this contract's behavior descriptions and should also be English: all headings, kickers and helper sentences quoted in section 4 (for example "Recipes worth keeping", "Bring a recipe home", "Write it down", "Things to buy", "Nothing to buy", "Manage tags", "Tick things off as you shop; they gather here.", "Try fewer tags or a different word.").

## 7. Behavioral `data-*` allow-list

Rule: only attributes that express state that has no accessible equivalent. Everything else the suite currently uses (`data-entry`, `data-day`, `data-slot`, `data-date`, `data-today`, `data-recipe`, `data-recipe-info`, `data-hero`, `data-tile`, `data-nav`, `data-card`, `data-front`, `data-stage`, `data-open`, `data-strike`, `data-part`, `data-image-frame`, `data-weekday`, `data-title`, `data-times`, `data-dragging`, `data-reading-sweep`, `data-shot-bottom`) is NOT allow-listed: those are structural or styling hooks and must be replaced in the tests by roles, labels, names, text or `aria-current` (for example today's day via `aria-current="date"`, the currently shown Featured recipe via `aria-current`, a check state via the checkbox role).

| attribute | what it signals | why no role or label covers it |
|---|---|---|
| `data-hydrated` (on the document element) | The client app has booted, so event handlers and enhanced forms are live. | Pure readiness of the page's scripts; no ARIA state means "scripts attached". Tests wait on it before interacting. |
| `data-drop-target` (on a plan slot) | During a drag, this slot is the one the dragged recipe or entry would drop into. | Transient pointer-drag state; the only ARIA drag attributes (`aria-dropeffect`, `aria-grabbed`) are deprecated and unsupported. |
| `data-compact` (on the navigation) | The page is scrolled more than 48 px; the navigation is in its scrolled state. | Scroll-derived state of a landmark; no ARIA attribute expresses it. |
| `data-column` (on a content column) | The edges of the page's content column, which the page header and every section heading must line up with, centred in the viewport at a bounded width. | Alignment is layout geometry; a generic container has no role or name to find it by. |
| `data-page-header` (on the page header block) | The page's header block, which must start at the content column's left edge. | The header's position is what is measured; a generic container has no role or name, and the page `h1` may sit inside a panel that is inset on purpose. |
| `data-section-heading` (on a section heading) | A section heading that must start at the content column's left edge. | Headings inside panels or second columns are inset on purpose and carry the same role, so only the column-level ones need marking. |

## 8. Route coverage check

Source: `src/routes` (excluding `/__test*` and `/__mockups*`). 12 of 12 covered.

| route | file(s) | contract section |
|---|---|---|
| `/` | `(app)/+page.svelte` | 4.1 |
| `/recipes` | `(app)/recipes/+page.svelte` | 4.2 |
| `/recipes/new` | `(app)/recipes/new/+page.svelte` | 4.3 |
| `/recipes/new/form` | `(app)/recipes/new/form/+page.svelte` | 4.4 (form: 4.6) |
| `/recipes/[id]` | `(app)/recipes/[id]/+page.svelte` | 4.5 |
| `/recipes/[id]/edit` | `(app)/recipes/[id]/edit/+page.svelte` | 4.7 (form: 4.6) |
| `/recipes/tags` | `(app)/recipes/tags/+page.svelte` | 4.8 |
| `/plan` | `(app)/plan/+page.svelte` | 4.9 |
| `/list` | `(app)/list/+page.svelte` | 4.10 |
| `POST /recipes/[id]/favourite` | `(app)/recipes/[id]/favourite/+server.ts` | 4.11, 4.5 |
| `GET /images/[id]` | `images/[id]/+server.ts` | 4.11 |
| `GET /healthz` | `healthz/+server.ts` | 4.11 |

## 9. Graph notes

None. `graphify-out/graph.json` already contained every user-facing route (pages and the three server endpoints), no `.graphifyignore` exists, and no nodes pointed at deleted code. Observation only: the graph also indexes `src/routes/__mockups` and `__test` code, which this contract deliberately ignored. After writing this file and `PRODUCT.md`, the graph was updated so both documents are part of it.

## 10. Gate-1 decisions

Rue's answers to the contract's open questions. Types: contract-only (no code change), server/data (logic built and unit-tested before the redesign, in OpenSpec change `gate-1-decisions`), UI (affordances and copy built in the redesign).

| # | question (short) | decision | type |
|---|---|---|---|
| 1 | Recipe page "Planned" status | Dropped: no planned status, no "Not planned yet" prompt; "Add to plan" stays | UI |
| 2 | Home "Recently added" and summary sentence | Both kept as required | contract-only (no code change) |
| 3 | Immediate delete of plan entry, list item, "Clear checked" | Kept immediate, no confirm, no undo | contract-only (no code change) |
| 4 | Archive sort label | Renamed "Shortest time" to "Total time" | UI |
| 5a | Unsaved new or imported recipe survives reload: storage logic | Local draft (save, load, clear, restore rules); dropping the browser's reload prompt confirmed by Rue on 2026-11-13 (gate 1 / task 2.5) | server/data (code change before redesign) |
| 5b | Draft: restored notice, "Discard draft", wiring into the forms | Shown on both new-recipe routes | UI |
| 6a | Servings scaling on the recipe page: scaling function | Quantity times chosen/recipe servings, formatted per 4.5; a range keeps both ends and scales both ("2–3" doubled is "4–6"); confirmed by Rue on 2026-11-13 (gate 1 / task 2.5) | server/data (code change before redesign) |
| 6b | Scaling control, reset, scaled ingredient display | "Scale to servings" control on the recipe page; copy confirmed by Rue on 2026-11-13 (gate 1 / task 2.5) | UI |
| 7 | "Search recipes" focus | Search field focused on arrival at `/recipes` | UI |
| 8 | Narrow-viewport navigation actions | Brand link, "Add recipe" and "Search recipes" at every width | UI |
| 9 | Accessibility target | WCAG 2.2 AA (section 5, PRODUCT.md) | contract-only (no code change) |

### Built in the redesign

The logic below is built and unit-tested in `gate-1-decisions`; these UI affordances are built in the redesign, each with its e2e scenario from the change's delta specs:

- Scale control ("Scale to servings") and scaled ingredient display, scaling `parseIngredient(line.text)` (a range's lower bound is re-read from the stored text, no DB column) with `scaleIngredient`.
- "Restored your unsaved draft" and "Discard draft" on both new-recipe routes, wired to the draft helper (`saveDraft`, `loadDraft`, `clearDraft`, `isDraftWorthKeeping`); "Discard" in the discard dialog calls `clearDraft`; the browser's reload confirmation is dropped.
- "Total time" label for the archive sort (`SORTS` in `src/lib/recipes/query.ts`).
- Removal of the Planned status and the "Not planned yet" prompt from the recipe page; "Add to plan" stays.
- Nav brand link, "Add recipe" and "Search recipes" at every width, and the search field focused on arrival at `/recipes`.
