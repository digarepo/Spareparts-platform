# Task: DOMAIN-02 — Implement inventory quantity and reservation logic
Blueprints: Domain K (Inventory Core Model), Domain L (Availability & Reservation)
Phase: 01 Foundations

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Provide core inventory functions for calculating sellable quantity and handling
reservations in a way that respects inventory, availability, and reservation
semantics from the blueprints.

## Implementation Location

domains/inventory/functions/

## Implementation Notes

* Implement pure domain functions such as:
  * `calculateSellableQuantity(...)`
  * `calculateReservationImpact(...)` or similar
* Functions should:
  * Accept inputs shaped by inventory and quantity contracts
  * Return values that represent on-hand, available, and sellable quantities
* Logic must:
  * Never allow quantities to go negative
  * Distinguish between on-hand, available, and sellable state
  * Treat reservations as temporary, revocable claims
* Do not:
  * Touch persistence, HTTP, or external services in these functions
  * Encode order, payment, or catalog meaning

## Acceptance Criteria

* One or more inventory quantity/reservation functions exist in `domains/inventory/functions/`
* TypeScript types are enforced and rely on contracts for shapes where appropriate
* Unit tests (or at least clear examples) cover:
  * Non-negative quantity invariants
  * Separation of on-hand, available, and sellable quantities
  * Reservation adjustments

## Dependencies

* DOMAIN-01 — Implement inventory domain module
* CONTRACTS-04 — Shared quantity and unit contracts

## Estimated Effort

60–90 minutes

