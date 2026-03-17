# Task: DOMAIN-94 — Indexing projection jobs + event triggers (eventual consistency)
Blueprint: Domain U (eventual consistency), Domain T (rebuildable), Domain AD (no authoritative dependence)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search + apps/worker

## Purpose

Implement the projection strategy from Postgres source-of-truth into Elasticsearch indexes under eventual consistency.

## Implementation Location

* domains/search/src/projections/indexing.plan.ts
* apps/worker/src/jobs/search/*.ts

## Implementation Notes

* Projection triggers must be explicit:
  * product published/unpublished
  * catalog updates
  * taxonomy changes
* Projection jobs must:
  * be idempotent
  * be tenant-safe
  * never block core operations

## Acceptance Criteria

* Projection plan exists.
* Jobs are retry-safe without creating duplicate documents.

## Dependencies

* ES-90..93
* Phase 08 background job skeleton (RUNTIME-82)

## Estimated Effort

120–240 minutes
