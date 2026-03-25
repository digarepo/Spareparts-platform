-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTaxonomy" (
    "productId" TEXT NOT NULL,
    "taxonomyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTaxonomy_pkey" PRIMARY KEY ("productId","taxonomyId")
);

-- CreateIndex
CREATE INDEX "Product_tenantId_status_idx" ON "Product"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Product_tenantId_slug_idx" ON "Product"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Product_tenantId_publishedAt_idx" ON "Product"("tenantId", "publishedAt");

-- CreateIndex
CREATE INDEX "Variant_tenantId_sku_idx" ON "Variant"("tenantId", "sku");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

-- CreateIndex
CREATE INDEX "Taxonomy_parentId_idx" ON "Taxonomy"("parentId");

-- CreateIndex
CREATE INDEX "Taxonomy_sortOrder_idx" ON "Taxonomy"("sortOrder");

-- CreateIndex
CREATE INDEX "ProductTaxonomy_tenantId_productId_idx" ON "ProductTaxonomy"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "ProductTaxonomy_tenantId_taxonomyId_idx" ON "ProductTaxonomy"("tenantId", "taxonomyId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxonomy" ADD CONSTRAINT "Taxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTaxonomy" ADD CONSTRAINT "ProductTaxonomy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTaxonomy" ADD CONSTRAINT "ProductTaxonomy_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
