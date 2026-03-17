# Task: DB-25 — Add product status and publication history tables
Blueprints: Domain H (Catalog Visibility & Publication), Domain B (Data & Environment Enforcement)
Phase: 02 Catalog

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Introduce append-only history tables that record product status and publication
events for auditability, incident response, and compliance.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Add an append-only history model/table (naming suggestion):
  * `ProductStatusHistory`
    * `id` (ULID/UUID)
    * `tenantId`
    * `productId`
    * `fromStatus` (string, FK to ProductStatus.code)
    * `toStatus` (string, FK to ProductStatus.code)
    * `changedAt` timestamp
    * `changedBy` (string user id / actor id; keep generic and contract-aligned)
    * `reasonCode` / `reasonText` (optional)
* Add an append-only publication event model/table (naming suggestion):
  * `ProductPublicationEvent`
    * `id`
    * `tenantId`
    * `productId`
    * `eventType` (string: `published` / `unpublished` / `withdrawn` etc. — keep string-based)
    * `occurredAt`
    * `actorId`
    * optional metadata (e.g. priorPublishedAt)
* Indexes:
  * Support audit lookups by `(tenantId, productId, changedAt/occurredAt)`
  * Support time-window queries for incident investigations
* Ensure history is:
  * Append-only by convention and/or constraints/triggers (optional for later)
  * Preserved across product lifecycle changes

## Acceptance Criteria

* Status and publication history tables/models exist in `schema.prisma`
* Tables include tenant scope, product reference, timestamps, and actor identity fields
* Indexes exist to support common audit queries efficiently
* Prisma validate passes and schema is ready for migration

## Dependencies

* DB-20 — Extend Product model for state and slug
* DB-24 — Add product status lookup table and foreign key

## Estimated Effort

90–120 minutes

