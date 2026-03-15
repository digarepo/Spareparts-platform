# Task: CONTRACTS-44 — Implement inventory snapshot and event contracts
Blueprint: Domain K (Inventory Core Model), Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define reusable contracts for:
- inventory quantity snapshots (on-hand / reserved / allocated / available / sellable)
- inventory governed events (append-only audit/event envelope)

These contracts are used by API responses and internal adapters, but must not become a source of truth beyond the authoritative domain/database.

## Implementation Location

packages/contracts/src/inventory/inventory-readmodels.schema.ts
packages/contracts/src/inventory/inventory-events.schema.ts
packages/contracts/src/inventory/index.ts

## Implementation Notes

* Prefer grouped modules:
  * `inventory-readmodels.schema.ts` for snapshot/query shapes.
  * `inventory-events.schema.ts` for event envelope + event types.
* Snapshot semantics:
  * Include fields that allow consumers to distinguish on-hand vs available.
  * Available is derived from the domain rules; the contract just represents the values.
* Event semantics:
  * Events must be append-only and reconstructable.
  * Include event id, event type, references (tenant_id if present in contract conventions, variant_id, reservation_id), quantities, and timestamps.
  * Do not embed authorization or mutate state.
* Identifiers:
  * Use ULID contracts for event/reservation ids.
  * Use catalog `VariantId` for variant references.
* `index.ts`:
  * Re-export the public inventory contracts surface (mutations, reservations, identifiers, readmodels, events) for ergonomic imports.

## Acceptance Criteria

* `inventory-readmodels.schema.ts` exists and exports:
  * `InventorySnapshotSchema` / `InventorySnapshot`
* `inventory-events.schema.ts` exists and exports:
  * `InventoryEventSchema` / `InventoryEvent`
  * `InventoryEventTypeSchema` (or equivalent) with a finite set of event types
* Snapshot includes at minimum:
  * `variant_id`
  * `on_hand`
  * `reserved`
  * `allocated`
  * `available`
  * `sellable` (boolean) or an explicit field representing sellability decision output
* Events include at minimum:
  * `event_id`
  * `event_type`
  * `variant_id`
  * `quantity` (where applicable)
  * `occurred_at` timestamp
* `packages/contracts/src/inventory/index.ts` exports the above modules
* JSDoc is present and consistent with contracts documentation standards
* No imports from applications, infrastructure, or ORM entities

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (VariantId)
* CONTRACTS-41 — Inventory identifier contracts
* CONTRACTS-42 — Inventory mutation contracts
* CONTRACTS-43 — Inventory reservation contracts

## Estimated Effort

60–90 minutes
