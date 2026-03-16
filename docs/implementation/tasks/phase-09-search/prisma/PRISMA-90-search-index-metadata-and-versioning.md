# Task: PRISMA-90 — Search index metadata + versioning tables
Blueprint: Domain V (change control/auditability), Domain T (rebuild rule)
Phase: 09 Search

## Layer

prisma

## Package / Area

packages/db/prisma

## Purpose

Persist authoritative metadata about index versions, mappings, and rebuild state.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Tables should capture:
  * index name
  * version
  * mapping hash
  * created_at
  * active flag
  * last_rebuild_at

## Acceptance Criteria

* Prisma schema includes search index metadata model(s).

## Dependencies

* ES-92

## Estimated Effort

60–120 minutes
