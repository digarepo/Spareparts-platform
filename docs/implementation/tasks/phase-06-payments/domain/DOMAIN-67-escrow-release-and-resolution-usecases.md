# Task: DOMAIN-67 — Implement escrow release/return use cases (explicit authority, per-tenant)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Implement explicit escrow resolution flows:
- release funds to the tenant
- return funds to the customer

These must:
- validate explicit authority per action
- be idempotent under retries
- operate per tenant obligation split
- be append-only/auditable in meaning

## Implementation Location

* domains/payments/src/escrow/release-escrow.usecase.ts
* domains/payments/src/escrow/return-escrow.usecase.ts

## Implementation Notes

* Tenant must not directly release funds.
* Platform orchestrates escrow resolution under explicit policy.
* Ensure all control records resolve (no indefinite escrow).

## Acceptance Criteria

* Release and return use cases exist.
* Authority checks are explicit and deny-by-default.
* Idempotency supported per escrow resolution command.

## Dependencies

* DOMAIN-61 — Payment authority + control model
* CONTRACTS-67 — Escrow control + release contracts
* PRISMA-66 — Escrow control schema

## Estimated Effort

120–240 minutes
