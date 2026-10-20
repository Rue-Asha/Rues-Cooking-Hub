# Split off: Homelab changes for Rues Cooking Hub (in ~/Repos/Homelab-Managment)

Split from build-cooking-hub at explore, 2026-10-19. Rue runs these in a separate session.
Research: `research-infra.md` (this dir). Ordered runbook: `docs/release.md` in this repo (branch flow/build-cooking-hub until merged).

## 1. check01 registration — chore · live — BEFORE this change's PR
- Add `- repo: Rue-Asha/Rues-Cooking-Hub` to `check_runner_repos` in `ansible/inventory/group_vars/check_runner/vars.yml`.
- Needs the GitHub repo to exist first, with fork-PR approval policy `all_external_contributors` (the check_runner playbook refuses otherwise).
- Then `01_BASE_CONFIGURATION/check_runner.yml` from the workstation (live, needs `gh` admin on the repo).
- Update `docs/check-runner.md` and `openspec/specs/check-runner/spec.md` where they list repos.
- Why: this repo's ci.yml runs PRs on `["self-hosted","homelab-check"]` exactly like Rues-Arcade (Rue's choice: register check01 first rather than temporarily use GitHub runners).

## 2. Service — feature · live — merge only AFTER tag v0.1.0 exists
Names (fixed, used by this repo's release.yml bump job):
- host `rues-cooking-hub01`, group `rues_cooking_hub`, tags `["web","terraform"]`, swap 512
- variable `rues_cooking_hub_version`, pin `v0.1.0`, host_vars path `ansible/inventory/host_vars/rues-cooking-hub01/vars.yml`
- service/user `rues-cooking-hub`, data `/var/lib/rues-cooking-hub/rues-cooking-hub.db`, release dir `/opt/rues-cooking-hub`
- tarball `https://github.com/Rue-Asha/Rues-Cooking-Hub/releases/download/v<ver>/rues-cooking-hub-<ver>.tgz` + `.sha256` (repo public)
Steps:
- `terraform/environments/homelab/hosts.auto.tfvars`: new `lxc_hosts` entry. Free IP to choose (.228/.229 looked unused in the repo; router DHCP range unchecked; `scripts/checks/unique-hosts.py` rejects duplicates). Size: images live as BLOBs in SQLite → between arcade (1c/768MB/6GB) and life-manager (2c/1024MB/10GB); sharp downscaling on upload wants ≥1 GB RAM.
- Role `ansible/roles/rues_cooking_hub/` cloned from `rues_arcade`; env.j2 adds `BODY_SIZE_LIMIT=16M` (photo uploads up to 15 MB; adapter-node default is 512K).
- nginx for this host: `client_max_body_size 16m` (default 1m rejects photos).
- Playbook `ansible/playbooks/02_SERVICES/rues-cooking-hub.yml`: common, nodejs (Node 22), nginx, sqlite_snapshot, rues_cooking_hub.
- host_vars copied from rues-arcade01: version pin, smoke headers, nginx block, `sqlite_backups` (db path ends in `.db`).
- `deploy.yml` workflow_dispatch choice list += `rues-cooking-hub`; README roles table, role README, docs/backups.md.
- Specs: `release-bump` (per-app requirement like Rues-Arcade's), `sqlite-backups` (lists apps).
- Proof: `scripts/proof.sh --all`, `scripts/tests/deploy-targets.sh` (check fixtures).
- ⚠ Live/irreversible: merge triggers plan → `infrastructure` approval → apply (creates LXC) → deploy in the same run. Pre-merge on runner01: `ssh-keygen -F <ip>` must find nothing. After: re-run `00_OPERATIONAL/sqlite_backup.yml` from the workstation so the nightly backup covers the host.
- First release's bump job fails because host_vars didn't exist yet (accepted, R4); later tags bump automatically via `HOMELAB_BUMP_APP_ID`/`KEY` secrets on the app repo.

## Not decided yet (for that session's explore)
- IP and exact cores/RAM/disk; whether a DNS name/HTTPS is wanted later (would enable offline/PWA and Wake Lock — Rue said no for now).
