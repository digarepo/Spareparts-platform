# Task: TEST14-022 — IDOR + Scope Boundary Suite

## Purpose

Detect insecure direct object references and cross-scope access bugs.

## Implementation Notes

- Add tests for platform vs tenant vs customer scope boundaries:
  - platform staff cannot act as tenant/customer
  - tenant staff cannot access platform governance
  - customers cannot access tenant internals
- Include representative endpoints from orders, inventory, and payments visibility.

## Acceptance Criteria

- Cross-scope attempts are denied.
- Responses do not leak protected resource existence.
