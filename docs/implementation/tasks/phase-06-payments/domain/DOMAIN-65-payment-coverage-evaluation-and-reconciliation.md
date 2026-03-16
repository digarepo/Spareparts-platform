# Task: DOMAIN-65 — Implement payment coverage evaluation + order reconciliation boundaries
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics), Domain Q (Payment Core Model & Meaning)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Implement explicit coverage evaluation per tenant obligation and define the reconciliation boundary between payment facts and order state.

This must respect the hard boundary:
- payment state does not rewrite order meaning
- order remains the source of obligation truth

## Implementation Location

* domains/payments/src/coverage/evaluate-coverage.ts
* domains/payments/src/reconciliation/order-reconciliation.port.ts

## Implementation Notes

* Coverage evaluation:
  * compute covered amount from settled payments minus refunds/reversals
  * evaluate status per tenant obligation (insufficient/partial/complete)
  * persist or emit a coverage evaluation event (implementation choice)
* Reconciliation boundary:
  * define a port for notifying the order domain/application layer of financial facts
  * avoid direct “mark order paid” mutation inside payments domain unless explicitly modeled as a separate, governed action in the application layer
* Multi-tenant:
  * payment coverage completeness must not collapse across tenants

## Acceptance Criteria

* Coverage evaluation exists and is explicit (not inferred).
* Reconciliation is performed via a port/interface.
* Multi-tenant obligation evaluation is supported.

## Dependencies

* CONTRACTS-65 — Coverage evaluation contracts
* DOMAIN-60 — Payment aggregate

## Estimated Effort

120–240 minutes
