# Task: DOMAIN-64 — Implement refunds + reversals use cases (additive corrections)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Implement explicit refunds and reversals as additive financial actions that correct financial position without rewriting history.

This capability is **not part of the MVP** for your current Phase 06 scope.
This task should be treated as **deferred** unless you explicitly decide to include refunds/reversals.

## Implementation Location

* domains/payments/src/refunds/create-refund.usecase.ts
* domains/payments/src/reversals/create-reversal.usecase.ts

## Implementation Notes

* Refund:
  * allowed only after a settled payment
  * references the original payment
  * does not erase original payment record
* Reversal:
  * compensates a prior recorded outcome
  * always additive
* Both flows must:
  * enforce explicit authority
  * record reason classification
  * integrate provider actions through a provider port (if in scope)

## Acceptance Criteria

* Refund and reversal use cases exist.
* Attempts to refund unsettled payments are rejected.
* History is preserved; net outcome is reconstructable.
* If deferred for MVP, the use cases are not invoked by any API routes.

## Dependencies

* PRISMA-63 — Refunds and reversals schema
* CONTRACTS-64 — Refund and reversal contracts

## Estimated Effort

120–240 minutes
