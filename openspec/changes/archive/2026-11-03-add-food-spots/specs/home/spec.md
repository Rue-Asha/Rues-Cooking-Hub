## ADDED Requirements

### Requirement: Top spots
`/` SHALL show a "Top spots" section after "Recently added" with the up to four highest-scored Visited spots (score
descending, equal scores by name) as spot cards with their score badge and no rank, and an "All spots" link to
`/eating-out`; it SHALL be hidden when no spot is Visited. The section SHALL carry no `data-tile`, so the bento keeps
exactly its four tiles, and SHALL lay out like "Recently added" (two columns on phone, one row of four on desktop).

#### Scenario: Top spots query returns the four best visited spots
- **WHEN** six Visited spots with scores 9.50, 8.75 "Zeta", 8.75 "beta", 8.10, 7.00, 6.00 and one Want to go spot exist
- **THEN** `topSpots(4)` returns 9.50, "beta", "Zeta", 8.10 in that order, without the Want to go spot
- **proof:** unit

#### Scenario: Home shows Top spots after Recently added
- **WHEN** `/` is opened with two recipes and five Visited spots
- **THEN** a "Top spots" section follows the "Recently added" section, shows four spot cards in score order each with its badge and no rank, has an "All spots" link to `/eating-out`, and the page still has exactly four `[data-tile]` elements
- **proof:** e2e

#### Scenario: Fewer than four visited spots shows what exists
- **WHEN** `/` is opened with two Visited spots and one Want to go spot
- **THEN** "Top spots" shows exactly the two Visited spots
- **proof:** e2e

#### Scenario: No visited spot hides Top spots
- **WHEN** `/` is opened with only Want to go spots
- **THEN** there is no "Top spots" heading and no spot card on the page
- **proof:** e2e

#### Scenario: Top spots row lays out like Recently added
- **WHEN** `/` is opened with four Visited spots at 390×844 and at 1280×800
- **THEN** on phone the cards form two columns of two, on desktop one row of four, the section heading starts at the column's left edge, and the document has no horizontal overflow
- **proof:** e2e

#### Scenario: Top spots look like the approved mockup
- **WHEN** Rue opens Home with Visited spots on phone and desktop
- **THEN** the "Top spots" row matches the approved Eating Out mockup's Home row
- **proof:** manual (visual judgement by Rue at Gate 2)
