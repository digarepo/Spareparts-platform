-- CreateTable
CREATE TABLE "ProductStatus" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isOrderable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductStatus_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ProductTaxonomyHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taxonomyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'user',
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTaxonomyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStatusHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "changedBy" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'user',
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductTaxonomyHistory_tenantId_productId_idx" ON "ProductTaxonomyHistory"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "ProductTaxonomyHistory_tenantId_taxonomyId_idx" ON "ProductTaxonomyHistory"("tenantId", "taxonomyId");

-- CreateIndex
CREATE INDEX "ProductTaxonomyHistory_tenantId_changedAt_idx" ON "ProductTaxonomyHistory"("tenantId", "changedAt");

-- CreateIndex
CREATE INDEX "ProductStatusHistory_tenantId_productId_idx" ON "ProductStatusHistory"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "ProductStatusHistory_tenantId_changedAt_idx" ON "ProductStatusHistory"("tenantId", "changedAt");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_status_fkey" FOREIGN KEY ("status") REFERENCES "ProductStatus"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStatusHistory" ADD CONSTRAINT "ProductStatusHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
