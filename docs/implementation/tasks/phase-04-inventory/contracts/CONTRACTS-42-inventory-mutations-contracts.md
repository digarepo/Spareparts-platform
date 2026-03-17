# Task: CONTRACTS-42 — Implement inventory mutation contracts (stock adjustments)
Blueprint: Domain K (Inventory Core Model), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide a grouped, inventory-scoped contract surface for **stock adjustment** operations.

These contracts make mutation intent explicit (what changed and why) without embedding authorization rules or persistence concerns.

## Implementation Location

packages/contracts/src/inventory/inventory-mutations.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports request/response schemas and types for:
  * Stock adjustment request
  * Stock adjustment response (resulting inventory snapshot and/or event reference)
* Use ULID identifiers:
  * `variant_id` must validate as the catalog `VariantId` ULID contract.
  * Any mutation/event identifiers must validate as inventory ULIDs.
* Input validation requirements:
  * Quantity must be an integer.
  * Quantity must be non-zero for an adjustment.
  * Include a `reason` field (string or constrained enum) to satisfy governance/audit intent.
* Do not define authorization here.
* Documentation:
  * Module-level JSDoc describing mutation semantics: operational, tenant-scoped, governed.
  * JSDoc per schema/type export.

## Acceptance Criteria

* `inventory-mutations.schema.ts` exists in `packages/contracts/src/inventory/`
* Exports include:
  * `StockAdjustmentRequestSchema` / `StockAdjustmentRequest`
  * `StockAdjustmentResponseSchema` / `StockAdjustmentResponse`
* Request schema validates:
  * `variant_id` (ULID)
  * `quantity` (integer, non-zero)
  * `reason` (non-empty)
* Response schema includes at minimum:
  * a stable reference to the affected inventory record and resulting quantities
  * optional event identifier(s) for auditability
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (VariantId)
* CONTRACTS-41 — Inventory identifier contracts
* CONTRACTS-40 — Establish inventory contracts structure (Phase 4)

## Estimated Effort

45–75 minutes
