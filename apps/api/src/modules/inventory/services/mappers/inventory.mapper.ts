import { Injectable } from '@nestjs/common';
import type { InventoryItem } from '@prisma/client';
import type {
  InventorySnapshot,
  InventoryQuantityBreakdown
} from '@spareparts/contracts';

/**
 * Mapper for transforming inventory entities to DTOs.
 *
 * @remarks
 * - Converts Prisma entities to contract types
 * - Ensures API responses don't leak database internals
 * - Handles data transformation and formatting
 */
@Injectable()
export class InventoryMapper {
  /**
   * Maps Prisma inventory item to inventory snapshot.
   *
   * @param inventory - Prisma inventory entity
   * @returns Inventory snapshot contract
   */
  toSnapshot(inventory: InventoryItem): InventorySnapshot {
    const quantities: InventoryQuantityBreakdown = {
      onHand: inventory.onHandQuantity,
      reserved: inventory.reservedQuantity,
      allocated: inventory.allocatedQuantity,
      available: inventory.onHandQuantity - inventory.reservedQuantity - inventory.allocatedQuantity,
    };

    return {
      id: inventory.id,
      tenantId: inventory.tenantId,
      catalogVariantId: inventory.catalogVariantId,
      quantities,
      status: {
        isActive: inventory.isActive,
        isSellable: inventory.isSellable,
        lowStockThreshold: inventory.lowStockThreshold || undefined,
      },
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      metadata: {
        location: inventory.location as string | undefined,
        source: inventory.source || undefined,
        unitCost: inventory.unitCost ? Number(inventory.unitCost) : undefined,
      },
    };
  }

  /**
   * Maps multiple inventory items to snapshot list.
   *
   * @param inventories - Array of Prisma inventory entities
   * @returns Array of inventory snapshots
   */
  toSnapshotList(inventories: InventoryItem[]): InventorySnapshot[] {
    return inventories.map(inventory => this.toSnapshot(inventory));
  }

  /**
   * Determines inventory status based on quantities.
   *
   * @param inventory - Prisma inventory entity
   * @returns Inventory status
   */
  private getInventoryStatus(inventory: InventoryItem): 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' {
    if (!inventory.isActive) {
      return 'discontinued';
    }

    const available = inventory.onHandQuantity - inventory.reservedQuantity - inventory.allocatedQuantity;

    if (available <= 0) {
      return 'out_of_stock';
    }

    if (inventory.lowStockThreshold && available <= inventory.lowStockThreshold) {
      return 'low_stock';
    }

    return 'in_stock';
  }

  /**
   * Maps inventory to list response format.
   *
   * @param inventory - Prisma inventory entity
   * @returns List inventory item
   */
  toListItem(inventory: InventoryItem) {
    return {
      id: inventory.id,
      catalogVariantId: inventory.catalogVariantId,
      quantities: {
        onHand: inventory.onHandQuantity,
        reserved: inventory.reservedQuantity,
        allocated: inventory.allocatedQuantity,
        available: inventory.onHandQuantity - inventory.reservedQuantity - inventory.allocatedQuantity,
      },
      status: this.getInventoryStatus(inventory),
      isActive: inventory.isActive,
      isSellable: inventory.isSellable,
      lowStockThreshold: inventory.lowStockThreshold,
      location: inventory.location,
      updatedAt: inventory.updatedAt,
    };
  }

  /**
   * Maps inventory list to paginated response.
   *
   * @param result - Repository query result
   * @returns Paginated inventory list
   */
  toPaginatedList(result: {
    items: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) {
    return {
      items: result.items.map(item => this.toListItem(item)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
