# Task: STOREUI12-060 — Category Browse Route

## Purpose

Provide category browsing as a discovery path and as a fallback when search is degraded.

## Implementation Notes

- Add route module `/categories/:categorySlug`.
- SSR initial category page.
- Include sort + pagination.

## Acceptance Criteria

- Category browse renders with SSR.
- Works when search is unavailable.
