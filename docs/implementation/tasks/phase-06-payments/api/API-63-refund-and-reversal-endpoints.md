# Task: API-63 — Refund + reversal endpoints (explicit, governed)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose explicit endpoints for refunds and reversals (if in scope for Phase 06), enforcing authority rules and additive correction semantics.

This capability is **not part of the MVP** for your current Phase 06 scope.
This task should be treated as **deferred** unless you explicitly decide to include refunds/reversals.

## Implementation Location

* apps/api/src/modules/payments/refunds.controller.ts
* apps/api/src/modules/payments/reversals.controller.ts

## Implementation Notes

* Authority:
  * customers may initiate only where policy permits
  * tenants may request refunds but must not execute fund control
  * platform may orchestrate under explicit policy
* Never delete or “edit” prior payment records.

## Acceptance Criteria

* Refund/reversal endpoints exist behind explicit authorization.
* Requests validated via contracts.
* Outcomes are recorded as additive records.
* If deferred for MVP, no routes are registered.

## Dependencies

* CONTRACTS-64 — Refund and reversal contracts
* DOMAIN-64 — Refund and reversal use cases
* RLS-61/RLS-63 policies

## Estimated Effort

60–120 minutes
