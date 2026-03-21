-- Insert test data for RLS testing

-- First create tenants (no RLS on Tenant table)
INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt") VALUES
  ('tenant-123', 'Test Tenant 1', NOW(), NOW()),
  ('other-tenant', 'Test Tenant 2', NOW(), NOW());

-- Create product statuses (no RLS on ProductStatus table)
INSERT INTO "ProductStatus" (code, label, "isPublic", "isOrderable", "createdAt", "updatedAt") VALUES
  ('draft', 'Draft', false, false, NOW(), NOW()),
  ('published', 'Published', true, true, NOW(), NOW()),
  ('inactive', 'Inactive', false, false, NOW(), NOW());

SET app.current_tenant_id = 'tenant-123';
SET app.current_actor_kind = 'tenant';

-- Insert test products
INSERT INTO "Product" (id, "tenantId", slug, name, status, "createdAt", "updatedAt") VALUES
  ('prod-1', 'tenant-123', 'product-1', 'Product 1', 'published', NOW(), NOW()),
  ('prod-2', 'tenant-123', 'product-2', 'Product 2', 'draft', NOW(), NOW()),
  ('prod-3', 'other-tenant', 'product-3', 'Product 3', 'published', NOW(), NOW());

-- Insert test variants
INSERT INTO "Variant" (id, "productId", "tenantId", sku, name, "createdAt", "updatedAt") VALUES
  ('var-1', 'prod-1', 'tenant-123', 'SKU-001', 'Variant 1', NOW(), NOW()),
  ('var-2', 'prod-2', 'tenant-123', 'SKU-002', 'Variant 2', NOW(), NOW()),
  ('var-3', 'prod-3', 'other-tenant', 'SKU-003', 'Variant 3', NOW(), NOW());

-- Insert test taxonomy (check if exists first)
SET app.current_actor_kind = 'platform';
INSERT INTO "Taxonomy" (id, label, "sortOrder", "createdAt", "updatedAt") VALUES
  ('cat-1', 'Electronics', 1, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO "Taxonomy" (id, label, "sortOrder", "createdAt", "updatedAt") VALUES
  ('cat-2', 'Clothing', 2, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO "Taxonomy" (id, label, "sortOrder", "createdAt", "updatedAt") VALUES
  ('cat-3', 'Books', 3, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

-- Insert product taxonomy assignments
SET app.current_actor_kind = 'tenant';
INSERT INTO "ProductTaxonomy" ("productId", "taxonomyId", "tenantId", "createdAt") VALUES
  ('prod-1', 'cat-1', 'tenant-123', NOW()),
  ('prod-2', 'cat-2', 'tenant-123', NOW()),
  ('prod-3', 'cat-3', 'other-tenant', NOW());

-- Insert status history
INSERT INTO "ProductStatusHistory" (id, "productId", "tenantId", "previousStatus", "newStatus", "changedBy", "changedAt") VALUES
  ('hist-1', 'prod-1', 'tenant-123', 'draft', 'published', 'user-1', NOW()),
  ('hist-2', 'prod-2', 'tenant-123', NULL, 'draft', 'user-1', NOW()),
  ('hist-3', 'prod-3', 'other-tenant', 'draft', 'published', 'user-2', NOW());

RESET app.current_tenant_id;
RESET app.current_actor_kind;
