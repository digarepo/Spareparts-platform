# Task: PRISMA-60 — Payments core schema (per-tenant obligation, money-safe)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Create the core Payments persistence model such that:
- every payment references exactly one order obligation (tenant-scoped)
- identity is stable (ULID strings)
- money is stored in minor units + currency
- records are append-only in meaning (no history rewrite)

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Introduce a `Payment` model that includes:
  * id (ULID string)
  * order_id (ULID string)
  * tenant_id (ULID string) — obligation scope
  * customer_id (ULID string) where applicable
  * currency (string)
  * amount_minor (int/bigint)
  * status (enum; see Domain Q closed-set semantics)
  * provider (string enum or string)
  * created_at / updated_at
* Enforce referential stability:
  * forbid order_id/tenant_id reassignment after creation (use application constraints + avoid update APIs)
* Multi-tenant financial isolation:
  * tenant_id required
  * indexes for (tenant_id, order_id)

## Acceptance Criteria

* Payment model exists and passes Prisma validation.
* Amounts are stored as integer minor units.
* Payment always has explicit tenant obligation scope.

## Dependencies

* Existing order schema from Phase 05 (order ids and tenant isolation)

## Estimated Effort

60–120 minutes
