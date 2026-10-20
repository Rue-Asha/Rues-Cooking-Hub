CREATE TABLE images (id INTEGER PRIMARY KEY, mime TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
  bytes BLOB NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE recipes (id INTEGER PRIMARY KEY, title TEXT NOT NULL CHECK (length(trim(title)) > 0), description TEXT,
  source_url TEXT, servings INTEGER NOT NULL DEFAULT 2 CHECK (servings >= 1),
  prep_minutes INTEGER CHECK (prep_minutes >= 0), cook_minutes INTEGER CHECK (cook_minutes >= 0), notes TEXT,
  favourite INTEGER NOT NULL DEFAULT 0, favourited_at TEXT, image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  search_text TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX recipes_source_url ON recipes(source_url);
CREATE TABLE recipe_tags (recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (recipe_id, tag_id));
CREATE TABLE ingredient_lines (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  section INTEGER NOT NULL, section_title TEXT, position INTEGER NOT NULL, text TEXT NOT NULL,
  quantity REAL, unit TEXT, name TEXT NOT NULL, note TEXT);
CREATE TABLE step_lines (id INTEGER PRIMARY KEY, recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  section INTEGER NOT NULL, section_title TEXT, position INTEGER NOT NULL, text TEXT NOT NULL);
-- recipe_id has no ON DELETE action on purpose: deleteRecipe converts the entries first, so a missed conversion
-- fails loudly instead of losing entries; the coalesce()s keep a NULL from passing the CHECK
CREATE TABLE plan_entries (id INTEGER PRIMARY KEY, date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast','lunch','dinner','snacks')), position INTEGER NOT NULL,
  recipe_id INTEGER REFERENCES recipes(id), servings INTEGER, text TEXT,
  CHECK ((recipe_id IS NOT NULL AND coalesce(servings, 0) >= 1 AND text IS NULL)
      OR (recipe_id IS NULL AND servings IS NULL AND coalesce(length(trim(text)), 0) > 0)));
CREATE INDEX plan_entries_day ON plan_entries(date, slot, position);
CREATE TABLE shopping_items (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL,
  manual_amounts TEXT NOT NULL DEFAULT '[]', plan_amounts TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN
  ('produce','dairy-eggs','meat-fish','bakery','pantry','frozen','drinks','household','other')),
  checked INTEGER NOT NULL DEFAULT 0, checked_at TEXT, origin TEXT NOT NULL CHECK (origin IN ('manual','plan')),
  position INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE category_memory (name_key TEXT PRIMARY KEY, category TEXT NOT NULL);
