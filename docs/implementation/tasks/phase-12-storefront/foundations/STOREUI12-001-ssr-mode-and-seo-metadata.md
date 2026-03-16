# Task: STOREUI12-001 — SSR Mode + SEO Metadata

## Purpose

Keep Storefront SSR-enabled for SEO and ensure pages emit correct metadata.

## Implementation Notes

- Ensure React Router SSR remains enabled for `apps/storefront`.
- Add per-route metadata:
  - title
  - description
  - canonical URL (if applicable)
  - OpenGraph basics for share previews
- Ensure product detail pages emit product-specific meta.

## Acceptance Criteria

- Storefront renders via SSR without runtime errors.
- Product pages include stable, correct meta tags.
