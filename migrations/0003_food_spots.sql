CREATE TABLE spot_tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE spots (id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  status TEXT NOT NULL CHECK (status IN ('want','visited')),
  score_hundredths INTEGER CHECK (score_hundredths BETWEEN 100 AND 1000),
  price INTEGER CHECK (price BETWEEN 1 AND 4),
  city TEXT, neighbourhood TEXT, address TEXT, website TEXT, notes TEXT,
  image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  search_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  CHECK ((status = 'visited') = (score_hundredths IS NOT NULL)));
CREATE TABLE spot_tag_links (spot_id INTEGER NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES spot_tags(id) ON DELETE CASCADE, PRIMARY KEY (spot_id, tag_id));
CREATE INDEX spots_status ON spots(status);
