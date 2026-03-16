# Task: CONTRACTS-43 — Implement inventory reservation contracts
Blueprint: Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Provide grouped request/response contracts for **inventory reservations**, explicitly modeling the difference between:
- on-hand vs available quantities
- reservation (revocable claim) vs allocation (committed assignment)

Contracts must support safe API boundary validation without embedding business authorization rules.

## Implementation Location

packages/contracts/src/inventory/inventory-reservations.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports request/response schemas and types for:
  * Create reservation
  * Release reservation
* Use ULID identifiers:
  * `variant_id` uses catalog `VariantId` ULID contract.
  * `reservation_id` uses inventory reservation ULID contract.
* Input validation requirements:
  * Reservation quantity must be a positive integer.
  * Release must reference a reservation id.
* Reservation semantics notes:
  * Do not model allocation here.
  * Do not derive payment/order meaning.
* Documentation:
  * Module-level JSDoc describing reservation semantics.
  * JSDoc per schema/type export.

## Acceptance Criteria

* `inventory-reservations.schema.ts` exists in `packages/contracts/src/inventory/`
* Exports include:
  * `CreateReservationRequestSchema` / `CreateReservationRequest`
  * `CreateReservationResponseSchema` / `CreateReservationResponse`
  * `ReleaseReservationRequestSchema` / `ReleaseReservationRequest`
  * `ReleaseReservationResponseSchema` / `ReleaseReservationResponse`
* Create request validates:
  * `variant_id` (ULID)
  * `quantity` (positive integer)
* Release request validates:
  * `reservation_id` (ULID)
* Responses provide stable identifiers and resulting quantity snapshot sufficient for API usage
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (VariantId)
* CONTRACTS-41 — Inventory identifier contracts
* CONTRACTS-40 — Establish inventory contracts structure (Phase 4)

## Estimated Effort

45–75 minutes
