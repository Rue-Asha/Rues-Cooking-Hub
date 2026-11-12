## MODIFIED Requirements

### Requirement: Sort
The archive SHALL sort by newest (default), title A–Z (case- and accent-aware) or total time (ascending, recipes
without time last). The control's options SHALL be labelled "Newest first", "Title A–Z" and "Total time".

#### Scenario: Newest first by default
- **WHEN** recipes are listed without a sort
- **THEN** they come newest first
- **proof:** unit

#### Scenario: Sort by title
- **WHEN** "Banana bread", "apple pie" and "Äpfel im Schlafrock" are sorted by title
- **THEN** the order is "Äpfel im Schlafrock", "apple pie", "Banana bread" (Ä sorts as A, case is ignored)
- **proof:** unit

#### Scenario: Sort by total time puts recipes without time last
- **WHEN** recipes with 45, 15 and no minutes are sorted by total time
- **THEN** the order is 15, 45, then the one without time
- **proof:** unit

#### Scenario: Sort choice in the archive
- **WHEN** "Title A–Z" is chosen in the sort control
- **THEN** the cards are in title order and the URL carries `sort=title`
- **proof:** e2e

#### Scenario: Total time label
- **WHEN** the sort control's options are read
- **THEN** they are "Newest first", "Title A–Z" and "Total time", and choosing "Total time" puts `sort=time` in the URL
- **proof:** e2e
