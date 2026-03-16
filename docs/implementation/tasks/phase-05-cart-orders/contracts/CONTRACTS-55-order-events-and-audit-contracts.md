# Task: CONTRACTS-55 — Implement order event and audit contracts
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide a grouped contract surface for order lifecycle events and governed mutations so order history remains append-only, reconstructable, and unambiguous (failure vs cancellation vs completion).

## Implementation Location

packages/contracts/src/checkout/order-events.schema.ts

## Implementation Notes

* Export:
  * `OrderEventTypeSchema` (finite set)
  * `OrderEventSchema` / `OrderEvent`
* Events must include:
  * event_id
  * order_id
  * occurred_at
  * actor attribution fields where applicable
  * event type and reason classification
* Do not rewrite order history; events are append-only.
* Documentation:
  * Module-level JSDoc describing governed order mutations.

## Acceptance Criteria

* `order-events.schema.ts` exists and exports event contracts
* Event types are finite and aligned to:
  * order created
  * order failed
  * order cancelled
  * order transitioned
* JSDoc is present and consistent
* No imports from apps/infrastructure/ORM

## Dependencies

* CONTRACTS-51 — Cart/order identifier contracts
* CONTRACTS-53 — Order contracts

## Estimated Effort

45–90 minutes
