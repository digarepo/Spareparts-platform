# Task: TENANTUI11-050 — Products List

## Purpose

Allow tenant staff to view and manage tenant-owned products.

## Implementation Notes

- Add route module `/products`.
- Render a filterable products table:
  - search (name/sku)
  - status (active/draft/archived)
- Columns:
  - name
  - sku
  - status
  - price
  - updated at
- Row click goes to product detail.

## Acceptance Criteria

- Products list renders and is permission-gated.
- No cross-tenant data is visible.
