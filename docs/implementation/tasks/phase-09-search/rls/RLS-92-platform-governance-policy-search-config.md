# Task: RLS-92 — Platform governance policy for search config (cross-tenant read/write)
Blueprint: Domain U (platform scope), Domain V (governance authority)
Phase: 09 Search

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow platform-governed staff to manage global search configuration and observe tenant-scoped configuration without collapsing tenant boundaries.

## Implementation Location

* packages/db/rls/search.sql

## Implementation Notes

* Platform governance can:
  * manage global config
  * observe tenant config
  * write audit records
* Must remain read-only for tenant operational data (search is observational).

## Acceptance Criteria

* Platform policies exist and are explicit about scope.

## Dependencies

* RLS-90

## Estimated Effort

45–90 minutes
