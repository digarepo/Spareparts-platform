# Task: TEST14-002 — Test Data Fixtures + Seeding

## Purpose

Create repeatable fixtures that reflect real domain constraints without fabricating history.

## Implementation Notes

- Fixtures must be:
  - explicit
  - attributable
  - environment-scoped
- Include tenants, products, inventory states, and a minimal customer identity.

## Acceptance Criteria

- Tests can run from a known baseline.
- Fixtures do not rely on production-only shortcuts.
