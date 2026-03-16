# Task: PRISMA-50 — Define cart and order persistence schema (Phase 5)
Blueprint: Domain N (Cart & Order Intent Model), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

prisma

## Package / Area

packages/db (Prisma schema)

## Purpose

Define the authoritative persistence model for carts (ephemeral intent) and orders (binding commitment), ensuring:
- cart ownership is customer-scoped
- order identity and line items are stable historical facts
- order line items are tenant-isolated and anchor pricing snapshots

## Implementation Location

* packages/db/prisma/schema.prisma
* packages/db/prisma/migrations/*

## Implementation Notes

* Cart persistence:
  * Cart belongs to exactly one customer context.
  * Cart may reference items from multiple tenants, but tenants must not access carts.
  * Cart items store intent snapshots and may become stale.
* Order persistence:
  * Orders have stable identity and must not be reused.
  * Order lines are tenant-isolated: each line includes tenant_id and must not span multiple tenants.
  * Each line anchors an immutable pricing snapshot record.
* Identify which tables are required:
  * carts
  * cart_items
  * orders
  * order_lines
  * pricing_snapshots

## Acceptance Criteria

* Prisma schema includes models/tables for:
  * Cart + CartItem
  * Order + OrderLine
  * PricingSnapshot
* All identifiers are represented as ULID strings
* Constraints exist:
  * line item requires tenant_id
  * pricing snapshot is immutable in meaning (no in-place edits; append-only where applicable)
* Migration can be generated/applied without errors

## Dependencies

* CONTRACTS-51 — Cart/order identifier contracts
* CONTRACTS-53 — Order and pricing snapshot contracts

## Estimated Effort

90–180 minutes
