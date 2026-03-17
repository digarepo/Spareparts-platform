# Phase 16 — Release Readiness, Cutover & Change Governance

This phase operationalizes the rules that make release and cutover a deliberate, auditable governance act.

Primary blueprints:
- Domain AF — Release Readiness & Launch Governance
- Domain AG — Migration, Cutover & Change Governance

## Principles (authoritative)

- Release is a governed act; deployment is not a release.
- No silent launch; no implicit enablement.
- Every feature has an explicit availability state (enabled/disabled/not present).
- Cutover is explicit and recorded; no dual-write, no shadow authority.
- Seeding/migration never rewrite history or fabricate audits.
- Roll-forward bias; rollback is pre-cutover only.

## MVP-complete (definition for this phase)

- A release readiness checklist and verification artifacts exist and can block release.
- Feature availability registry exists with explicit defaults.
- Cutover plan exists with an auditable cutover declaration.
- Seeding/migration playbooks exist and are auditable.
- Hotfix/patch governance rules are documented and enforceable.

## Task numbering convention

Files in this phase use IDs of the form `REL16-###`.
