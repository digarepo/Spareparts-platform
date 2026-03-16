# Task: PRISMA-92 — Search governance audit log schema
Blueprint: Domain V (auditability)
Phase: 09 Search

## Layer

prisma

## Package / Area

packages/db/prisma

## Purpose

Create an immutable audit log for changes to search relevance/ranking rules, synonyms, and index lifecycle events.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Audit records must include:
  * actor_id
  * scope
  * change type
  * before/after references
  * timestamp

## Acceptance Criteria

* Audit log schema exists.

## Dependencies

* PRISMA-91

## Estimated Effort

45–90 minutes
