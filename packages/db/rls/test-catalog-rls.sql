-- Test RLS policies for catalog tables
-- Run with different tenant contexts

-- Test 1: Set tenant context
SET app.current_tenant_id = 'tenant-123';
SET app.current_actor_kind = 'tenant';

-- Test 2: Can only see own products
SELECT 'Test 2a - Own products visible' as test, COUNT(*) as count FROM "Product" WHERE "tenantId" = 'tenant-123';
SELECT 'Test 2b - Other products not visible' as test, COUNT(*) as count FROM "Product" WHERE "tenantId" = 'other-tenant';

-- Test 3: Cannot insert cross-tenant product (should fail)
DO $$
BEGIN
  INSERT INTO "Product" (id, "tenantId", slug, name, status, "createdAt", "updatedAt") 
  VALUES ('test-prod', 'other-tenant', 'test', 'Test', 'draft', NOW(), NOW());
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Test 3 - Cross-tenant insert correctly blocked';
END $$;

-- Test 4: Can insert own product (should succeed)
INSERT INTO "Product" (id, "tenantId", slug, name, status, "createdAt", "updatedAt") 
VALUES ('test-prod-2', 'tenant-123', 'test-2', 'Test 2', 'draft', NOW(), NOW());
SELECT 'Test 4 - Own insert succeeded' as test, COUNT(*) as count FROM "Product" WHERE id = 'test-prod-2';

-- Test 5: Public read for published products
SET app.current_actor_kind = 'public';
SELECT 'Test 5a - Published products visible to public' as test, COUNT(*) as count FROM "Product" WHERE status = 'published';
SELECT 'Test 5b - Draft products not visible to public' as test, COUNT(*) as count FROM "Product" WHERE status = 'draft';

-- Test 6: Platform actor can see all taxonomy
SET app.current_actor_kind = 'platform';
SELECT 'Test 6 - Platform can see all taxonomy' as test, COUNT(*) as count FROM "Taxonomy";

-- Test 7: Tenant can read taxonomy for navigation
SET app.current_actor_kind = 'tenant';
SELECT 'Test 7 - Tenant can read taxonomy for navigation' as test, COUNT(*) as count FROM "Taxonomy";

-- Test 8: Variant RLS - tenant isolation
SELECT 'Test 8a - Own variants visible' as test, COUNT(*) as count FROM "Variant" WHERE "tenantId" = 'tenant-123';
SELECT 'Test 8b - Other variants not visible' as test, COUNT(*) as count FROM "Variant" WHERE "tenantId" = 'other-tenant';

-- Test 9: ProductTaxonomy RLS
SELECT 'Test 9a - Own product taxonomy visible' as test, COUNT(*) as count FROM "ProductTaxonomy" WHERE "tenantId" = 'tenant-123';
SELECT 'Test 9b - Other product taxonomy not visible' as test, COUNT(*) as count FROM "ProductTaxonomy" WHERE "tenantId" = 'other-tenant';

-- Test 10: Audit tables RLS
SELECT 'Test 10a - Own status history visible' as test, COUNT(*) as count FROM "ProductStatusHistory" WHERE "tenantId" = 'tenant-123';
SELECT 'Test 10b - Other status history not visible' as test, COUNT(*) as count FROM "ProductStatusHistory" WHERE "tenantId" = 'other-tenant';

-- Cleanup
DELETE FROM "Product" WHERE id = 'test-prod-2';
RESET app.current_tenant_id;
RESET app.current_actor_kind;
