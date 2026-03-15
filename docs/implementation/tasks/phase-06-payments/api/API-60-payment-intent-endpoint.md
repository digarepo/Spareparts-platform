# Task: API-60 — Payment intent endpoint (idempotent, obligation-scoped)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose a safe endpoint to initiate a payment intent/attempt for a specific tenant obligation within an order.

This must be:
- customer-authority initiated
- idempotent under retries
- explicit in scope (order + tenant obligation)

## Implementation Location

* apps/api/src/modules/payments/payments.controller.ts
* apps/api/src/modules/payments/payments.service.ts

## Implementation Notes

* Validate request using contracts.
* Enforce customer scope and ownership of the referenced order.
* Idempotency:
  * require client-provided idempotency key header or request field
  * return the same payment attempt if the key was previously used
* Do not imply order success/failure.

## Acceptance Criteria

* Endpoint exists (e.g., POST /payments/intents).
* Request and response validated via contracts.
* Idempotency key prevents duplicate attempts.

## Dependencies

* CONTRACTS-62 — Payment intent and attempt contracts
* DOMAIN-62 — Provider port + idempotent intent creation
* RLS-62 — Customer payment access policies

## Estimated Effort

60–120 minutes
