# Task: DOMAIN-42 — Implement reservation lifecycle and reservation/release logic
Blueprint: Domain L (Inventory Availability & Reservation)
Phase: 04 Inventory

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Implement reservation semantics as an explicit, revocable claim against available inventory.

This task ensures reservation is correctly separated from allocation and does not imply fulfillment or payment success.

## Implementation Location

* domains/inventory/src/reservation.entity.ts (or equivalent)
* domains/inventory/src/inventory.service.ts (or equivalent domain service)

## Implementation Notes

* Reservation creation must:
  * reference tenant_id + variant_id
  * validate quantity is positive integer
  * reduce available quantity (by increasing reserved)
  * produce stable reservation identity (ULID)
  * be safe under concurrency (domain must be designed to support transactional enforcement)
* Reservation release must:
  * be explicit
  * increase availability (by decreasing reserved)
  * record release reason/state where appropriate
* Expiration:
  * If your persistence model includes expires_at, define the domain behavior for expiration as a governed release.

## Acceptance Criteria

* Reservation entity and lifecycle exist
* Domain methods exist for:
  * create reservation
  * release reservation
* Reservation cannot exceed available quantity
* Reservation logic does not mutate on-hand directly

## Dependencies

* DOMAIN-41 — Inventory aggregate semantics and invariants
* PRISMA-41 — Define inventory and reservation persistence schema
* CONTRACTS-43 — Inventory reservation contracts

## Estimated Effort

60–120 minutes
