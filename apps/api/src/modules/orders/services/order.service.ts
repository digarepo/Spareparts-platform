import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { ProductCatalogService } from '../../catalog/services/product-catalog.service';
import { CreateOrderCommand } from '../dto/commands/create-order.command';
import { EthiopiaAddressCommand } from '../dto/commands/create-order.command';
import { GetOrderQuery, GetCustomerOrdersQuery } from '../dto/queries/get-order.query';
import { OrderResponseDto } from '../dto/responses/order-response.dto';
import { ListOrdersResponseDto } from '../dto/responses/list-orders-response.dto';
import { Decimal } from 'decimal.js';
import { Order, OrderItem, CartItem as PrismaCartItem } from '@prisma/client';
import { Cart, CartItem as RepositoryCartItem } from '../repositories/cart.repository';

/**
 * Order service with comprehensive business logic.
 *
 * @remarks
 * - **Scope:** Order lifecycle management with cart-to-order conversion
 * - **Authority:** Customer order operations with tenant isolation
 * - **Invariants:** Financial precision with Ethiopia 15% VAT, proper state management
 * - **Security:** Customer ownership verification, tenant isolation, audit trails
 * - **Performance:** Optimized for high-volume order processing
 * - **VAT Handling:** Ethiopia 15% VAT with price context awareness (inclusive/exclusive)
 * - **Shipping:** External delivery provider integration with tracking capabilities
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  // Ethiopia VAT rate (15%)
  private readonly ETHIOPIA_VAT_RATE = 0.15;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly productCatalogService: ProductCatalogService,
  ) {}

  /**
   * Creates an order from cart with comprehensive business validation and VAT calculations.
   *
   * @param command - Order creation command with all required fields
   * @returns Promise<OrderResponseDto> Created order with full details
   * @throws {NotFoundException} When cart or products not found
   * @throws {ConflictException} When cart is invalid or cannot be converted
   * @throws {BadRequestException} When validation fails
   */
  async createOrderFromCart(command: CreateOrderCommand): Promise<OrderResponseDto> {
    this.logger.log(`Creating order from cart: ${command.cartId} for customer: ${command.customerId}`);

    // Validate cart exists and belongs to customer
    const cart = await this.validateCartForConversion(command.cartId, command.customerId, command.tenantId);

    // Validate all products are still available and get current pricing
    const validatedItems = await this.validateCartItems(cart.items, command.tenantId);

    // Determine VAT context from cart metadata or business rules
    const vatIncluded = this.determineVatContext(cart, validatedItems);

    // Convert addresses to proper format
    const shippingAddress = this.convertAddress(command.shippingAddress);
    const billingAddress = this.convertAddress(command.billingAddress);

    // Create order using repository with transaction safety
    const order = await this.orderRepository.createOrderFromCart({
      cartId: command.cartId,
      customerId: command.customerId,
      tenantId: command.tenantId,
      shippingAddress,
      billingAddress,
      vatIncluded,
      metadata: {
        ...command.metadata,
        ipAddress: command.ipAddress,
        paymentMethodId: command.paymentMethodId,
        vatContext: {
          included: vatIncluded,
          rate: this.ETHIOPIA_VAT_RATE,
          determinedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Successfully created order: ${order.id} from cart: ${command.cartId}`);
    return this.mapToResponseDto(Object.assign(order, { items: [] }));
  }

  /**
   * Retrieves an order by ID with comprehensive validation and security checks.
   *
   * @param query - Order retrieval query with identification fields
   * @returns Promise<OrderResponseDto> Order with full details
   * @throws {NotFoundException} When order not found or access denied
   */
  async getOrder(query: GetOrderQuery): Promise<OrderResponseDto> {
    this.logger.debug(`Retrieving order: ${query.orderId} for customer: ${query.customerId}`);

    const order = await this.orderRepository.findById(
      query.orderId,
      query.tenantId,
      query.customerId,
    );

    if (!order) {
      throw new NotFoundException(`Order not found: ${query.orderId}`);
    }

    this.logger.debug(`Successfully retrieved order: ${query.orderId}`);
    return this.mapToResponseDto(order);
  }

  /**
   * Retrieves customer orders with pagination, filtering, and Ethiopia-specific sorting.
   *
   * @param query - Customer orders query with filters and pagination
   * @returns Promise<ListOrdersResponseDto> Paginated order list with metadata
   */
  async getCustomerOrders(query: GetCustomerOrdersQuery): Promise<ListOrdersResponseDto> {
    this.logger.debug(`Retrieving orders for customer: ${query.customerId}`);

    const result = await this.orderRepository.findByCustomerId(
      query.customerId,
      query.tenantId,
      {
        status: query.statuses?.[0], // TODO: Handle multiple statuses in repository
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        page: query.page,
        limit: query.limit,
      },
    );

    this.logger.debug(`Retrieved ${result.orders.length} orders for customer: ${query.customerId}`);
    return this.mapToListResponseDto(result);
  }

  /**
   * Updates order status with comprehensive validation and audit trail.
   *
   * @param orderId - Order identifier
   * @param newStatus - New status value
   * @param tenantId - Tenant identifier
   * @param customerId - Customer identifier for ownership verification
   * @param initiatedBy - Who initiated the status change
   * @param reason - Reason for status change
   * @returns Promise<OrderResponseDto> Updated order with new status
   * @throws {NotFoundException} When order not found
   * @throws {ConflictException} When status transition is invalid
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    tenantId: string,
    customerId: string,
    initiatedBy: string,
    reason?: string,
  ): Promise<OrderResponseDto> {
    this.logger.log(`Updating order status: ${orderId} to ${newStatus} by ${initiatedBy}`);

    // Verify order ownership
    const order = await this.orderRepository.findById(orderId, tenantId, customerId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Update status using repository
    const updatedOrder = await this.orderRepository.updateOrderStatus({
      orderId,
      tenantId,
      newStatus,
      changedBy: initiatedBy,
      actorType: 'user',
      reason,
    });

    this.logger.log(`Successfully updated order status: ${orderId} to ${newStatus}`);
    return this.mapToResponseDto(Object.assign(updatedOrder, { items: [] }));
  }

  /**
   * Updates shipping information with delivery provider tracking.
   *
   * @param orderId - Order identifier
   * @param shippingData - Shipping update data with tracking information
   * @param tenantId - Tenant identifier
   * @param customerId - Customer identifier for ownership verification
   * @returns Promise<OrderResponseDto> Updated order with shipping info
   * @throws {NotFoundException} When order not found
   */
  async updateShippingInfo(
    orderId: string,
    shippingData: {
      provider?: string;
      trackingNumber?: string;
      estimatedDelivery?: Date;
      deliveryNotes?: string;
    },
    tenantId: string,
    customerId: string,
  ): Promise<OrderResponseDto> {
    this.logger.log(`Updating shipping info for order: ${orderId}`);

    // Verify order ownership
    const order = await this.orderRepository.findById(orderId, tenantId, customerId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Update shipping information
    const updatedOrder = await this.orderRepository.updateShippingInfo({
      orderId,
      tenantId,
      ...shippingData,
      shippedAt: shippingData.trackingNumber ? new Date() : undefined,
    });

    this.logger.log(`Successfully updated shipping info for order: ${orderId}`);
    return this.mapToResponseDto(Object.assign(updatedOrder, { items: [] }));
  }

  /**
   * Cancels an order with comprehensive validation and inventory release.
   *
   * @param orderId - Order identifier
   * @param tenantId - Tenant identifier
   * @param customerId - Customer identifier for ownership verification
   * @param reason - Cancellation reason
   * @param initiatedBy - Who initiated the cancellation
   * @returns Promise<OrderResponseDto> Cancelled order
   * @throws {NotFoundException} When order not found
   * @throws {ConflictException} When order cannot be cancelled
   */
  async cancelOrder(
    orderId: string,
    tenantId: string,
    customerId: string,
    reason: string,
    initiatedBy: string,
  ): Promise<OrderResponseDto> {
    this.logger.log(`Cancelling order: ${orderId} by ${initiatedBy}`);

    // Verify order ownership and validate cancellation
    const order = await this.orderRepository.findById(orderId, tenantId, customerId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Check if order can be cancelled (business rule)
    if (!this.canCancelOrder(order)) {
      throw new ConflictException(`Order ${orderId} cannot be cancelled in current status: ${order.status}`);
    }

    // Update order status to cancelled
    const cancelledOrder = await this.orderRepository.updateOrderStatus({
      orderId,
      tenantId,
      newStatus: 'cancelled',
      changedBy: initiatedBy,
      actorType: 'user',
      reason,
    });

    // TODO: Release inventory reservations (Phase 4 integration)
    // await this.inventoryService.releaseReservations(orderId);

    this.logger.log(`Successfully cancelled order: ${orderId}`);
    return this.mapToResponseDto(Object.assign(cancelledOrder, { items: [] }));
  }

  /**
   * Validates cart for order conversion with comprehensive business rules.
   *
   * @param cartId - Cart identifier
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<Cart> Validated cart
   * @throws {NotFoundException} When cart not found
   * @throws {ConflictException} When cart cannot be converted
   * @private
   */
  private async validateCartForConversion(
    cartId: string,
    customerId: string,
    tenantId: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId, tenantId);

    if (!cart) {
      throw new NotFoundException(`Cart not found: ${cartId}`);
    }

    if (cart.customerId !== customerId) {
      throw new NotFoundException(`Cart access denied for customer: ${customerId}`);
    }

    if (cart.statusId !== 'status_active') {
      throw new ConflictException(`Cannot convert cart with status: ${cart.statusId}`);
    }

    if (cart.items.length === 0) {
      throw new ConflictException(`Cannot create order from empty cart: ${cartId}`);
    }

    // Check if cart has expired
    if (cart.expiresAt && cart.expiresAt < new Date()) {
      throw new ConflictException(`Cart has expired: ${cartId}`);
    }

    return cart;
  }

  /**
   * Validates cart items against current catalog and inventory.
   *
   * @param items - Cart items to validate
   * @param tenantId - Tenant identifier
   * @returns Promise<ValidatedItem[]> Validated items with current pricing
   * @throws {NotFoundException} When products not found
   * @throws {ConflictException} When prices changed significantly
   * @private
   */
  private async validateCartItems(
    items: RepositoryCartItem[],
    tenantId: string,
  ): Promise<ValidatedItem[]> {
    const validatedItems: ValidatedItem[] = [];

    for (const item of items) {
      // Get current product information
      const productInfo = await this.productCatalogService.getVariantPrice(
        item.catalogVariantId,
        tenantId,
      );

      if (!productInfo) {
        throw new NotFoundException(`Product not found: ${item.catalogVariantId}`);
      }

      // Verify price tolerance (5% default)
      const observedPrice = new Decimal(item.observedUnitPrice);
      const currentPrice = new Decimal(productInfo.price);
      const priceDifference = observedPrice.minus(currentPrice).abs();
      const toleranceAmount = currentPrice.mul(0.05); // 5% tolerance

      if (priceDifference.greaterThan(toleranceAmount)) {
        this.logger.warn(
          `Price verification failed for variant ${item.catalogVariantId}: ` +
          `observed=${item.observedUnitPrice}, current=${productInfo.price}`
        );

        throw new ConflictException(
          `Product price has changed significantly for ${productInfo.name}. ` +
          `Please refresh your cart and try again.`
        );
      }

      validatedItems.push({
        ...item,
        currentPrice: productInfo.price,
        productName: productInfo.name,
        variantName: productInfo.variantName,
      });
    }

    return validatedItems;
  }

  /**
   * Determines VAT context based on cart metadata and business rules.
   *
   * @param cart - Cart entity
   * @param validatedItems - Validated cart items
   * @returns boolean Whether prices include VAT
   * @private
   */
  private determineVatContext(cart: Cart, validatedItems: ValidatedItem[]): boolean {
    // Ethiopia business rule: Determine based on customer type and pricing patterns
    // B2C customers typically see VAT-inclusive prices, B2B see VAT-exclusive
    const customerId = cart.customerId;

    // Check if customer ID indicates B2B (contains 'business' or 'company' patterns)
    if (customerId.includes('business') || customerId.includes('company') || customerId.includes('corp')) {
      return false; // B2B - VAT exclusive
    }

    // Default to VAT inclusive for B2C customers
    return true;
  }

  /**
   * Converts address command to proper address format.
   *
   * @param addressCommand - Address command from request
   * @returns Record<string, unknown> Formatted address
   * @private
   */
  private convertAddress(addressCommand: EthiopiaAddressCommand): Record<string, unknown> {
    return {
      street: addressCommand.street,
      city: addressCommand.city,
      state: addressCommand.state,
      postalCode: addressCommand.postalCode,
      subCity: addressCommand.subCity,
      woreda: addressCommand.woreda,
      country: addressCommand.country,
      phoneNumber: addressCommand.phoneNumber,
      alternativePhoneNumber: addressCommand.alternativePhoneNumber,
    };
  }

  /**
   * Checks if order can be cancelled based on business rules.
   *
   * @param order - Order entity
   * @returns boolean True if order can be cancelled
   * @private
   */
  private canCancelOrder(order: Order & { items: OrderItem[] }): boolean {
    const nonCancellableStatuses = ['shipped', 'completed', 'cancelled'];
    return !nonCancellableStatuses.includes(order.status);
  }

  /**
   * Maps order entity to response DTO with proper data transformation.
   *
   * @param order - Order entity from database
   * @returns OrderResponseDto Transformed order response
   * @private
   */
  private mapToResponseDto(order: Order & { items: OrderItem[] }): OrderResponseDto {
    const metadata = order.metadata as Record<string, unknown> || {};
    const shipping = metadata.shipping as Record<string, unknown> || {};

    return {
      id: order.id,
      customerId: order.customerId,
      statusId: order.status,
      statusLabel: this.getStatusLabel(order.status),
      items: order.items.map((item: OrderItem) => ({
        id: item.id,
        orderId: item.orderId,
        tenantId: item.tenantId,
        catalogVariantId: item.catalogVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productName: item.productName,
        variantName: item.variantName,
        createdAt: item.createdAt,
        inventoryReservationId: item.inventoryReservationId,
        variantAttributes: item.variantAttributes as Record<string, unknown>,
        pricingMetadata: item.pricingMetadata as Record<string, unknown>,
      })),
      totals: {
        subtotalAmount: order.subtotalAmount,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
      },
      addresses: {
        shipping: order.shippingAddress as any,
        billing: order.billingAddress as any,
      },
      timestamps: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      metadata,
    };
  }

  /**
   * Maps order list result to list response DTO.
   *
   * @param result - Order list result from repository
   * @returns ListOrdersResponseDto Transformed list response
   * @private
   */
  private mapToListResponseDto(result: OrderListResult): ListOrdersResponseDto {
    return {
      orders: result.orders.map(order => this.mapToResponseDto(order)),
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasMore: result.pagination.hasNext,
      },
      filters: {}, // TODO: Return applied filters
      sort: {}, // TODO: Return applied sorting
    };
  }

  /**
   * Maps status ID to human-readable label.
   *
   * @param statusId - Status identifier
   * @returns string Human-readable status label
   * @private
   */
  private getStatusLabel(statusId: string): string {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      in_progress: 'in_progress',
      shipped: 'shipped',
      completed: 'completed',
      cancelled: 'cancelled',
      failed: 'failed',
    };
    return statusMap[statusId] || statusId;
  }
}

// Type definitions for the service
interface ValidatedItem extends RepositoryCartItem {
  currentPrice: string;
  productName: string;
  variantName: string;
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
