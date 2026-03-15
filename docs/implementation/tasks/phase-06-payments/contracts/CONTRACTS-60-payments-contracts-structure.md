# Task: CONTRACTS-60 — Payments contracts structure (money-safe, provider-agnostic)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Establish a coherent, grouped-module contracts structure for Payments that enforces:
- ULID identifiers
- safe money representation (minor units)
- explicit state/role modeling
- provider-agnostic payload shapes
- append-only event/audit semantics

## Implementation Location

* packages/contracts/src/payments/

## Implementation Notes

* Group contracts by semantic concept, not endpoint:
  * identifiers + money primitives
  * payment intent/attempt
  * provider webhooks + provider event envelope
  * refund + reversal
  * coverage evaluation per tenant obligation
* Keep payment semantics independent of Orders and Inventory meaning:
  * payments must not create, cancel, or redefine orders
  * holds/escrow must not be treated as payment success

## Acceptance Criteria

* New grouped modules are planned and named consistently with Phases 01–03 style.
* Contracts enforce ULID strings and money in minor units.
* Each module includes production-grade JSDoc per established conventions.

## Dependencies

* None

## Estimated Effort

30–60 minutes
