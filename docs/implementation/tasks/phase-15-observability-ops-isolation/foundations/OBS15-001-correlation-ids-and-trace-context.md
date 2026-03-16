# Task: OBS15-001 — Correlation IDs + Trace Context

## Purpose

Establish end-to-end correlation IDs to support diagnosis without affecting behavior (Domain AE non-interference).

## Implementation Notes

- Standardize:
  - incoming request correlation ID
  - propagation across service boundaries
  - surfacing correlation ID in error responses (support-friendly)
- Ensure propagation is consistent across:
  - public APIs
  - tenant/dashboard APIs
  - admin APIs

## Acceptance Criteria

- Correlation IDs are present on critical request paths.
- Missing IDs are generated and propagated.
