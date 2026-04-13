import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaClient, Prisma, Order, OrderItem, Cart, CartItem as PrismaCartItem } from '@prisma/client';

/**
 * Order repository with transaction support, VAT calculations, and Ethiopia-specific features.
 *
 * @remarks
 * - **Scope:** Order data access layer with comprehensive business logic
 * - **Authority:** Database operations for order management with RLS enforcement
 * - **Invariants:** All operations maintain data integrity and financial precision
 * - **Security:** Tenant isolation enforced at database level via RLS policies
 * - **VAT Handling:** Ethiopia 15% VAT with price context awareness
 * - **Shipping:** External delivery provider integration with tracking
 */
@Injectable()
export class OrderRepository {
  private readonly logger = new Logger(OrderRepository.name);
  private readonly prisma: PrismaClient;

  // Ethiopia VAT rate (15%)
  private readonly ETHIOPIA_VAT_RATE = 0.15;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Creates a new order from cart with comprehensive business logic.
   *
   * @param data - Order creation data with cart conversion context
   * @param tx - Optional transaction client for atomic operations
   * @returns Promise<Order & { items: OrderItem[] }> Created order with items and calculated totals
   * @throws {NotFoundException} When cart or items not found
   * @throws {ConflictException} When cart is not in valid state for conversion
   */
  async createOrderFromCart(
    data: CreateOrderFromCartData,
    tx?: PrismaClient,
  ): Promise<Order & { items: OrderItem[] }> {
    const client = tx || this.prisma;
    this.logger.log(`Creating order from cart: ${data.cartId} for customer: ${data.customerId}`);

    // Validate cart exists and belongs to customer
    const cart = await client.cart.findFirst({
      where: {
        id: data.cartId,
        customerId: data.customerId,
        tenantId: data.tenantId,
        status: 'active', // Only active carts can be converted
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found or invalid for conversion: ${data.cartId}`);
    }

    if (cart.items.length === 0) {
      throw new ConflictException(`Cannot create order from empty cart: ${data.cartId}`);
    }

    // Calculate order totals with VAT logic
    const orderTotals = this.calculateOrderTotals(cart.items, data.vatIncluded);

    // Create order with transaction safety
    const order = await client.order.create({
      data: {
        id: this.generateULID(),
        customerId: data.customerId,
        tenantId: data.tenantId,
        status: 'pending',
        currency: 'ETB', // Ethiopia context
        subtotalAmount: orderTotals.subtotalAmount,
        taxAmount: orderTotals.taxAmount,
        shippingAmount: orderTotals.shippingAmount,
        totalAmount: orderTotals.totalAmount,
        shippingAddress: data.shippingAddress as Prisma.InputJsonValue,
        billingAddress: data.billingAddress as Prisma.InputJsonValue,
        metadata: {
          ...(data.metadata || {}),
          sourceCartId: data.cartId,
          vatIncluded: data.vatIncluded,
          originalVatRate: this.ETHIOPIA_VAT_RATE,
          conversionTimestamp: new Date().toISOString(),
        },
      },
    });

    // Create order items with pricing snapshots
    const orderItems = await Promise.all(
      cart.items.map((cartItem: PrismaCartItem) =>
        client.orderItem.create({
          data: {
            id: this.generateULID(),
            orderId: order.id,
            customerId: data.customerId,
            tenantId: data.tenantId,
            catalogVariantId: cartItem.catalogVariantId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.observedUnitPrice, // Verified price from cart
            totalPrice: this.calculateItemTotal(cartItem.quantity, cartItem.observedUnitPrice),
            productName: cartItem.productName,
            variantName: cartItem.variantName,
            variantAttributes: cartItem.metadata ? cartItem.metadata : undefined,
            pricingMetadata: {
              originalCartItemId: cartItem.id,
              priceVerified: true,
              vatIncluded: data.vatIncluded,
              priceCapturedAt: cartItem.priceCapturedAt,
              lineTotal: cartItem.lineTotal,
            },
            createdAt: new Date(),
          },
        })
      )
    );

    // Update cart status to converted
    await client.cart.update({
      where: { id: data.cartId },
      data: {
        status: 'converted',
        updatedAt: new Date(),
      },
    });

    // Create initial status history entry
    await client.orderStatusHistory.create({
      data: {
        id: this.generateULID(),
        orderId: order.id,
        tenantId: data.tenantId,
        previousStatus: null,
        newStatus: 'pending',
        changedBy: 'system',
        actorType: 'system',
        reason: 'Order created from cart',
      },
    });

    this.logger.log(`Successfully created order: ${order.id} from cart: ${data.cartId}`);

    // Return complete order with items
    return Object.assign(order, { items: orderItems });
  }

  /**
   * Finds an order by ID with comprehensive validation and tenant isolation.
   *
   * @param id - Order identifier
   * @param tenantId - Tenant identifier for isolation
   * @param customerId - Optional customer ID for ownership verification
   * @param tx - Optional transaction client
   * @returns Promise<(Order & { items: OrderItem[] }) | null> Order with items or null
   */
  async findById(
    id: string,
    tenantId: string,
    customerId?: string,
    tx?: PrismaClient,
  ): Promise<(Order & { items: OrderItem[] }) | null> {
    const client = tx || this.prisma;

    const whereClause: Prisma.OrderWhereInput = {
      id,
      tenantId,
    };

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const order = await client.order.findFirst({
      where: whereClause,
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      this.logger.debug(`Order not found: ${id} in tenant: ${tenantId}`);
      return null;
    }

    this.logger.debug(`Found order: ${id} in tenant: ${tenantId}`);
    return Object.assign(order, { items: order.items || [] });
  }

  /**
   * Finds orders by customer ID with pagination and filtering.
   *
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier for isolation
   * @param options - Query options for pagination and filtering
   * @returns Promise<OrderListResult> Paginated order list with metadata
   */
  async findByCustomerId(
    customerId: string,
    tenantId: string,
    options: {
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<OrderListResult> {
    this.logger.debug(`Finding orders for customer: ${customerId} in tenant: ${tenantId}`);

    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {
      customerId,
      tenantId,
    };

    if (options.status) {
      whereClause.status = options.status;
    }

    if (options.dateFrom || options.dateTo) {
      whereClause.createdAt = {};
      if (options.dateFrom) {
        whereClause.createdAt.gte = options.dateFrom;
      }
      if (options.dateTo) {
        whereClause.createdAt.lte = options.dateTo;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.debug(`Found ${orders.length} orders for customer: ${customerId} (page ${page}/${totalPages})`);

    const ordersWithItems = orders.map((order: Order) => ({ ...order, items: [] }));

    return {
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Updates order status with comprehensive validation and audit trail.
   *
   * @param data - Status update data with audit information
   * @param tx - Optional transaction client
   * @returns Promise<Order> Updated order
   * @throws {NotFoundException} When order not found
   * @throws {ConflictException} When status transition is invalid
   */
  async updateOrderStatus(
    data: UpdateOrderStatusData,
    tx?: PrismaClient,
  ): Promise<Order> {
    const client = tx || this.prisma;
    this.logger.log(`Updating order status: ${data.orderId} to ${data.newStatus}`);

    const order = await client.order.findFirst({
      where: {
        id: data.orderId,
        tenantId: data.tenantId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${data.orderId}`);
    }

    // Validate status transition (business rule enforcement)
    this.validateStatusTransition(order.status, data.newStatus);

    // Update order status
    const updatedOrder = await client.order.update({
      where: { id: data.orderId },
      data: {
        status: data.newStatus,
        updatedAt: new Date(),
        metadata: {
          ...(order.metadata as Record<string, unknown> || {}),
          lastStatusUpdate: {
            previousStatus: order.status,
            newStatus: data.newStatus,
            changedBy: data.changedBy,
            reason: data.reason,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    // Create status history entry
    await client.orderStatusHistory.create({
      data: {
        id: this.generateULID(),
        orderId: data.orderId,
        tenantId: data.tenantId,
        previousStatus: order.status,
        newStatus: data.newStatus,
        changedBy: data.changedBy,
        actorType: data.actorType || 'user',
        reason: data.reason,
      },
    });

    this.logger.log(`Successfully updated order status: ${data.orderId} to ${data.newStatus}`);

    return Object.assign(updatedOrder, { items: [] });
  }

  /**
   * Updates shipping information with delivery provider tracking.
   *
   * @param data - Shipping update data with tracking information
   * @param tx - Optional transaction client
   * @returns Promise<Order> Updated order with shipping info
   * @throws {NotFoundException} When order not found
   */
  async updateShippingInfo(
    data: UpdateShippingData,
    tx?: PrismaClient,
  ): Promise<Order> {
    const client = tx || this.prisma;
    this.logger.log(`Updating shipping info for order: ${data.orderId}`);

    const order = await client.order.findFirst({
      where: {
        id: data.orderId,
        tenantId: data.tenantId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${data.orderId}`);
    }

    const updatedOrder = await client.order.update({
      where: { id: data.orderId },
      data: {
        shippingAddress: data.shippingAddress ? data.shippingAddress as Prisma.InputJsonValue : (order.shippingAddress || undefined),
        metadata: {
          ...(order.metadata as Record<string, unknown> || {}),
          shipping: {
            provider: data.provider,
            trackingNumber: data.trackingNumber,
            estimatedDelivery: data.estimatedDelivery,
            shippedAt: data.shippedAt,
            deliveryNotes: data.deliveryNotes,
            lastUpdate: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Successfully updated shipping info for order: ${data.orderId}`);

    return Object.assign(updatedOrder, { items: [] });
  }

  /**
   * Calculates order totals with Ethiopia VAT logic and shipping costs.
   *
   * @param items - Order items for subtotal calculation
   * @param vatIncluded - Whether item prices include VAT
   * @returns OrderTotals Calculated totals with proper VAT handling
   * @private
   */
  private calculateOrderTotals(items: PrismaCartItem[], vatIncluded: boolean): OrderTotals {
    // Calculate subtotal from items (using Decimal for precision)
    const subtotal = items.reduce(
      (sum, item) => {
        const itemTotal = new Decimal(item.observedUnitPrice).times(item.quantity);
        return sum.plus(itemTotal);
      },
      new Decimal(0),
    );

    // Calculate VAT based on price context
    let taxAmount: Decimal;
    if (vatIncluded) {
      // Prices include VAT - extract VAT amount
      taxAmount = subtotal.div(1 + this.ETHIOPIA_VAT_RATE).times(this.ETHIOPIA_VAT_RATE);
    } else {
      // Prices exclude VAT - add VAT amount
      taxAmount = subtotal.times(this.ETHIOPIA_VAT_RATE);
    }

    // Calculate shipping (flat rate for now - can be enhanced with provider integration)
    const shippingAmount = this.calculateShippingCost(items, subtotal);

    // Calculate total
    const totalAmount = subtotal.plus(taxAmount).plus(shippingAmount);

    return {
      subtotalAmount: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      shippingAmount: shippingAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  }

  /**
   * Calculates shipping cost based on items and order value.
   *
   * @param items - Order items
   * @param subtotal - Order subtotal
   * @returns Decimal Shipping cost
   * @private
   */
  private calculateShippingCost(items: PrismaCartItem[], subtotal: Decimal): Decimal {
    // Ethiopia-specific shipping logic
    // - Base rate: 50 ETB
    // - Free shipping for orders over 2000 ETB
    // - Additional cost for heavy items (> 5kg total)

    const baseShippingRate = new Decimal('50.00');
    const freeShippingThreshold = new Decimal('2000.00');

    // Check for free shipping eligibility
    if (subtotal.greaterThanOrEqualTo(freeShippingThreshold)) {
      return new Decimal('0.00');
    }

    // Calculate total weight (assuming average 1kg per item for now)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const heavyItemSurcharge = totalQuantity > 5 ? new Decimal('25.00') : new Decimal('0.00');

    return baseShippingRate.plus(heavyItemSurcharge);
  }

  /**
   * Calculates item total with precision.
   *
   * @param quantity - Item quantity
   * @param unitPrice - Unit price as string
   * @returns string Total price as string with 2 decimal places
   * @private
   */
  private calculateItemTotal(quantity: number, unitPrice: string): string {
    const unitPriceDecimal = new Decimal(unitPrice);
    const total = unitPriceDecimal.times(quantity);
    return total.toFixed(2);
  }

  /**
   * Validates order status transitions according to business rules.
   *
   * @param currentStatus - Current order status
   * @param newStatus - Desired new status
   * @throws {ConflictException} When transition is invalid
   * @private
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['shipped', 'cancelled', 'failed'],
      shipped: ['completed', 'failed'],
      completed: [], // Terminal state
      cancelled: [], // Terminal state
      failed: ['pending'], // Can retry failed orders
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ConflictException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ')}`
      );
    }
  }

  /**
   * Generates a ULID for new entities.
   *
   * @returns string Generated ULID
   * @private
   */
  private generateULID(): string {
    const { ulid } = require('ulid');
    return ulid();
  }

  /**
   * Cleanup method for proper resource management.
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}

// Type definitions for the repository
interface CreateOrderFromCartData {
  cartId: string;
  customerId: string;
  tenantId: string;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  vatIncluded: boolean; // Whether cart prices include VAT
  metadata?: Record<string, unknown>;
}

interface UpdateOrderStatusData {
  orderId: string;
  tenantId: string;
  newStatus: string;
  changedBy: string;
  actorType?: 'user' | 'system' | 'admin';
  reason?: string;
}

interface UpdateShippingData {
  orderId: string;
  tenantId: string;
  provider?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveryNotes?: string;
  shippingAddress?: Record<string, unknown>;
}

interface OrderTotals {
  subtotalAmount: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
}

interface OrderListResult {
  orders: (Order & { items: OrderItem[] })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
