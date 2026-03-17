# Task: ADMINUI10-033 — Governance Action Dialogs + Confirmation Patterns

## Purpose

Implement the standard UX for governance actions (Domain X/Y): explicit, confirmable, auditable.

## Implementation Notes

- Implement `GovernanceActionDialog`:
  - shows scope-of-effect
  - shows required permission
  - supports typed confirmation for high-risk actions
  - shows request outcome + audit reference/correlation id
- Ensure cancel is always available.

## Acceptance Criteria

- Governance actions require explicit confirmation.
- Outcome UI is clear and references audit/correlation.
