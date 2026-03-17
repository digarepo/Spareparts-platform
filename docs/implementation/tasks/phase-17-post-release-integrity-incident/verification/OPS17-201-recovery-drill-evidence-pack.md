# Task: OPS17-201 — Recovery Drill Evidence Pack

## Purpose

Run a recovery drill and capture evidence that recovery preserves truth, audit history, and tenant isolation.

## Implementation Notes

- Simulate recovery (tabletop or lower env):
  - restore from backup
  - verify audit preservation
  - verify tenant isolation
  - verify no history rewrite
- Capture evidence artifacts.

## Acceptance Criteria

- Recovery drill is repeatable.
- Evidence pack is stored and reviewable.
