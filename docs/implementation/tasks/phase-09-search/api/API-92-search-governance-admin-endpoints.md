# Task: API-92 — Search governance admin endpoints (synonyms/weights/index lifecycle)
Blueprint: Domain V (governance authority + change control)
Phase: 09 Search

## Layer

api

## Package / Area

apps/api/src/modules/search-admin

## Purpose

Provide platform-governed endpoints to manage search behavior (synonyms, weights, index lifecycle) with full audit logging.

## Implementation Location

* apps/api/src/modules/search-admin/search-admin.controller.ts
* apps/api/src/modules/search-admin/search-admin.service.ts

## Implementation Notes

* Endpoints (platform scope only):
  * POST /admin/search/synonyms
  * POST /admin/search/weights
  * POST /admin/search/reindex
  * GET /admin/search/index-status
* All changes must write to the search audit log.

## Acceptance Criteria

* Only platform governance scope can access these endpoints.
* All changes produce immutable audit entries.

## Dependencies

* PRISMA-91/92
* RLS-92

## Estimated Effort

90–180 minutes
