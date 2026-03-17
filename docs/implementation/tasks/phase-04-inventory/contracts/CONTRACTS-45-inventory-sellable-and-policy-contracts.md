# Task: CONTRACTS-45 — Implement inventory sellability and policy contracts
Blueprint: Domain L (Inventory Availability & Reservation)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define contracts for representing and governing **sellability** decisions for inventory.

Sellability is explicitly distinct from on-hand/available quantities and must not be implicitly inferred from them at the API boundary.

## Implementation Location

packages/contracts/src/inventory/inventory-sellability.schema.ts
packages/contracts/src/inventory/index.ts

## Implementation Notes

* Implement a grouped module exporting:
  * `InventorySellabilitySchema` / `InventorySellability` (read model)
  * `SetInventorySellabilityRequestSchema` / `SetInventorySellabilityRequest`
  * `SetInventorySellabilityResponseSchema` / `SetInventorySellabilityResponse`
* Identifiers:
  * `variant_id` must validate via catalog `VariantId` ULID contract.
* Input validation:
  * request explicitly sets `sellable: boolean`
  * include `reason` for governance/audit alignment
* Documentation:
  * Module-level JSDoc describing sellability semantics and non-implications.
  * JSDoc per schema/type export.
* Update `packages/contracts/src/inventory/index.ts` to export this module.

## Acceptance Criteria

* `inventory-sellability.schema.ts` exists and exports the sellability read + mutation contracts
* Contracts do not infer sellable from quantity fields
* JSDoc is present and consistent
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (VariantId)
* CONTRACTS-44 — Inventory snapshot and event contracts (integration into snapshot if desired)

## Estimated Effort

30–60 minutes
