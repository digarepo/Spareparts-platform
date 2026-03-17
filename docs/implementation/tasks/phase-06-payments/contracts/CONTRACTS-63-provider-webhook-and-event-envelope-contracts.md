# Task: CONTRACTS-63 — Provider webhook + provider event envelope contracts (replay-safe)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define contracts for receiving provider webhooks in a way that supports:
- signature verification
- deduplication / replay safety
- explicit mapping to internal payment attempts
- append-only provider event recording

## Implementation Location

* packages/contracts/src/payments/provider-webhook.schema.ts
* packages/contracts/src/payments/provider-event.schema.ts

## Implementation Notes

* Webhook payload should be modeled as:
  * provider name
  * provider event id (string)
  * event type
  * event created timestamp
  * raw payload (as unknown/json) if needed for audit
  * mapped internal PaymentAttemptId / PaymentId when known
* Contract must support webhook processing without trusting caller identity.

## Acceptance Criteria

* Webhook envelope schema exists and is provider-agnostic.
* Provider event schema is append-only oriented and includes dedupe keys.

## Dependencies

* CONTRACTS-61

## Estimated Effort

60–120 minutes
