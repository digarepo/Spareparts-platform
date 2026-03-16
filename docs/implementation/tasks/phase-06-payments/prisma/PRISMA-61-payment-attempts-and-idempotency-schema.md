# Task: PRISMA-61 — Payment attempts + idempotency schema (replay safe)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist payment attempts and idempotency controls so retries do not create duplicate financial meaning.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `PaymentAttempt` model:
  * id (ULID)
  * payment_id (FK)
  * idempotency_key (string)
  * provider_intent_id / provider_payment_id (string, nullable)
  * status (enum; attempt lifecycle)
  * created_at
* Constraints:
  * unique (payment_id, idempotency_key)
  * unique provider references where applicable
* Ensure attempt records are append-only in meaning:
  * new attempts created instead of mutating past attempts, except for explicit status transitions.

## Acceptance Criteria

* Attempts can be deduped by idempotency key.
* Provider references cannot collide.

## Dependencies

* PRISMA-60 — Payments core schema

## Estimated Effort

60–120 minutes
