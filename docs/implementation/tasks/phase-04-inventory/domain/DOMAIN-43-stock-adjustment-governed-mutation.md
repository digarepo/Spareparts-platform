# Task: DOMAIN-43 — Implement stock adjustment as a governed mutation
Blueprint: Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Implement stock adjustments as explicit, attributable, governed actions that mutate inventory quantities safely and produce an auditable record.

Adjustments must degrade availability rather than correctness under failure.

## Implementation Location

* domains/inventory/src/inventory.service.ts
* domains/inventory/src/events/* (if used)

## Implementation Notes

* Adjustment rules:
  * quantity delta must be integer and non-zero
  * resulting on-hand must not be negative
  * if reducing on-hand would violate reserved+allocated <= on_hand, the adjustment must be rejected or require explicit resolution semantics
* Governance:
  * require explicit reason
  * support idempotency to avoid duplicate adjustments on retries
* Do not infer payment/order/fulfillment state.

## Acceptance Criteria

* Domain method exists to adjust stock with explicit reason
* Invariants remain enforced
* Adjustment produces an inventory event/audit record in domain output

## Dependencies

* DOMAIN-41 — Inventory aggregate semantics and invariants
* CONTRACTS-42 — Inventory mutation contracts
* PRISMA-42 — Define inventory audit / event persistence schema

## Estimated Effort

60–120 minutes
