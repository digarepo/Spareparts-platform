# Task: PRISMA-65 — Payment session + per-tenant split schema (single charge, internal isolation)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist a customer-facing payment session (single charge) and an internal per-tenant split that preserves tenant obligation isolation.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `PaymentSession` model:
  * id (ULID)
  * order_id (ULID)
  * customer_id (ULID)
  * currency
  * total_amount_minor
  * status
  * provider
  * provider_session_reference (nullable)
  * created_at/updated_at
* Add `PaymentSessionSplit` model:
  * id (ULID)
  * payment_session_id (FK)
  * tenant_id (ULID)
  * amount_minor
  * currency
  * created_at
* Constraints:
  * one session has many splits
  * unique (payment_session_id, tenant_id) if each tenant appears once

## Acceptance Criteria

* Prisma models exist with required indexes.
* Split records are queryable per tenant.

## Dependencies

* PRISMA-60 — Payments core schema

## Estimated Effort

60–120 minutes
