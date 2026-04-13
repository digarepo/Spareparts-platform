import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CartRepository, Cart, CartStatus } from '../repositories/cart.repository';
import { ProductCatalogService, ProductVariantInfo } from '../../catalog/services/product-catalog.service';
import { AddCartItemCommand } from '../dto/commands/add-cart-item.command';
import { GetCartQuery, GetCustomerCartsQuery } from '../dto/queries/get-cart.query';
import { CartResponseDto } from '../dto/responses/cart-response.dto';
import { Decimal } from 'decimal.js';

/**
 * Cart service with production-grade cart management and financial precision.
 *
 * @remarks
 * - **Scope:** Cart CRUD operations with price verification and decimal math
 * - **Authority:** Customer cart operations with tenant isolation
 * - **Invariants:** Cart totals calculated with precision, prices verified against source of truth
 * - **Security:** Price verification, customer ownership verification, tenant isolation enforced
 * - **Performance:** Optimized for high-frequency cart operations with proper error handling
 */
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productCatalogService: ProductCatalogService,
  ) {}

  /**
   * Adds an item to the customer's cart with price verification and inventory validation.
   *
   * @param command - The add cart item command with all required fields
   * @returns Promise<CartResponseDto> Updated cart with new item
   * @throws {NotFoundException} When cart or product variant not found
   * @throws {ConflictException} When insufficient inventory available
   * @throws {BadRequestException} When price verification fails or cart is invalid
   */
  async addItemToCart(command: AddCartItemCommand): Promise<CartResponseDto> {
    this.logger.debug(`Adding item to cart: ${command.cartId} for customer: ${command.customerId}`);

    // Validate cart exists and belongs to customer
    const cart = await this.validateCartAccess(command.cartId, command.customerId, command.tenantId);
    this.validateCartStatus(cart);

    // Get current product information for verification
    const productInfo = await this.getProductInfo(command.catalogVariantId, command.tenantId);

    // Verify price within tolerance
    this.verifyPriceTolerance(
      command.observedUnitPrice,
      productInfo.price,
      command.priceTolerancePercentage,
      command.catalogVariantId,
    );

    // Use verified current price and product names
    const verifiedPrice = productInfo.price;
    const verifiedProductName = productInfo.name || command.productName;
    const verifiedVariantName = productInfo.variantName || command.variantName;

    // Add item to cart with inventory check
    const updatedCart = await this.cartRepository.addItem({
      cartId: command.cartId,
      tenantId: command.tenantId,
      catalogVariantId: command.catalogVariantId,
      quantity: command.quantity,
      observedUnitPrice: verifiedPrice,
      productName: verifiedProductName,
      variantName: verifiedVariantName,
      metadata: this.buildItemMetadata(command, verifiedPrice),
    });

    this.logger.log(`Successfully added item to cart: ${command.cartId}`);
    return this.mapToResponseDto(updatedCart);
  }

  /**
   * Retrieves a cart by ID with customer ownership verification.
   *
   * @param query - The get cart query with identification fields
   * @returns Promise<CartResponseDto> Cart with items and totals
   * @throws {NotFoundException} When cart not found or access denied
   */
  async getCart(query: GetCartQuery): Promise<CartResponseDto> {
    this.logger.debug(`Retrieving cart: ${query.cartId} for customer: ${query.customerId}`);

    const cart = await this.validateCartAccess(query.cartId, query.customerId, query.tenantId);

    // Check if expired carts should be included
    if (!query.includeExpired && cart.statusId === 'status_expired') {
      throw new NotFoundException(`Cart has expired: ${query.cartId}`);
    }

    this.logger.debug(`Successfully retrieved cart: ${query.cartId}`);
    return this.mapToResponseDto(cart);
  }

  /**
   * Retrieves all carts for a customer with optional filtering.
   *
   * @param query - The get customer carts query with filters
   * @returns Promise<CartResponseDto[]> Array of customer carts
   */
  async getCustomerCarts(query: GetCustomerCartsQuery): Promise<CartResponseDto[]> {
    this.logger.debug(`Retrieving carts for customer: ${query.customerId}`);

    const carts = await this.cartRepository.findByCustomerId(
      query.customerId,
      query.tenantId,
      {
        status: query.status,
        limit: query.limit,
      },
    );

    this.logger.debug(`Retrieved ${carts.length} carts for customer: ${query.customerId}`);
    return carts.map(cart => this.mapToResponseDto(cart));
  }

  /**
   * Removes an item from the customer's cart.
   *
   * @param cartId - Cart identifier
   * @param itemId - Item identifier to remove
   * @param customerId - Customer identifier for ownership verification
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<CartResponseDto> Updated cart without the removed item
   * @throws {NotFoundException} When cart or item not found
   */
  async removeItemFromCart(
    cartId: string,
    itemId: string,
    customerId: string,
    tenantId: string,
  ): Promise<CartResponseDto> {
    this.logger.debug(`Removing item ${itemId} from cart: ${cartId}`);

    await this.validateCartAccess(cartId, customerId, tenantId);

    const updatedCart = await this.cartRepository.removeItem(cartId, itemId, tenantId);

    this.logger.log(`Successfully removed item from cart: ${cartId}`);
    return this.mapToResponseDto(updatedCart);
  }

  /**
   * Clears all items from the customer's cart.
   *
   * @param cartId - Cart identifier
   * @param customerId - Customer identifier for ownership verification
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<CartResponseDto> Empty cart
   * @throws {NotFoundException} When cart not found
   */
  async clearCart(cartId: string, customerId: string, tenantId: string): Promise<CartResponseDto> {
    this.logger.debug(`Clearing cart: ${cartId}`);

    await this.validateCartAccess(cartId, customerId, tenantId);

    const updatedCart = await this.cartRepository.clearItems(cartId, tenantId);

    this.logger.log(`Successfully cleared cart: ${cartId}`);
    return this.mapToResponseDto(updatedCart);
  }

  /**
   * Validates cart access and ownership.
   *
   * @param cartId - Cart identifier
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<Cart> Validated cart entity
   * @throws {NotFoundException} When cart not found or access denied
   * @private
   */
  private async validateCartAccess(
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

    return cart;
  }

  /**
   * Validates cart status for item operations.
   *
   * @param cart - Cart entity to validate
   * @throws {ConflictException} When cart status doesn't allow item operations
   * @private
   */
  private validateCartStatus(cart: Cart): void {
    const invalidStatuses = ['status_expired', 'status_converted'];

    if (invalidStatuses.includes(cart.statusId)) {
      throw new ConflictException(`Cannot add items to ${cart.statusId} cart`);
    }
  }

  /**
   * Gets product information with proper error handling.
   *
   * @param variantId - Product variant identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<ProductVariantInfo> Product information
   * @throws {NotFoundException} When product variant not found
   * @private
   */
  private async getProductInfo(
    variantId: string,
    tenantId: string,
  ): Promise<ProductVariantInfo> {
    const productInfo = await this.productCatalogService.getVariantPrice(variantId, tenantId);

    if (!productInfo) {
      throw new NotFoundException(`Product variant not found: ${variantId}`);
    }

    return productInfo;
  }

  /**
   * Verifies price tolerance and throws appropriate error if exceeded.
   *
   * @param observedPrice - Price observed by client
   * @param currentPrice - Current price from catalog
   * @param tolerancePercentage - Allowed tolerance percentage
   * @param variantId - Variant ID for logging
   * @throws {BadRequestException} When price verification fails
   * @private
   */
  private verifyPriceTolerance(
    observedPrice: string,
    currentPrice: string,
    tolerancePercentage: number | undefined,
    variantId: string,
  ): void {
    const tolerance = tolerancePercentage || 5; // Default 5%
    const observed = new Decimal(observedPrice);
    const current = new Decimal(currentPrice);
    const priceDifference = observed.minus(current).abs();
    const toleranceAmount = current.mul(tolerance / 100);

    if (priceDifference.greaterThan(toleranceAmount)) {
      this.logger.warn(
        `Price verification failed for variant ${variantId}: ` +
        `observed=${observedPrice}, current=${currentPrice}, tolerance=${tolerance}%`
      );

      throw new BadRequestException(
        `Product price has changed significantly. ` +
        `Current price: ${currentPrice}. Please refresh and try again.`
      );
    }
  }

  /**
   * Builds item metadata with verification information.
   *
   * @param command - Add cart item command
   * @param verifiedPrice - Verified price from catalog
   * @returns Record<string, unknown> Enhanced metadata
   * @private
   */
  private buildItemMetadata(
    command: AddCartItemCommand,
    verifiedPrice: string,
  ): Record<string, unknown> {
    return {
      ...command.metadata,
      priceVerified: true,
      originalObservedPrice: command.observedUnitPrice,
      verifiedPrice,
      priceVerificationTime: new Date().toISOString(),
      ipAddress: command.ipAddress,
    };
  }

  /**
   * Maps a cart entity to response DTO with precise decimal calculations.
   *
   * @param cart - Cart entity from database
   * @returns CartResponseDto Transformed cart response with precise totals
   * @private
   */
  private mapToResponseDto(cart: Cart): CartResponseDto {
    const totals = this.calculateCartTotals(cart.items);

    return {
      id: cart.id,
      customerId: cart.customerId,
      statusId: cart.statusId,
      statusLabel: this.getStatusLabel(cart.statusId),
      items: cart.items.map(item => ({
        id: item.id,
        cartId: item.cartId,
        tenantId: item.tenantId,
        catalogVariantId: item.catalogVariantId,
        quantity: item.quantity,
        observedUnitPrice: item.observedUnitPrice,
        productName: item.productName,
        variantName: item.variantName,
        metadata: item.metadata,
        addedAt: item.addedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      totals,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Calculates cart totals using Decimal.js for precision.
   *
   * @param items - Cart items array
   * @returns CartTotals Calculated totals with precision
   * @private
   */
  private calculateCartTotals(items: Cart['items']): CartTotals {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const subtotalAmount = items.reduce(
      (sum, item) => {
        const itemTotal = new Decimal(item.observedUnitPrice).times(item.quantity);
        return sum.plus(itemTotal);
      },
      new Decimal(0)
    );

    return {
      itemCount,
      subtotalAmount: subtotalAmount.toFixed(2),
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
      'status_active': 'active',
      'status_expired': 'expired',
      'status_converted': 'converted',
      'status_abandoned': 'abandoned',
    };
    return statusMap[statusId] || statusId;
  }
}

/**
 * Cart totals interface for type safety.
 */
interface CartTotals {
  itemCount: number;
  subtotalAmount: string;
}
