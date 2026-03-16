# Task: ADMINUI10-121 — Governance Action + Audit Smoke

## Purpose

Validate that governance actions produce audit-visible outcomes.

## Implementation Notes

- Execute at least one governance action (e.g. policy update or search synonyms update).
- Verify:
  - confirmation dialog
  - outcome + correlation id displayed
  - audit event appears in audit explorer and detail

## Acceptance Criteria

- Governance action is explicitly confirmed and recorded.
- Audit explorer shows the recorded action.
