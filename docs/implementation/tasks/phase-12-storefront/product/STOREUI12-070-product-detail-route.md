# Task: STOREUI12-070 — Product Detail Route (PDP)

## Purpose

Implement SEO-friendly product detail pages with safe cart interactions.

## Implementation Notes

- Add route module `/products/:productId`.
- SSR product data + metadata.
- Support:
  - variant selection (if modeled)
  - quantity
  - add to cart
- Do not guarantee inventory from derived signals.

## Acceptance Criteria

- PDP renders with SSR.
- Add to cart works for guests.
