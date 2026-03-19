# Branching Strategy and Workflow

## Goals

- `main` = releaseable, tagged versions (never broken)
- `dev` = integration branch for each completed phase (always stable)
- Feature branches = isolated work per phase (merged to `dev` when complete)

## Branch Model

```
main (release)
 ↑
dev (integration per phase)
 ↑
feat/phase-1-foundations
feat/phase-2-catalog
feat/phase-3-inventory
…
```

## Rules

1. **Never commit directly to `main` or `dev`**
2. **Feature branches are created from `dev`**
3. **Feature branches are merged to `dev` via pull request**
4. **`dev` → `main` is a merge after phase testing and tagging**
5. **Delete feature branches after merge to `dev`**

## Workflow per Phase

### 1. Start a phase

```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create feature branch for the phase
git checkout -b feat/phase-<number>-<short-name>
# Example: feat/phase-1-foundations
```

### 2. Work in the feature branch

- Commit frequently with clean messages
- Push to origin regularly for backup
- Open a draft PR against `dev` for visibility (optional)

```bash
git add .
git commit -m "feat(contracts): add catalog identifiers and entities"
git push origin feat/phase-1-foundations
```

### 3. Complete the phase

- All implementation tasks done
- All tests pass
- Manual verification complete

### 4. Merge to `dev`

**Pull Request (reviewed)**
- Open PR: `feat/phase-1-foundations` → `dev`
- Require review/approval
- Use merge (not squash) on GitHub GUI
- Delete branch after merge

### 5. Tag and release (end of milestone)

```bash
# From dev, after final testing
git checkout dev
git pull origin dev

# Merge to main
git checkout main
git pull origin main
git merge dev --no-ff
git tag -a v0.1.0 -m "Phase 1 Foundations release"
git push origin main --tags
```

## Why This Works

- **Linear `dev`**: Each phase adds one clean merge to `dev`
- **Release safety**: `main` only receives tested `dev` merges
- **Auditability**: One merge per phase on `dev`; one tag per release on `main`
- **Parallelism**: Multiple people can work on different phases, but they merge sequentially to `dev`

## Branch Protections

- `main`: require PR, require status checks, no force push
- `dev`: require PR, require status checks, no force push
- Feature branches: no protections

## CI/CD Integration

- Run tests on all branches
- Require test pass on PR to `dev` and `main`
- Auto-tag releases from `main` merges
- Deploy from `main` tags only
