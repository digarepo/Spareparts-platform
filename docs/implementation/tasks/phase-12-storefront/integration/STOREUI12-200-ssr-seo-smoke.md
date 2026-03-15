# Task: STOREUI12-200 — SSR + SEO Smoke

## Purpose

Verify SSR output and SEO metadata on key storefront routes.

## Implementation Notes

- Verify SSR renders:
  - `/`
  - `/search?q=...`
  - `/products/:productId`
  - `/categories/:categorySlug`
- Verify meta tags:
  - title/description
  - canonical where applicable
  - OG tags basics

## Acceptance Criteria

- SSR HTML contains expected primary content.
- Metadata is present and correct per route.
