# Task: CONTRACTS-53 — Implement order, line item, and pricing snapshot contracts
Blueprint: Domain N (Cart & Order Intent Model), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define stable contracts for orders as binding commitments, composed of tenant-isolated line items that anchor immutable pricing snapshots and immutable catalog references.

## Implementation Location

packages/contracts/src/checkout/order.schema.ts
packages/contracts/src/checkout/pricing-snapshot.schema.ts

## Implementation Notes

* `pricing-snapshot.schema.ts` must export:
  * `PricingSnapshotSchema` / `PricingSnapshot`
  * Snapshot must be immutable in meaning once stored.
  * Snapshot must represent tenant-defined price terms as-of order creation.
* `order.schema.ts` must export:
  * `OrderLineSchema` / `OrderLine`
  * `OrderSchema` / `Order`
* Line item rules:
  * Each line references exactly one tenant seller (`tenant_id`) and one catalog reference (`product_id`/`variant_id`).
  * Quantity is in inventory units (whole integer) and must not change silently.
  * Each line anchors exactly one pricing snapshot.
* Do not embed:
  * live pricing
  * inventory state
  * payment status
  * fulfillment status
* Documentation:
  * Module-level JSDoc for order meaning and immutability.
  * JSDoc per schema/type export.

## Acceptance Criteria

* `pricing-snapshot.schema.ts` exists and exports snapshot contracts
* `order.schema.ts` exists and exports `Order` and `OrderLine` contracts
* Contracts enforce:
  * ULID identifiers for all references
  * whole, non-negative quantities (zero not permitted for line items)
  * line-level tenant isolation (tenant_id required per line)
* JSDoc is present and consistent
* No imports from apps/infrastructure/ORM

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts
* CONTRACTS-05 — Tenant context contracts (if tenant_id contract exists)
* CONTRACTS-51 — Cart/order identifier contracts

## Estimated Effort

60–120 minutes
