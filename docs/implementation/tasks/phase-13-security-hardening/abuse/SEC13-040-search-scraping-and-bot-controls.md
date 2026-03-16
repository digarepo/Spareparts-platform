# Task: SEC13-040 — Search Scraping + Bot Controls

## Purpose

Protect availability of discovery/search surfaces without changing search semantics (Domain AC; search remains non-authoritative).

## Implementation Notes

- Add rate limits for:
  - `/search` queries
  - suggestion endpoints
- Add basic bot mitigations:
  - request shaping
  - user-agent heuristics (non-authoritative)
  - captcha challenge only where explicitly approved

## Acceptance Criteria

- Search endpoints resist scraping bursts.
- Rejections are explicit; no partial responses that imply authority.
