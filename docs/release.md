# Release

## Cutting a release

1. Bump `version` in `package.json` and in `package-lock.json` (root and `packages[""]`) in the change itself:
   feature → minor, fix or tweak → patch.
2. Merge to `main`. The push run of `ci.yml` runs the gate on `ubuntu-24.04`, builds the tarball once and uploads it as
   the `release-tarball` artifact.
3. Tag the merge commit and push only that tag:

       git fetch
       git tag -a v<version> <merge-sha> -m "v<version>"
       git push origin v<version>

4. `release.yml` runs: `check-tag` (tag equals `v` + `package.json` version, the `ci` push run on that commit passed,
   its artifact has not expired), `publish` (the tested tarball and its `.sha256` as a GitHub release with provenance
   attestation, no rebuild), `bump` (opens the pin PR in Homelab-Managment, see its `docs/release-bump.md`).

The artifact expires after 90 days. If `check-tag` says it is missing or expired, rerun the `ci` push run
(`gh run rerun <run-id>`) and push the tag again (delete and re-push the tag only after Rue's go).

## Ship runbook for v0.1.0

Every step leaves the machine, so each is marked ⚠ and happens only on Rue's go, one at a time, in this order. Repo
`Rue-Asha/Rues-Cooking-Hub`, local checkout `~/Repos/Rues-Cooking-Hub`, feature branch `flow/build-cooking-hub`.

### 1. ⚠ Create the public repo and push the bootstrap `main` (done 2026-10-19)

Already done on 2026-10-19: repo created public, bootstrap `main` pushed, approval policy set. Skip to step 2; the
commands stay here for rebuilding the repo.

The repo must be public (the Homelab fetches the release tarball without credentials). Local `main` holds exactly one
empty commit (`chore: bootstrap`), the feature branch is built on top of it, so the PR compares cleanly.

    gh repo create Rue-Asha/Rues-Cooking-Hub --public --source ~/Repos/Rues-Cooking-Hub --remote origin
    git -C ~/Repos/Rues-Cooking-Hub push -u origin main

Then Settings → Actions → General → "Fork pull request workflows from outside collaborators" → "Require approval for all
external contributors" (the check runner playbook refuses to register a repo without it), or, sending the policy as a
JSON body (`-f` does not apply it; the policy stays `first_time_contributors`):

    echo '{"approval_policy":"all_external_contributors"}' | gh api -X PUT repos/Rue-Asha/Rues-Cooking-Hub/actions/permissions/fork-pr-contributor-approval --input -

### 2. ⚠ Homelab-Managment: register the repo on check01 (before the PR)

PR checks run on `["self-hosted","homelab-check"]`; without a runner for this repo the PR's `ci` job queues forever.
In a Homelab-Managment chore (own branch and PR there, see `docs/check-runner.md` → Add a repo):

1. Append to `check_runner_repos` in `ansible/inventory/group_vars/check_runner/vars.yml`:

       - repo: Rue-Asha/Rues-Cooking-Hub

2. Mention the repo in `docs/check-runner.md` (list in the intro) and merge the chore.
3. From the workstation, with `gh` logged in as admin on the new repo:

       ansible-playbook ansible/playbooks/01_BASE_CONFIGURATION/check_runner.yml

   Settings → Actions → Runners of the new repo shows `check01-<slug>` idle with the label `homelab-check`.

### 3. ⚠ Bump secrets

The App is the existing one from `docs/release-bump.md`; the repo needs its id and a private key:

    gh secret set HOMELAB_BUMP_APP_ID --repo Rue-Asha/Rues-Cooking-Hub
    gh secret set HOMELAB_BUMP_APP_KEY --repo Rue-Asha/Rues-Cooking-Hub < path/to/app-private-key.pem

Without them the `bump` job fails (it also fails on the first release, see step 6).

### 4. ⚠ The `main` ruleset (Life-Manager shape)

Apply after the bootstrap push: with required checks in place a direct push to `main` is refused. No pull-request rule;
deletion and non-fast-forward blocked; the four checks required, strict. Write `ruleset.json` outside the repo:

```json
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "ci / ci", "integration_id": 15368 },
          { "context": "security-baseline / workflow-lint", "integration_id": 15368 },
          { "context": "security-baseline / secret-scan", "integration_id": 15368 },
          { "context": "security-baseline / dependency-review", "integration_id": 15368 }
        ]
      }
    }
  ]
}
```

    gh api -X POST repos/Rue-Asha/Rues-Cooking-Hub/rulesets --input ruleset.json

It is Life-Manager's ruleset (`gh api repos/Rue-Asha/Life-Manager/rulesets/24460686`) as it stands.

### 5. ⚠ Push the branch, open the PR, merge

    git push -u origin flow/build-cooking-hub
    gh pr create --base main --head flow/build-cooking-hub
    gh pr checks <n> --watch
    gh pr merge <n> --merge

`ci / ci` and the three `security-baseline` jobs must be green first. Merge with a merge commit (no squash), without
`--delete-branch`. The merge starts the `ci` push run on `ubuntu-24.04`; wait for it to finish before tagging.

### 6. ⚠ Tag v0.1.0

    git fetch
    git tag -a v0.1.0 <merge-sha> -m "v0.1.0"
    git push origin v0.1.0
    gh run list --workflow release.yml --branch v0.1.0
    gh run watch <run-id>

Expected: `check-tag` and `publish` green, the release holds `rues-cooking-hub-0.1.0.tgz` and its `.sha256`. The `bump`
job is expected red: `ansible/inventory/host_vars/rues-cooking-hub01/vars.yml` does not exist on Homelab `main` yet
(`bump-pin: <file>: file not found`). That is accepted; the next tag bumps normally once step 7 has merged.

### 7. ⚠ Homelab-Managment: the service, after the tag

A separate live change in Homelab-Managment (Terraform apply waits for the `infrastructure` approval; creating the LXC
is hard to reverse). Names: host `rues-cooking-hub01`, variable `rues_cooking_hub_version`, data
`/var/lib/rues-cooking-hub/rues-cooking-hub.db`, tarball `rues-cooking-hub-X.Y.Z.tgz`. Clone everything from Rues-Arcade:

1. `lxc_hosts` entry `rues-cooking-hub01` in `terraform/environments/homelab/hosts.auto.tfvars` (free IP, group
   `rues_cooking_hub`).
2. Role `ansible/roles/rues_cooking_hub/` cloned from `rues_arcade`; its env template also sets `BODY_SIZE_LIMIT=16M`
   (recipe photos upload up to that size), next to `PROTOCOL_HEADER=x-forwarded-proto`.
3. Playbook `ansible/playbooks/02_SERVICES/rues-cooking-hub.yml` (common, nodejs, nginx, sqlite_snapshot, role) and the
   mapping in `scripts/deploy-targets.sh`.
4. `ansible/inventory/host_vars/rues-cooking-hub01/vars.yml`: `rues_cooking_hub_version: v0.1.0`, smoke headers,
   nginx block, and

       nginx_client_max_body_size: 16m

       sqlite_backups:
         service: rues-cooking-hub
         unit: rues-cooking-hub.service
         owner: rues-cooking-hub
         group: rues-cooking-hub
         mode: "0640"
         release_link: /opt/rues-cooking-hub/current
         healthz_url: http://127.0.0.1/healthz
         databases:
           - /var/lib/rues-cooking-hub/rues-cooking-hub.db

5. `rues-cooking-hub` as an option of the `deploy.yml` dispatch choice list; README roles table, `docs/backups.md`
   and the per-app lines of `docs/release-bump.md`.
6. Proof there (`scripts/proof.sh --all`), PR, merge; the merge deploys through `deploy.yml`.
7. After the first deploy, register the new database for the nightly backup, by hand from the workstation
   (see `docs/backups.md` → Applying the node role):

       scripts/fetch-inventory.sh
       ansible-playbook ansible/playbooks/00_OPERATIONAL/sqlite_backup.yml --check
       ansible-playbook ansible/playbooks/00_OPERATIONAL/sqlite_backup.yml
