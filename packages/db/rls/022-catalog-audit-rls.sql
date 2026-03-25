-- Enable RLS on audit tables
ALTER TABLE "ProductStatus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductTaxonomyHistory" ENABLE ROW LEVEL SECURITY;

-- ProductStatus policies (platform-owned)
CREATE POLICY "platform_product_status_select" ON "ProductStatus"
  FOR SELECT
  USING (app.current_actor_kind() IN ('platform', 'tenant'));

-- ProductStatusHistory policies
CREATE POLICY "tenant_product_status_history_select" ON "ProductStatusHistory"
  FOR SELECT
  USING ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_product_status_history_insert" ON "ProductStatusHistory"
  FOR INSERT
  WITH CHECK ("tenantId" = app.current_tenant_id());

-- ProductTaxonomyHistory policies
CREATE POLICY "tenant_product_taxonomy_history_select" ON "ProductTaxonomyHistory"
  FOR SELECT
  USING ("tenantId" = app.current_tenant_id());

CREATE POLICY "tenant_product_taxonomy_history_insert" ON "ProductTaxonomyHistory"
  FOR INSERT
  WITH CHECK ("tenantId" = app.current_tenant_id());
