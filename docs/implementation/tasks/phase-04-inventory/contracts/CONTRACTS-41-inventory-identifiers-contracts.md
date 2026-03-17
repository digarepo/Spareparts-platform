# Task: CONTRACTS-41 — Implement inventory identifier contracts
Blueprint: Domain K (Inventory Core Model)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define stable, opaque identifier contracts required by inventory workflows (inventory records, reservations, and inventory events), using ULID strings.

These contracts must be usable consistently across applications, domains, and infrastructure without leaking persistence details.

## Implementation Location

packages/contracts/src/inventory/inventory-identifiers.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `InventoryIdSchema` and `InventoryId` (ULID string)
  * `InventoryReservationIdSchema` and `InventoryReservationId` (ULID string)
  * `InventoryEventIdSchema` and `InventoryEventId` (ULID string)
* Validation:
  * Validate canonical ULID strings via the same shared ULID pattern/helper used in Phase 01 catalog identifiers.
* Documentation:
  * Add module-level JSDoc describing each identifier and where it is used.
  * Add JSDoc per schema/type export.
* Identifier semantics:
  * Identifiers must be opaque and must not encode business meaning.
* Contracts must not:
  * Depend on framework, database, or application types.

## Acceptance Criteria

* `inventory-identifiers.schema.ts` exists in `packages/contracts/src/inventory/`
* All identifier schemas/types are exported and validate ULID strings
* Invalid identifiers are rejected by validation
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-00 — Contracts package structure established
* CONTRACTS-40 — Establish inventory contracts structure (Phase 4)
* CONTRACTS-01 — Catalog identifier contracts (for ULID validation conventions)

## Estimated Effort

30–45 minutes
