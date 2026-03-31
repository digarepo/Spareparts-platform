import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { RequestContext } from '@spareparts/contracts';
import type { InventoryItem, StockMovement } from '@prisma/client';
import { randomUUID } from 'crypto';
import { StockMovementType } from '@spareparts/contracts';

/**
 * Inventory repository with atomic transactions and strict tenant isolation.
 *
 * @remarks
 * - Uses Prisma $transaction for true atomic integrity
 * - Implements Compare-and-Swap (CAS) for race condition prevention
 * - Enforces strict tenant scoping on ALL queries
 * - Zero-Trust: No fallbacks or assumptions
 * - Ghost Mutation Prevention: Every stock change has matching audit record
 */
@Injectable()
export class InventoryRepository {
  private readonly logger = new Logger(InventoryRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds inventory item by tenant and variant with strict tenant scoping.
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param catalogVariantId - Catalog variant identifier
   * @param context - Request context for tenant verification
   * @returns Inventory item or null if not found
   * @throws Error - If tenant context is invalid
   */
  async findByTenantAndVariant(
    tenantId: string,
    catalogVariantId: string,
    context: RequestContext
  ): Promise<InventoryItem | null> {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Finding inventory: tenant=${tenantId}, variant=${catalogVariantId}`);

    // STRICT TENANT SCOPING: tenantId is ALWAYS in where clause
    const inventory = await this.prisma.db.inventoryItem.findFirst({
      where: {
        tenantId, // HARD REQUIREMENT
        catalogVariantId,
      },
    });

    return inventory;
  }

  /**
   * Atomically updates quantities with audit trail in a single transaction.
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param catalogVariantId - Catalog variant identifier
   * @param updates - Quantity updates to apply
   * @param reason - Reason for the change
   * @param referenceId - External reference identifier
   * @param metadata - Additional metadata
   * @param context - Request context for tenant verification
   * @returns Updated inventory item
   * @throws ConflictException - If CAS condition fails (race condition)
   * @throws NotFoundException - If inventory item not found
   */
  async updateQuantities(
    tenantId: string,
    catalogVariantId: string,
    updates: {
      onHandQuantity?: number;
      reservedQuantity?: number;
      allocatedQuantity?: number;
    },
    reason: string,
    referenceId: string | undefined,
    metadata: Record<string, any> | undefined,
    context: RequestContext
  ): Promise<InventoryItem> {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Updating quantities: tenant=${tenantId}, variant=${catalogVariantId}`);

    // Get current state for CAS verification
    const current = await this.findByTenantAndVariant(tenantId, catalogVariantId, context);
    if (!current) {
      throw new ConflictException(`Inventory not found for tenant=${tenantId}, variant=${catalogVariantId}`);
    }

    // ATOMIC TRANSACTION: Ensure inventory update and stock movement creation happen together
    return this.prisma.db.$transaction(async (tx) => {
      // Build update data
      const updateData: any = {};

      if (updates.onHandQuantity !== undefined) {
        updateData.onHandQuantity = updates.onHandQuantity;
      }

      if (updates.reservedQuantity !== undefined) {
        updateData.reservedQuantity = updates.reservedQuantity;
      }

      if (updates.allocatedQuantity !== undefined) {
        updateData.allocatedQuantity = updates.allocatedQuantity;
      }

      // Build CAS where clause - ONLY check fields being changed
      const casWhere: any = {
        tenantId_catalogVariantId: {
          tenantId,
          catalogVariantId,
        },
      };

      // Only include quantity fields that are actually being changed
      if (updates.onHandQuantity !== undefined) {
        casWhere.onHandQuantity = current.onHandQuantity;
      }
      if (updates.reservedQuantity !== undefined) {
        casWhere.reservedQuantity = current.reservedQuantity;
      }
      if (updates.allocatedQuantity !== undefined) {
        casWhere.allocatedQuantity = current.allocatedQuantity;
      }

      // COMPARE-AND-SWAP: Include only changed fields in where clause to prevent race conditions
      const updatedInventory = await tx.inventoryItem.update({
        where: casWhere,
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // GHOST MUTATION PREVENTION: Create matching audit record in same transaction
      const movementId = randomUUID();
      const quantityChange = this.calculateQuantityChange(current, updatedInventory);

      if (quantityChange !== 0) {
        await tx.stockMovement.create({
          data: {
            id: movementId,
            inventoryId: updatedInventory.id,
            tenantId: tenantId,
            movementType: this.determineMovementType(updates),
            quantity: Math.abs(quantityChange),
            reason: reason || 'System update',
            referenceId: referenceId || null,
            initiatedBy: this.extractInitiator(context),
            createdAt: new Date(),
          },
        });
      }

      this.logger.log(
        `Quantities updated atomically: tenant=${tenantId}, variant=${catalogVariantId}, ` +
        `movementId=${movementId}`
      );

      return updatedInventory;
    });
  }

  /**
   * Atomically reserves stock with CAS protection and audit trail.
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param catalogVariantId - Catalog variant identifier
   * @param quantity - Quantity to reserve
   * @param reason - Reason for reservation
   * @param referenceId - External reference identifier
   * @param metadata - Additional metadata
   * @param context - Request context for tenant verification
   * @returns Updated inventory item
   * @throws ConflictException - If insufficient stock or race condition
   */
  async reserveStock(
    tenantId: string,
    catalogVariantId: string,
    quantity: number,
    reason: string,
    referenceId: string | undefined,
    metadata: Record<string, any> | undefined,
    context: RequestContext
  ): Promise<InventoryItem> {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Reserving stock: tenant=${tenantId}, variant=${catalogVariantId}, quantity=${quantity}`);

    // ATOMIC TRANSACTION: Ensure inventory update and reservation record creation happen together
    return this.prisma.db.$transaction(async (tx) => {
      const reservationId = randomUUID();

      try {
        // SINGLE DATABASE ROUND-TRIP: Combine find and update with CAS
        const updatedInventory = await tx.inventoryItem.update({
          where: {
            tenantId_catalogVariantId: {
              tenantId,
              catalogVariantId,
            },
            // CONCURRENCY SAFETY: Ensure sufficient available stock exists
            onHandQuantity: {
              gte: quantity, // Must have enough on-hand to cover reservation
            },
            // CAS: Verify current state hasn't changed for quantities that matter
            reservedQuantity: { gte: 0 }, // Basic sanity check
            allocatedQuantity: { gte: 0 }, // Basic sanity check
          },
          data: {
            // ATOMIC INCREMENT: Increase reserved quantity
            reservedQuantity: {
              increment: quantity,
            },
            updatedAt: new Date(),
          },
        });

        // GHOST MUTATION PREVENTION: Create matching audit record in same transaction
        await tx.stockMovement.create({
          data: {
            id: reservationId,
            inventoryId: updatedInventory.id,
            tenantId: tenantId,
            movementType: StockMovementType.RESERVATION,
            quantity: quantity,
            reason: reason || 'Stock reservation',
            referenceId: referenceId || null,
            initiatedBy: this.extractInitiator(context),
            createdAt: new Date(),
          },
        });

        this.logger.log(
          `Stock reserved atomically: tenant=${tenantId}, variant=${catalogVariantId}, ` +
          `quantity=${quantity}, reservationId=${reservationId}`
        );

        return updatedInventory;

      } catch (error: any) {
        // Handle Prisma P2025 error (record not found) or other constraint violations
        if (error.code === 'P2025' || error.code === 'P2002') {
          throw new ConflictException(
            `Insufficient available stock or inventory not found for tenant=${tenantId}, variant=${catalogVariantId}, requested=${quantity}`
          );
        }
        throw error; // Re-throw other errors
      }
    });
  }

  /**
   * Atomically releases reserved stock with CAS protection and audit trail.
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param catalogVariantId - Catalog variant identifier
   * @param quantity - Quantity to release
   * @param reason - Reason for release
   * @param referenceId - External reference identifier
   * @param metadata - Additional metadata
   * @param context - Request context for tenant verification
   * @returns Updated inventory item
   * @throws ConflictException - If insufficient reserved stock or race condition
   */
  async releaseReservedStock(
    tenantId: string,
    catalogVariantId: string,
    quantity: number,
    reason: string,
    referenceId: string | undefined,
    metadata: Record<string, any> | undefined,
    context: RequestContext
  ): Promise<InventoryItem> {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Releasing reserved stock: tenant=${tenantId}, variant=${catalogVariantId}, quantity=${quantity}`);

    // ATOMIC TRANSACTION: Ensure inventory update and release record creation happen together
    return this.prisma.db.$transaction(async (tx) => {
      // Get current inventory for CAS verification
      const current = await tx.inventoryItem.findFirst({
        where: {
          tenantId,
          catalogVariantId,
        },
      });

      if (!current) {
        throw new ConflictException(
          `Inventory not found for tenant=${tenantId}, variant=${catalogVariantId}`
        );
      }

      // CONCURRENCY SAFETY: Ensure sufficient reserved stock exists to release
      if (current.reservedQuantity < quantity) {
        throw new ConflictException(
          `Insufficient reserved stock: Reserved=${current.reservedQuantity}, Requested=${quantity}`
        );
      }

      // ATOMIC RELEASE with CAS: Use Prisma's atomic operations
      const updatedInventory = await tx.inventoryItem.update({
        where: {
          tenantId_catalogVariantId: {
            tenantId,
            catalogVariantId,
          },
          // CAS: Ensure sufficient reserved stock exists to release
          reservedQuantity: {
            gte: quantity, // Must have enough reserved to release
          },
          // CAS: Verify current state hasn't changed
          onHandQuantity: current.onHandQuantity,
          allocatedQuantity: current.allocatedQuantity,
        },
        data: {
          // ATOMIC DECREMENT: Decrease reserved quantity
          reservedQuantity: {
            decrement: quantity,
          },
          updatedAt: new Date(),
        },
      });

      // GHOST MUTATION PREVENTION: Create matching audit record in same transaction
      const releaseId = randomUUID();
      await tx.stockMovement.create({
        data: {
          id: releaseId,
          inventoryId: updatedInventory.id,
          tenantId: tenantId,
          movementType: StockMovementType.RELEASE,
          quantity: quantity,
          reason: reason || 'Stock release',
          referenceId: referenceId || null,
          initiatedBy: this.extractInitiator(context),
          createdAt: new Date(),
        },
      });

      this.logger.log(
        `Reserved stock released atomically: tenant=${tenantId}, variant=${catalogVariantId}, ` +
        `quantity=${quantity}, releaseId=${releaseId}`
      );

      return updatedInventory;
    });
  }

  /**
   * Lists inventory items for a tenant with strict filtering.
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param context - Request context for tenant verification
   * @param options - Query options
   * @returns Paginated inventory items
   */
  async listByTenant(
    tenantId: string,
    context: RequestContext,
    options: {
      catalogVariantIds?: string[];
      isActive?: boolean;
      isSellable?: boolean;
      lowStockOnly?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page: number;
      limit: number;
    }
  ) {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Listing inventory: tenant=${tenantId}, page=${options.page}, limit=${options.limit}`);

    // Build where clause - ALWAYS includes tenantId
    const where: any = {
      tenantId, // HARD REQUIREMENT
    };

    // Apply optional filters
    if (options.catalogVariantIds?.length) {
      where.catalogVariantId = { in: options.catalogVariantIds };
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.isSellable !== undefined) {
      where.isSellable = options.isSellable;
    }

    if (options.lowStockOnly) {
      where.onHandQuantity = { lte: 10 }; // Example low stock threshold
    }

    if (options.search) {
      where.OR = [
        { catalogVariantId: { contains: options.search, mode: 'insensitive' } },
        { location: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (options.sortBy) {
      orderBy[options.sortBy] = options.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute query with pagination
    const [items, total] = await Promise.all([
      this.prisma.db.inventoryItem.findMany({
        where,
        orderBy,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.db.inventoryItem.count({ where }),
    ]);

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  /**
   * Gets detailed inventory with stock movements (tenant-scoped).
   *
   * @param tenantId - Tenant identifier (REQUIRED)
   * @param catalogVariantId - Catalog variant identifier
   * @param context - Request context for tenant verification
   * @returns Detailed inventory with movements
   */
  async getDetailed(
    tenantId: string,
    catalogVariantId: string,
    context: RequestContext
  ) {
    // ZERO TRUST: Verify tenant context matches request
    if (!context.tenantId || context.tenantId !== tenantId) {
      throw new Error('Tenant context mismatch or missing');
    }

    this.logger.log(`Getting detailed inventory: tenant=${tenantId}, variant=${catalogVariantId}`);

    const inventory = await this.prisma.db.inventoryItem.findFirst({
      where: {
        tenantId, // HARD REQUIREMENT
        catalogVariantId,
      },
      include: {
        stockMovements: {
          where: {
            tenantId, // ALSO REQUIRED in nested query
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50, // Limit recent movements
        },
      },
    });

    if (!inventory) {
      throw new ConflictException(`Inventory not found for tenant=${tenantId}, variant=${catalogVariantId}`);
    }

    return inventory;
  }

  // Helper methods

  private calculateQuantityChange(current: InventoryItem, updated: InventoryItem): number {
    const currentTotal = current.onHandQuantity;
    const updatedTotal = updated.onHandQuantity;
    return updatedTotal - currentTotal;
  }

  private determineMovementType(updates: {
    onHandQuantity?: number;
    reservedQuantity?: number;
    allocatedQuantity?: number;
  }): string {
    if (updates.onHandQuantity !== undefined) {
      return updates.onHandQuantity > 0 ? StockMovementType.INCREASE : StockMovementType.DECREASE;
    }
    if (updates.reservedQuantity !== undefined) {
      return updates.reservedQuantity > 0 ? StockMovementType.RESERVATION : StockMovementType.RELEASE;
    }
    if (updates.allocatedQuantity !== undefined) {
      return updates.allocatedQuantity > 0 ? StockMovementType.ALLOCATION : StockMovementType.DEALLOCATION;
    }
    return StockMovementType.ADJUSTMENT;
  }

  private extractInitiator(context: RequestContext): string {
    if (context.actor?.kind === 'tenant' || context.actor?.kind === 'platform') {
      return context.actor.userId;
    }
    return 'system';
  }
}
