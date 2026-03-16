# Task: PRISMA-66 — Escrow control schema (per-tenant split, explicit resolution)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist escrow control records per tenant split so holds/escrow/release are explicit, auditable, and never indefinite.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `EscrowControl` (or `PaymentEscrow`) model:
  * id (ULID)
  * payment_session_id (FK)
  * tenant_id (ULID)
  * amount_minor
  * currency
  * status (enum)
  * created_at
  * resolved_at (nullable)
  * resolution (enum: released_to_tenant / returned_to_customer / policy_redirect)
  * resolution_reason (string)
* Constraints:
  * unique (payment_session_id, tenant_id) if one escrow record per split

## Acceptance Criteria

* Escrow control table exists.
* Status + resolution fields exist.
* Records are queryable per tenant obligation.

## Dependencies

* PRISMA-65 — Payment session + splits schema

## Estimated Effort

60–120 minutes
