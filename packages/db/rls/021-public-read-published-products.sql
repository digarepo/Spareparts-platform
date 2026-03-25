-- Public read policy for published products
CREATE POLICY "public_read_published_products" ON "Product"
  FOR SELECT
  USING (
    status = 'published' AND
    app.current_actor_kind() = 'public'
  );

-- Public read for taxonomy (for navigation)
CREATE POLICY "public_read_taxonomy_navigation" ON "Taxonomy"
  FOR SELECT
  USING (
    app.current_actor_kind() IN ('public', 'tenant')
  );

-- Public read for product-taxonomy associations of published products
CREATE POLICY "public_read_published_product_taxonomy" ON "ProductTaxonomy"
  FOR SELECT
  USING (
    app.current_actor_kind() = 'public' AND
    EXISTS (
      SELECT 1 FROM "Product"
      WHERE "Product".id = "ProductTaxonomy"."productId"
      AND "Product".status = 'published'
    )
  );
