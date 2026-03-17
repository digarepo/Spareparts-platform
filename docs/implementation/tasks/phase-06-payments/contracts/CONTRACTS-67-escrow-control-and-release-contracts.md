# Task: CONTRACTS-67 — Escrow control + release contracts (explicit, per-tenant split)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define explicit contracts for escrow control state and escrow release actions.

Escrow must be modeled per **tenant obligation split**, even though the customer pays once.

## Implementation Location

* packages/contracts/src/payments/escrow.schema.ts

## Implementation Notes

* Model escrow control state:
  * escrow_id (ULID)
  * payment_session_id
  * tenant_id
  * amount_minor + currency
  * control_status (held/in_escrow/released/returned)
  * created_at
* Model release/return commands:
  * explicit action type
  * explicit authority scope
  * reason classification
  * idempotency key

## Acceptance Criteria

* Escrow control state schema exists.
* Release/return request + response schemas exist.
* All identifiers are ULID strings and money uses minor units.

## Dependencies

* CONTRACTS-61 — Payments identifiers and money primitives
* CONTRACTS-66 — Payment session + per-tenant split contracts

## Estimated Effort

60–120 minutes
