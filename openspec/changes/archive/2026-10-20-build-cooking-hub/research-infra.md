# Research: Homelab deploy path (explorer, 2026-10-19)

Source: /home/Rue/Repos/Homelab-Managment (local main was 18 commits behind origin/main; pattern unchanged).

## Constraints the app must meet
- SvelteKit adapter-node, Node 22, `node:sqlite` or better-sqlite3.
- Serves `/healthz`; applies migrations on start, exits non-zero if one fails. Migrations additive (rollback restores code, not data).
- Env: `HOST=127.0.0.1`, `PORT=3000`, `NODE_ENV=production`, `DATABASE_PATH=/var/lib/<svc>/<svc>.db`, `PROTOCOL_HEADER=x-forwarded-proto`.
- systemd hardened: `ProtectSystem=strict`, only `ReadWritePaths=<data dir>` (/var/lib/<svc>) is writable → uploaded/imported images must live under the data dir (or in the DB).
- Backups (`sqlite_backups`) cover `.db` files only; each path must end in `.db`.
- Release: `release.yml` publishes `cooking-hub-X.Y.Z.tgz` + `.sha256`, one top-level dir with `build/` + `node_modules/`; repo must be public. `bump` job calls `Rue-Asha/ci/.github/workflows/bump-pin.yml`, needs secrets `HOMELAB_BUMP_APP_ID`, `HOMELAB_BUMP_APP_KEY`; host_vars pin must exist on main before first bump.
- Networking: nginx on the LXC, :80 → 127.0.0.1:3000, plain HTTP, no DNS name, no TLS. LAN-only; off-LAN via tailscale01 subnet router (IP-only, no MagicDNS).
  - Consequence: `http://192.168.0.x` is not a secure context → no service worker (offline PWA), no Wake Lock API, no `navigator.clipboard` in the browser. TLS/DNS would be new homelab scope.

## Homelab-side steps (separate change in Homelab-Managment, live)
1. `cooking-hub01` entry in `terraform/environments/homelab/hosts.auto.tfvars` (`lxc_hosts` map): free IP (.228/.229 look unused, router DHCP range unchecked), `groups = ["cooking_hub"]`, `tags = ["web","terraform"]`, swap 512; arcade 1c/768MB/6GB, life-manager 2c/1024MB/10GB.
2. Role `ansible/roles/cooking_hub/` cloned from `rues_arcade` (user, directories, fetch, config, release, service, verify, prune; env.j2, service.j2).
3. Playbook `ansible/playbooks/02_SERVICES/cooking-hub.yml` (common, nodejs, nginx, sqlite_snapshot, cooking_hub).
4. `ansible/inventory/host_vars/cooking-hub01/vars.yml` copied from rues-arcade01 (version pin, smoke headers, nginx block, sqlite_backups).
5. `deploy.yml` dispatch choice list += `cooking-hub`; README roles table, role README, docs/backups.md, docs/check-runner.md.
6. Specs: release-bump (per-app requirement), sqlite-backups (names apps), check-runner (if repo added to check01).
7. Proof: `scripts/proof.sh --all`, `scripts/tests/deploy-targets.sh` (fixtures may need a new service).

## Irreversible / manual
- ⚠ `apply` waits for approval in the `infrastructure` environment; creating/destroying the LXC is hard to reverse.
- First deploy needs the release tag to exist before the homelab merge (same run creates + deploys).
- Pre-merge: `ssh-keygen -F <ip>` on runner01 must find nothing.
- After: re-run `00_OPERATIONAL/sqlite_backup.yml` from the workstation (nightly backup), optionally `check_runner_repos` + `check_runner.yml`.
- Unrelated active branch `flow/check01-arcade-cleanup` touches no shared files.
