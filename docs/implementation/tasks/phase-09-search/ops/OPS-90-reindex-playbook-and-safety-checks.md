# Task: OPS-90 — Reindex playbook + safety checks
Blueprint: Domain T (rebuild rule), Domain V (change control), Domain U (safety-first)
Phase: 09 Search

## Layer

ops

## Package / Area

docs/ops

## Purpose

Define a safe, repeatable reindex process that preserves tenant isolation and does not impact core platform operations.

## Implementation Location

* docs/ops/search-reindex-playbook.md

## Implementation Notes

* Must include:
  * index versioning strategy
  * alias swap plan
  * backfill job behavior
  * verification steps (no cross-tenant leakage)
  * rollback plan

## Acceptance Criteria

* Playbook exists and is auditable.

## Dependencies

* PRISMA-90
* ES-92/93

## Estimated Effort

60–120 minutes
