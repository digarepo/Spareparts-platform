# Task: REL16-040 — Seeding Scope + Audit

## Purpose

Operationalize seeding semantics (Domain AG): establish baseline state without creating business history.

## Implementation Notes

- Seeding may create:
  - platform configuration
  - initial platform staff identities/roles scaffolding
  - reference data required by domain rules
- Seeding must not create:
  - tenant business data
  - orders/payments/inventory state
  - customer history
- All seeding actions must be authorized and auditable.

## Acceptance Criteria

- Seeding scope is explicit.
- Seed actions are attributable and auditable.
