# Task: CONTRACTS-04 — Implement shared quantity and unit contracts
Blueprint: Domain K (Inventory Core Model)
Phase: 01 Foundations

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define shared quantity and inventory unit contracts that can be reused across
inventory, availability, and reservation logic without leaking domain-specific behavior.

## Implementation Location

packages/contracts/src/shared/value-objects.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports at least:
  * `QuantitySchema` and `Quantity`
  * `InventoryUnitSchema` and `InventoryUnit`
* Quantity:
  * Non-negative integer
  * No fractional values, no negatives
* InventoryUnit:
  * Tenant-defined unit descriptor (string or structured type) with stable meaning
* Documentation:
  * Module-level JSDoc describing quantity/unit semantics and invariants
  * JSDoc for each schema/type export
* Contracts must not:
  * Encode availability or sellability semantics
  * Depend on specific products, variants, or database entities

## Acceptance Criteria

* `value-objects.schema.ts` exists in `packages/contracts/src/shared/`
* `QuantitySchema` / `Quantity` and `InventoryUnitSchema` / `InventoryUnit` are exported
* Validation enforces non-negative, whole-number quantities and valid units
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-00 — Contracts package structure established

## Estimated Effort

45–60 minutes

