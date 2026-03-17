# Task: CONTRACTS-46 — Implement inventory allocation contracts
Blueprint: Domain L (Inventory Availability & Reservation)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define contracts for **inventory allocation**, explicitly separate from reservations.

Allocation represents a committed assignment of inventory for downstream execution (e.g. fulfillment), and must be modeled as an explicit operation.

## Implementation Location

packages/contracts/src/inventory/inventory-allocations.schema.ts
packages/contracts/src/inventory/index.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports request/response schemas and types for:
  * Allocate inventory
  * Release allocation
* Identifiers:
  * `variant_id` must validate via catalog `VariantId` ULID contract.
  * Allocation operations may include an optional `reference_id` (ULID string) to correlate with downstream processes.
* Validation:
  * Allocate quantity must be a positive integer.
  * Release quantity must be a positive integer.
* Semantics:
  * Allocation reduces availability by increasing allocated quantity.
  * Allocation must not mutate on-hand directly.
* Documentation:
  * Module-level JSDoc explaining allocation vs reservation.
  * JSDoc per schema/type export.
* Update `packages/contracts/src/inventory/index.ts` to export this module.

## Acceptance Criteria

* `inventory-allocations.schema.ts` exists and exports:
  * `AllocateInventoryRequestSchema` / `AllocateInventoryRequest`
  * `AllocateInventoryResponseSchema` / `AllocateInventoryResponse`
  * `ReleaseAllocationRequestSchema` / `ReleaseAllocationRequest`
  * `ReleaseAllocationResponseSchema` / `ReleaseAllocationResponse`
* Validation enforces ULID identifiers and positive integer quantities
* Contracts do not conflate allocation with reservation
* JSDoc is present and consistent
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (VariantId)
* CONTRACTS-44 — Inventory snapshot and event contracts

## Estimated Effort

45–75 minutes
