# Task: DOMAIN-53 — Implement order governed transitions and terminal outcomes
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

domain

## Package / Area

domains/checkout

## Purpose

Implement order state transitions as explicit, authorized, auditable governed actions.

Ensure failure vs cancellation are unambiguous and recovery does not rewrite history.

## Implementation Location

* domains/checkout/src/order/order.lifecycle.ts
* domains/checkout/src/order/order.service.ts

## Implementation Notes

* Model explicit lifecycle states:
  * created
  * confirmed
  * in_progress
  * completed
  * cancelled
  * failed
* Governed mutation requirements:
  * explicit trigger
  * explicit authority (scope-bound)
  * append-only event record
* Terminal state principle:
  * terminal states are stable and explicit
  * ambiguity is not allowed

## Acceptance Criteria

* Order lifecycle state machine exists
* Illegal transitions are rejected
* Failures and cancellations are distinct
* State changes emit append-only order events

## Dependencies

* DOMAIN-51 — Order commitment model
* CONTRACTS-55 — Order event and audit contracts
* PRISMA-52 — Define order event/audit persistence schema

## Estimated Effort

60–120 minutes
