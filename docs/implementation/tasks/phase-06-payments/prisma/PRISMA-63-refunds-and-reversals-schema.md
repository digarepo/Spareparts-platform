# Task: PRISMA-63 — Refunds + reversals schema (additive corrections)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist refunds and reversals as explicit, additive financial records that never delete or rewrite prior outcomes.

This capability is **not part of the MVP** for your current Phase 06 scope.
This task exists to keep the eventual schema blueprint-compliant when you introduce refunds/reversals later.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `PaymentRefund` model:
  * id (ULID)
  * payment_id (FK)
  * amount_minor
  * currency
  * reason
  * provider_reference (nullable)
  * created_at
* Add `PaymentReversal` model:
  * id (ULID)
  * payment_id (FK)
  * amount_minor
  * currency
  * reason
  * created_at
* Constraints:
  * refunds must reference a settled payment (enforced in domain/service layer)

## Acceptance Criteria

* Refund and reversal tables exist.
* Records are append-only and queryable for net outcome.
* If deferred for MVP, no application code depends on these tables yet.

## Dependencies

* PRISMA-60 — Payments core schema

## Estimated Effort

60–120 minutes
