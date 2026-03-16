# Task: DOMAIN-66 — Implement payment session splitting + escrow orchestration (MVP)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Implement the core MVP flow you described:
- customer pays **once** (PaymentSession)
- platform internally computes and persists **per-tenant splits**
- funds enter **escrow** and are released per-tenant obligation under explicit policy

## Implementation Location

* domains/payments/src/session/payment-session.aggregate.ts
* domains/payments/src/session/split-payment-session.ts
* domains/payments/src/escrow/escrow-orchestration.usecase.ts

## Implementation Notes

* Split computation:
  * inputs: order lines + pricing snapshots
  * output: deterministic per-tenant amounts
  * invariant: sum(splits) == session total
* Escrow orchestration:
  * record escrow control state per tenant split
  * do not treat escrow as settlement
  * release decisions must be explicit and attributable
* Keep the hard boundary:
  * payment outcomes do not create/cancel orders
  * payment outcomes do not directly allocate inventory

## Acceptance Criteria

* PaymentSession aggregate exists with explicit lifecycle.
* Split computation exists and is deterministic and auditable.
* Escrow control state is modeled per tenant split.

## Dependencies

* DOMAIN-61 — Payment authority + control model
* CONTRACTS-66 — Payment session + splits contracts
* PRISMA-65 — Payment session + splits schema

## Estimated Effort

180–360 minutes
