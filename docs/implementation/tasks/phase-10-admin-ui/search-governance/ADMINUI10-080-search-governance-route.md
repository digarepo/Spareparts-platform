# Task: ADMINUI10-080 — Search Governance Route

## Purpose

Provide platform admins a surface for search governance configuration and index health.

## Implementation Notes

- Add route module `/search-governance`.
- Sections:
  - search health summary (read-only)
  - synonyms/weights configuration (governance actions)
  - reindex operations (high-risk governance action)
- Reindex must:
  - require typed confirmation
  - show explicit scope (which index/version)
  - show audit reference/correlation id

## Acceptance Criteria

- Search governance features render with correct gating.
- Reindex is explicit and auditable.
