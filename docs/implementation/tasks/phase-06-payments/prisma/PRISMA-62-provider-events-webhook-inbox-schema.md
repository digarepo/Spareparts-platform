# Task: PRISMA-62 — Provider events + webhook inbox schema (dedupe + audit)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Persist provider events (webhook inbox) as an append-only audit surface to enable:
- signature-verified processing
- deduplication
- replay safety
- post-incident reconstruction

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Add `PaymentProviderEvent` model:
  * id (ULID)
  * provider (string)
  * provider_event_id (string)
  * event_type (string)
  * occurred_at (datetime)
  * received_at (datetime)
  * raw_payload (json)
  * payment_attempt_id (nullable)
  * processing_status (enum: received/processed/failed)
  * processing_error (string nullable)
* Constraints:
  * unique (provider, provider_event_id)

## Acceptance Criteria

* Webhook/provider events are persistable and dedupable.
* Raw payload retained for audit.

## Dependencies

* PRISMA-61 — Payment attempts schema

## Estimated Effort

60–120 minutes
