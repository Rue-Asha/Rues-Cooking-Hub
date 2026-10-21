## ADDED Requirements

### Requirement: Ingredient line parser
`parseIngredient(text)` SHALL turn each typed or imported line into quantity · unit · name, plus an optional trailing
note, and SHALL always keep the original text. Quantities SHALL handle integers, decimals with a point or a comma (`1,5` → 1.5), fractions
(`1/2`, `1 1/2`, `½`, `1½`) and ranges (`2-3`, `2–3`: the upper bound is the quantity, the text keeps the range).
Units SHALL be recognised from the unit table in design.md (also attached, `200g`) and stored canonically (`tablespoons`
→ `tbsp`); a word that is not a known unit belongs to the name. A line without a leading quantity, or one the parser
cannot read, SHALL have no quantity and no unit, and the whole line (without a trailing note) as its name.

#### Scenario: Integer quantity with unit
- **WHEN** `2 tbsp olive oil` is parsed
- **THEN** quantity is 2, unit `tbsp`, name `olive oil`, text `2 tbsp olive oil`
- **proof:** unit

#### Scenario: Decimal quantity
- **WHEN** `0.5 l milk` is parsed
- **THEN** quantity is 0.5, unit `l`, name `milk`
- **proof:** unit

#### Scenario: Comma decimal
- **WHEN** `1,5 l Milch` is parsed
- **THEN** quantity is 1.5, unit `l`, name `Milch`
- **proof:** unit

#### Scenario: Mixed and unicode fractions
- **WHEN** `1 1/2 cups flour`, `½ tsp salt` and `1½ cups sugar` are parsed
- **THEN** the quantities are 1.5, 0.5 and 1.5, the units `cup`, `tsp`, `cup`
- **proof:** unit

#### Scenario: Range uses the upper bound
- **WHEN** `2-3 cloves garlic` is parsed
- **THEN** quantity is 3, unit `clove`, name `garlic`, and text stays `2-3 cloves garlic`
- **proof:** unit

#### Scenario: Attached unit
- **WHEN** `200g butter` is parsed
- **THEN** quantity is 200, unit `g`, name `butter`
- **proof:** unit

#### Scenario: Trailing note is split off
- **WHEN** `100 g butter, softened` is parsed
- **THEN** name is `butter` and note `softened`
- **proof:** unit

#### Scenario: Count without unit
- **WHEN** `3 eggs` is parsed
- **THEN** quantity is 3, unit null, name `eggs`
- **proof:** unit

#### Scenario: Line without quantity
- **WHEN** `salt to taste` is parsed
- **THEN** quantity and unit are null and name is `salt to taste`
- **proof:** unit

#### Scenario: Unparseable line becomes the name
- **WHEN** `a handful of fresh herbs` and `/2 ½ ?` are parsed
- **THEN** each has quantity and unit null and the whole line as its name
- **proof:** unit

### Requirement: Live parse preview
The recipe form SHALL show, under each ingredient line, its parse (quantity · unit · name) and update it while typing.

#### Scenario: Parse preview updates while typing
- **WHEN** `200g` and then ` butter, softened` are typed into an ingredient line
- **THEN** the preview first shows quantity 200 and unit g, and then quantity 200 · g · butter with the note softened
- **proof:** e2e
