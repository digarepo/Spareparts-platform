# Task: DOMAIN-61 — Implement payment authority + control model (hold/escrow/release)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Model financial authority and control concepts as first-class domain logic:
- explicit authority per action
- explicit hold and escrow semantics
- explicit resolution/release

This must remain protective and must not become business logic that rewrites order meaning.

## Implementation Location

* domains/payments/src/authority/payment-authority.ts
* domains/payments/src/control/hold.ts
* domains/payments/src/control/escrow.ts
* domains/payments/src/control/release.ts

## Implementation Notes

* Authority must be explicit and scope-validated for every action:
  * customer initiates payment attempt
  * tenant may observe (and maybe request a refund)
  * platform orchestrates under explicit policy
* Control vs state is a hard boundary:
  * holds/escrow must not be treated as settlement
  * release must be deliberate and auditable
* Ensure all holds/escrow resolve (no indefinite control).

## Acceptance Criteria

* Domain types exist for authority scopes and actions.
* Hold/Escrow/Release semantics exist as explicit models.
* Invalid or implied authority is rejected.

## Dependencies

* DOMAIN-60 — Payment aggregate + invariants

## Estimated Effort

90–180 minutes
