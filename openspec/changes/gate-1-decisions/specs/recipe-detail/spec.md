## ADDED Requirements

### Requirement: Servings scaling on the recipe page
The recipe page SHALL offer a servings control labelled "Scale to servings" (group "Scale recipe"), starting at the recipe's servings, with "Scale down" and "Scale up" (one serving each) and, while the value differs from the recipe's servings, "Reset to N servings". Values SHALL be whole numbers of at least 1; anything else SHALL NOT be applied and SHALL show "Servings must be at least 1". Scaling SHALL be a view only: it multiplies each ingredient line's quantity by chosen servings divided by the recipe's servings, shows "for N" with the chosen servings and updates without reload, stores nothing, resets on reload, and does not change the "Add to plan" default. A scaled line SHALL read quantity (at most two decimals, trailing zeros dropped), unit, name and note; a line without readable quantity SHALL stay unchanged; at the recipe's own servings every line SHALL show its original text. Steps, notes and times SHALL NOT be scaled.

#### Scenario: Scaling a line doubles its quantity
- **WHEN** the line "200 g flour" of a 2-serving recipe is scaled to 4 servings
- **THEN** it reads "400 g flour"
- **proof:** unit

#### Scenario: Scaling rounds to two decimals
- **WHEN** "1 cup milk" of a 3-serving recipe is scaled to 1 serving
- **THEN** it reads "0.33 cup milk"
- **proof:** unit

#### Scenario: Lines without quantity and the recipe's own servings stay unchanged
- **WHEN** "salt to taste" is scaled to 6 servings, and "200 g flour" is scaled to the recipe's own servings
- **THEN** both return their original text
- **proof:** unit

#### Scenario: Invalid scale target leaves the line unchanged
- **WHEN** "200 g flour" is scaled to 0 or a non-whole target
- **THEN** it returns its original text
- **proof:** unit

#### Scenario: Scale control updates the ingredients
- **WHEN** "Scale up" is pressed twice on a 2-serving recipe with "200 g flour"
- **THEN** the ingredients heading reads "for 4", the line reads "400 g flour" and "Reset to 2 servings" is shown; reloading shows the original text and "for 2"
- **proof:** e2e

#### Scenario: Invalid scale value is rejected
- **WHEN** 0 is entered in "Scale to servings"
- **THEN** "Servings must be at least 1" is shown and the ingredients stay as before
- **proof:** e2e

### Requirement: No planned status on the recipe page
The recipe page SHALL NOT show whether or when the recipe is planned; the only route to the plan from the page is "Add to plan".

#### Scenario: Planned recipe shows no planned status
- **WHEN** a recipe planned for tomorrow's Dinner is opened
- **THEN** neither "Planned" nor "Not planned yet" nor "Pick a day" is shown, and "Add to plan" is
- **proof:** e2e
