# Task: REL16-062 — Pre-cutover Rollback Boundaries

## Purpose

Define rollback semantics: permitted only pre-cutover and never rewriting history (Domain AG).

## Implementation Notes

- Rollback may:
  - restore code/config state
- Rollback must not:
  - erase audits
  - rewrite business history

## Acceptance Criteria

- Rollback policy is explicit and scoped.
- Post-cutover rollbacks are disallowed as a safety strategy.
