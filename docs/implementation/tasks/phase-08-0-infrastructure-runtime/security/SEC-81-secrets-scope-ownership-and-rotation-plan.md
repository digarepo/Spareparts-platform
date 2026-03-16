# Task: SEC-81 — Secrets scope/ownership + rotation plan
Blueprint: Domain AE (secrets as capabilities), Domain B (env isolation)
Phase: 08 Infrastructure & Runtime

## Layer

security

## Package / Area

infrastructure

## Purpose

Define a secrets inventory with explicit scope/ownership, and a rotation/revocation plan that does not change domain semantics.

## Implementation Location

* docs/ops/secrets-inventory.md
* docs/ops/secrets-rotation.md

## Implementation Notes

* No shared secrets across environments.
* Secrets are technical capabilities, not authority.
* Each secret has single purpose and lifecycle.

## Acceptance Criteria

* Inventory lists all secrets (DB, Redis, JWT, payment webhooks, object storage).
* Rotation steps are documented and auditable.

## Dependencies

* Domain AE

## Estimated Effort

60–120 minutes
