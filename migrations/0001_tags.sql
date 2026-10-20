CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
INSERT INTO tags (name, name_key) VALUES ('Breakfast','breakfast'),('Main Course','main course'),('Side','side'),
  ('Dessert','dessert'),('Snack','snack'),('Soup','soup'),('Salad','salad'),('Baking','baking');
