# Task: PRISMA-64 — Payments migrations + constraint verification
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Generate and verify migrations for the payments schema, validating uniqueness constraints, indexes, and referential integrity.

## Implementation Location

* packages/db/prisma/migrations

## Implementation Notes

* Generate migration(s) after PRISMA-60..63 are implemented.
* Verify unique constraints:
  * (provider, provider_event_id)
  * (payment_id, idempotency_key)
* Verify indexes for tenant-scoped queries.

## Acceptance Criteria

* Migration(s) generated and applied.
* Constraints verified in database.

## Dependencies

* PRISMA-60
* PRISMA-61
* PRISMA-62
* PRISMA-63

## Estimated Effort

45–90 minutes
