import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Cart repository with transaction support and optimized queries.
 *
 * @remarks
 * - **Scope:** Cart data access layer with transaction support
 * - **Authority:** Database operations for cart management
 * - **Invariants:** All operations maintain data integrity
 * - **Security:** Tenant isolation enforced at database level
 */
@Injectable()
export class CartRepository {
  private readonly logger = new Logger(CartRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a cart by ID with tenant isolation.
   *
   * @param id - Cart identifier
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<Cart | null> Cart with items or null
   */
  async findById(id: string, tenantId: string): Promise<Cart | null> {
    this.logger.debug(`Finding cart: ${id} in tenant: ${tenantId}`);

    // Query cart from database with tenant isolation
    const cart = await this.prisma.db.cart.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      this.logger.debug(`Cart not found: ${id}`, { tenantId });
      return null;
    }

    this.logger.debug(`Found cart: ${id}`, {
      customerId: cart.customerId,
      itemCount: cart.items?.length || 0,
      status: cart.status
    });

    // Transform to match expected Cart interface
    return {
      ...cart,
      statusId: cart.status,
      items: (cart.items || []).map((item) => ({
        ...item,
        addedAt: item.createdAt, // Use createdAt as addedAt since that's what's available
        metadata: item.metadata as Record<string, unknown> | undefined
      })),
      expiresAt: cart.expiresAt || undefined
    };
  }

  /**
   * Finds carts by customer ID with optional filtering.
   *
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier for isolation
   * @param options - Query options
   * @returns Promise<Cart[]> Array of customer carts
   */
  async findByCustomerId(
    customerId: string,
    tenantId: string,
    options: {
      status?: string;
      limit?: number;
    } = {},
  ): Promise<Cart[]> {
    this.logger.debug(`Finding carts for customer: ${customerId} in tenant: ${tenantId}`);

    // Query carts from database with tenant isolation and filtering
    const whereClause: Record<string, unknown> = {
      customerId,
      tenantId,
    };

    if (options.status) {
      whereClause.status = options.status;
    }

    const carts = await this.prisma.db.cart.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: options.limit || 50,
    });

    this.logger.debug(`Found ${carts.length} carts for customer: ${customerId}`, {
      status: options.status,
      limit: options.limit,
    });

    // Transform to match expected Cart interface
    return carts.map(cart => ({
      ...cart,
      statusId: cart.status,
      items: (cart.items || []).map((item) => ({
        ...item,
        addedAt: item.createdAt, // Use createdAt as addedAt since that's what's available
        metadata: item.metadata as Record<string, unknown> | undefined
      })),
      expiresAt: cart.expiresAt || undefined
    }));
  }

  /**
   * Adds an item to a cart with transaction support.
   *
   * @param data - Cart item creation data
   * @returns Promise<Cart> Updated cart with new item
   */
  async addItem(data: CreateCartItemData): Promise<Cart> {
    this.logger.debug(`Adding item to cart: ${data.cartId}`);

    // Add item to cart with transaction support
    const updatedCart = await this.prisma.db.$transaction(async (tx) => {
      // Verify cart exists and belongs to tenant
      const cart = await tx.cart.findFirst({
        where: {
          id: data.cartId,
          tenantId: data.tenantId,
        },
      });

      if (!cart) {
        throw new Error(`Cart not found: ${data.cartId}`);
      }

      // Check if item already exists in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: data.cartId,
          catalogVariantId: data.catalogVariantId,
        },
      });

      if (existingItem) {
        // Update existing item quantity
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + data.quantity,
            observedUnitPrice: data.observedUnitPrice,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new cart item
        await tx.cartItem.create({
          data: {
            id: `cartitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cartId: data.cartId,
            customerId: cart.customerId, // Get from existing cart
            tenantId: data.tenantId,
            catalogVariantId: data.catalogVariantId,
            quantity: data.quantity,
            observedUnitPrice: data.observedUnitPrice,
            lineTotal: (Number(data.quantity) * Number(data.observedUnitPrice)).toString(),
            productName: data.productName,
            variantName: data.variantName,
            metadata: data.metadata as any,
            priceCapturedAt: new Date(),
          },
        });
      }

      // Update cart timestamp
      await tx.cart.update({
        where: { id: data.cartId },
        data: { updatedAt: new Date() },
      });

      // Return updated cart with items
      return await tx.cart.findFirst({
        where: { id: data.cartId },
        include: {
          items: true,
        },
      });
    });

    if (!updatedCart) {
      throw new Error(`Failed to update cart: ${data.cartId}`);
    }

    this.logger.debug(`Added item to cart: ${data.cartId}`, {
      variantId: data.catalogVariantId,
      quantity: data.quantity,
    });

    // Transform to match expected Cart interface
    return {
      ...updatedCart,
      statusId: updatedCart.status,
      items: (updatedCart.items || []).map((item) => ({
        ...item,
        addedAt: item.createdAt,
        metadata: item.metadata as Record<string, unknown> | undefined
      })),
      expiresAt: updatedCart.expiresAt || undefined
    };
  }

  /**
   * Removes an item from a cart.
   *
   * @param cartId - Cart identifier
   * @param itemId - Item identifier to remove
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<Cart> Updated cart without the removed item
   */
  async removeItem(cartId: string, itemId: string, tenantId: string): Promise<Cart> {
    this.logger.debug(`Removing item ${itemId} from cart: ${cartId}`);

    // Remove item from cart with transaction support
    const updatedCart = await this.prisma.db.$transaction(async (tx) => {
      // Verify cart exists and belongs to tenant
      const cart = await tx.cart.findFirst({
        where: {
          id: cartId,
          tenantId,
        },
      });

      if (!cart) {
        throw new Error(`Cart not found: ${cartId}`);
      }

      // Remove the item
      await tx.cartItem.deleteMany({
        where: {
          id: itemId,
          cartId,
          tenantId,
        },
      });

      // Update cart timestamp
      await tx.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() },
      });

      // Return updated cart
      return await tx.cart.findFirst({
        where: { id: cartId },
        include: {
          items: true,
        },
      });
    });

    if (!updatedCart) {
      throw new Error(`Failed to remove item from cart: ${cartId}`);
    }

    this.logger.log(`Removed item from cart: ${cartId}`, { itemId });
    // Transform to match expected Cart interface
    return {
      ...updatedCart,
      statusId: updatedCart.status,
      items: (updatedCart.items || []).map((item) => ({
        ...item,
        addedAt: item.createdAt,
        metadata: item.metadata as Record<string, unknown> | undefined
      })),
      expiresAt: updatedCart.expiresAt || undefined
    };
  }

  /**
   * Clears all items from a cart.
   *
   * @param cartId - Cart identifier
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<Cart> Empty cart
   */
  async clearItems(cartId: string, tenantId: string): Promise<Cart> {
    this.logger.debug(`Clearing items from cart: ${cartId}`);

    // Clear all items from cart with transaction support
    const updatedCart = await this.prisma.db.$transaction(async (tx) => {
      // Verify cart exists and belongs to tenant
      const cart = await tx.cart.findFirst({
        where: {
          id: cartId,
          tenantId,
        },
      });

      if (!cart) {
        throw new Error(`Cart not found: ${cartId}`);
      }

      // Remove all items from cart
      await tx.cartItem.deleteMany({
        where: {
          cartId,
          tenantId,
        },
      });

      // Update cart timestamp
      await tx.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() },
      });

      // Return updated cart
      return await tx.cart.findFirst({
        where: { id: cartId },
        include: {
          items: true,
        },
      });
    });

    if (!updatedCart) {
      throw new Error(`Failed to clear items from cart: ${cartId}`);
    }

    this.logger.log(`Cleared items from cart: ${cartId}`);
    // Transform to match expected Cart interface
    return {
      ...updatedCart,
      statusId: updatedCart.status,
      items: (updatedCart.items || []).map((item) => ({
        ...item,
        addedAt: item.createdAt,
        metadata: item.metadata as Record<string, unknown> | undefined
      })),
      expiresAt: updatedCart.expiresAt || undefined
    };
  }
}

/**
 * Cart interface for type safety.
 */
export interface Cart {
  id: string;
  customerId: string;
  tenantId: string;
  statusId: string;
  sessionId?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

/**
 * Cart item interface for type safety.
 */
export interface CartItem {
  id: string;
  cartId: string;
  tenantId: string;
  catalogVariantId: string;
  quantity: number;
  observedUnitPrice: string;
  productName: string;
  variantName: string;
  metadata?: Record<string, unknown>;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create cart item data interface.
 */
export interface CreateCartItemData {
  cartId: string;
  tenantId: string;
  catalogVariantId: string;
  quantity: number;
  observedUnitPrice: string;
  productName: string;
  variantName: string;
  metadata?: Record<string, unknown>;
}

/**
 * Cart status enum.
 */
export enum CartStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
}
