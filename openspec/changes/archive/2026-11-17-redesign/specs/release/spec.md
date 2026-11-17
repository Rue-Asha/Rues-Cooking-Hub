## RENAMED Requirements

- FROM: `### Requirement: Version 0.3.0`
- TO: `### Requirement: Version 0.4.0`

## MODIFIED Requirements

### Requirement: Version 0.4.0
`package.json` and `package-lock.json` SHALL carry version 0.4.0 (a minor bump for the redesign feature). After the
change is merged, tag `v0.4.0` SHALL be pushed so the release workflow publishes `rues-cooking-hub-0.4.0.tgz` with its
sha256.

#### Scenario: Package and lockfile carry 0.4.0
- **WHEN** `package.json` and `package-lock.json` (root and `packages[""]`) are read
- **THEN** all three versions are "0.4.0"
- **proof:** unit

#### Scenario: Release v0.4.0 published
- **WHEN** tag `v0.4.0` is pushed on the merged `main`
- **THEN** the release workflow passes `check-tag` and a GitHub release v0.4.0 holds `rues-cooking-hub-0.4.0.tgz` and its `.sha256`
- **proof:** manual (runs on GitHub after the ship-time tag push)
