# Task: PRISMA-91 — Search relevance config: synonyms + weights (governed)
Blueprint: Domain V (governance, change control)
Phase: 09 Search

## Layer

prisma

## Package / Area

packages/db/prisma

## Purpose

Store governed search configuration that influences relevance (synonyms/weights) with auditability and tenant-safe scoping.

## Implementation Location

* packages/db/prisma/schema.prisma

## Implementation Notes

* Config must be:
  * explicit
  * auditable
  * change-controlled
* Must not enable tenant manipulation of global ranking.

## Acceptance Criteria

* Prisma models exist for synonyms and relevance weight config.

## Dependencies

* Domain V

## Estimated Effort

60–120 minutes
