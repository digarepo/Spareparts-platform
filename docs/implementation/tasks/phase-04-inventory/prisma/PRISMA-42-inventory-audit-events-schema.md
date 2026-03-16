# Task: PRISMA-42 — Define inventory audit / event persistence schema
Blueprint: Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

prisma

## Package / Area

packages/db (Prisma schema)

## Purpose

Persist an append-only, reconstructable history of inventory mutations and reservation events for auditability and governance.

This provides an authoritative record of intent and outcome without rewriting operational history.

## Implementation Location

* packages/db/prisma/schema.prisma (inventory event/audit models)
* packages/db/prisma/migrations/*

## Implementation Notes

* Create an inventory event/audit table that records:
  * `event_id` (ULID)
  * `tenant_id`
  * references (`variant_id`, optional `reservation_id`)
  * `event_type` (finite string enum)
  * `quantity_delta` or `quantity` (depending on event)
  * `occurred_at` timestamp
  * actor attribution fields (as available at this layer; may be `actor_identity_id` and `scope` if modeled)
  * `reason` (for adjustments) where applicable
* Events must be append-only:
  * no updates to past events as part of normal operation

## Acceptance Criteria

* Prisma schema includes an inventory event/audit model/table
* Event table has:
  * primary key `event_id`
  * indexes sufficient for tenant-scoped audit queries (tenant_id, occurred_at)
  * no required cross-tenant joins
* Migration can be generated/applied without errors

## Dependencies

* PRISMA-41 — Define inventory and reservation persistence schema
* CONTRACTS-44 — Inventory snapshot and event contracts (event shape reference)

## Estimated Effort

45–90 minutes
