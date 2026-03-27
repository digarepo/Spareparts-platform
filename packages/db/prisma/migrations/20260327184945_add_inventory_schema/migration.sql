-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "catalog_variant_id" TEXT NOT NULL,
    "on_hand_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "allocated_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_sellable" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_threshold" INTEGER,
    "location" JSONB,
    "source" TEXT,
    "unit_cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_allocations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "reversed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_id" TEXT,
    "initiated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_audit_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "reason" TEXT NOT NULL,
    "initiated_by" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_idx" ON "inventory_items"("tenant_id");

-- CreateIndex
CREATE INDEX "inventory_items_catalog_variant_id_idx" ON "inventory_items"("catalog_variant_id");

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_is_active_idx" ON "inventory_items"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_is_sellable_idx" ON "inventory_items"("tenant_id", "is_sellable");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tenant_id_catalog_variant_id_key" ON "inventory_items"("tenant_id", "catalog_variant_id");

-- CreateIndex
CREATE INDEX "inventory_reservations_tenant_id_inventory_id_idx" ON "inventory_reservations"("tenant_id", "inventory_id");

-- CreateIndex
CREATE INDEX "inventory_reservations_expires_at_idx" ON "inventory_reservations"("expires_at");

-- CreateIndex
CREATE INDEX "inventory_reservations_status_idx" ON "inventory_reservations"("status");

-- CreateIndex
CREATE INDEX "inventory_reservations_tenant_id_purpose_idx" ON "inventory_reservations"("tenant_id", "purpose");

-- CreateIndex
CREATE INDEX "inventory_reservations_tenant_id_status_expires_at_idx" ON "inventory_reservations"("tenant_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "inventory_allocations_tenant_id_inventory_id_idx" ON "inventory_allocations"("tenant_id", "inventory_id");

-- CreateIndex
CREATE INDEX "inventory_allocations_reference_id_idx" ON "inventory_allocations"("reference_id");

-- CreateIndex
CREATE INDEX "inventory_allocations_tenant_id_purpose_idx" ON "inventory_allocations"("tenant_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_allocations_tenant_id_inventory_id_reference_id_key" ON "inventory_allocations"("tenant_id", "inventory_id", "reference_id");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_inventory_id_idx" ON "stock_movements"("tenant_id", "inventory_id");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements"("created_at");

-- CreateIndex
CREATE INDEX "stock_movements_movement_type_idx" ON "stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "stock_movements_reference_id_idx" ON "stock_movements"("reference_id");

-- CreateIndex
CREATE INDEX "inventory_audit_events_tenant_id_inventory_id_idx" ON "inventory_audit_events"("tenant_id", "inventory_id");

-- CreateIndex
CREATE INDEX "inventory_audit_events_created_at_idx" ON "inventory_audit_events"("created_at");

-- CreateIndex
CREATE INDEX "inventory_audit_events_event_type_idx" ON "inventory_audit_events"("event_type");

-- CreateIndex
CREATE INDEX "inventory_audit_events_initiated_by_idx" ON "inventory_audit_events"("initiated_by");

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_allocations" ADD CONSTRAINT "inventory_allocations_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_audit_events" ADD CONSTRAINT "inventory_audit_events_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
