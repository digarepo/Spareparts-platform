-- Enable RLS on new catalog tables
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Taxonomy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductTaxonomy" ENABLE ROW LEVEL SECURITY;

-- Force RLS on all catalog tables
ALTER TABLE "Product" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Variant" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Taxonomy" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ProductTaxonomy" FORCE ROW LEVEL SECURITY;

-- Product RLS policies
CREATE POLICY "tenant_isolation_product_select" ON "Product"
  FOR SELECT
  USING ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_product_insert" ON "Product"
  FOR INSERT
  WITH CHECK ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_product_update" ON "Product"
  FOR UPDATE
  USING ("tenantId" = app.current_tenant_id())
  WITH CHECK ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_product_delete" ON "Product"
  FOR DELETE
  USING ("tenantId" = app.current_tenant_id());

-- Variant RLS policies
CREATE POLICY "tenant_isolation_variant_select" ON "Variant"
  FOR SELECT
  USING ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_variant_insert" ON "Variant"
  FOR INSERT
  WITH CHECK ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_variant_update" ON "Variant"
  FOR UPDATE
  USING ("tenantId" = app.current_tenant_id())
  WITH CHECK ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_variant_delete" ON "Variant"
  FOR DELETE
  USING ("tenantId" = app.current_tenant_id());

-- Taxonomy RLS policies (platform-owned, tenant-participated)
CREATE POLICY "platform_taxonomy_select" ON "Taxonomy"
  FOR SELECT
  USING (
    app.current_actor_kind() = 'platform' OR
    app.current_tenant_id() IS NOT NULL
  );

CREATE POLICY "platform_taxonomy_mutate" ON "Taxonomy"
  FOR ALL
  USING (app.current_actor_kind() = 'platform')
  WITH CHECK (app.current_actor_kind() = 'platform');

-- ProductTaxonomy RLS policies
CREATE POLICY "tenant_isolation_product_taxonomy_select" ON "ProductTaxonomy"
  FOR SELECT
  USING ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_product_taxonomy_insert" ON "ProductTaxonomy"
  FOR INSERT
  WITH CHECK ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_isolation_product_taxonomy_delete" ON "ProductTaxonomy"
  FOR DELETE
  USING ("tenantId" = app.current_tenant_id());
