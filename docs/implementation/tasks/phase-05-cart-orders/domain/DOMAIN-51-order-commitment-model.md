# Task: DOMAIN-51 — Implement Order commitment model (order, lines, pricing snapshots)
Blueprint: Domain N (Cart & Order Intent Model), Domain O (Order Lines & Pricing Snapshots)
Phase: 05 Cart & Orders

## Layer

domain

## Package / Area

domains/checkout

## Purpose

Implement the order model as a stable, binding commitment composed of tenant-isolated line items that anchor immutable pricing snapshots and stable catalog references.

## Implementation Location

* domains/checkout/src/order/order.aggregate.ts
* domains/checkout/src/order/order-line.entity.ts
* domains/checkout/src/order/pricing-snapshot.value.ts

## Implementation Notes

* Order identity:
  * stable ULID identity
  * never reused
* Line item isolation:
  * each line is associated with exactly one tenant seller
  * lines from different tenants are logically isolated
* Pricing snapshot:
  * captured at order creation
  * immutable in meaning
  * used to derive totals
* Order must not:
  * imply payment success/failure
  * imply inventory reservation/allocation
  * imply fulfillment progress

## Acceptance Criteria

* Order aggregate exists with stable identity
* OrderLine and PricingSnapshot concepts exist
* Totals derive from snapshots, not live pricing
* No silent mutation of order meaning

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* CONTRACTS-53 — Order, line item, and pricing snapshot contracts

## Estimated Effort

90–180 minutes
