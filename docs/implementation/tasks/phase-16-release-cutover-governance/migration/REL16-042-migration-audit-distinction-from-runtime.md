# Task: REL16-042 — Migration Audit Distinction from Runtime

## Purpose

Ensure migration actions are auditable and distinguishable from runtime actions (Domain AG).

## Implementation Notes

- Audit records must:
  - record authority
  - record dataset scope
  - mark action as migration/seeding vs runtime
  - record failures/partial attempts

## Acceptance Criteria

- Migration audit is reconstructable.
- Migration does not fabricate runtime-like history.
