import type {
  CustomerId,
  TenantId,
  CartId,
  CartItemId,
  CartQuantity,
  CurrencyAmount,
  CheckoutCatalogVariantId as CatalogVariantId
} from '@spareparts/contracts';
import { CartStatus } from './value-objects/cart-status';
import { DomainIdGenerator } from './value-objects/id-generator';
import { PriceFreshnessValidator } from './value-objects/price-freshness';

/**
 * Cart item value object with price tracking.
 *
 * @remarks
 * - **Scope:** cart composition
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** quantity is positive integer, price is stored as observed
 */
export interface CartItem {
  id: CartItemId;
  cartId: CartId;
  tenantId: TenantId;
  catalogVariantId: CatalogVariantId;
  quantity: CartQuantity;
  observedUnitPrice: CurrencyAmount;
  productName: string;
  variantName: string;
  priceCapturedAt: Date; // NEW: Track when price was captured
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Price freshness check result.
 *
 * @remarks
 * - **Scope:** price validation results
 * - **Authority:** domain only
 * - **Invariants:** results include actionable recommendations
 */
export interface PriceFreshnessResult {
  itemId: CartItemId;
  isFresh: boolean;
  priceChanged: boolean;
  recommendedAction: 'proceed' | 'warn' | 'block';
  priceDifference: number;
  currentPrice?: string;
  observedPrice: string;
}

/**
 * Cart aggregate root with price freshness tracking.
 *
 * @remarks
 * - **Scope:** customer cart management
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** items have positive quantities, totals are computed correctly
 * - **Security:** customer isolation, price manipulation prevention
 */
export interface CartAggregate {
  id: CartId;
  customerId?: CustomerId;
  sessionId?: string;
  status: CartStatus;
  items: CartItem[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart aggregate factory with business rule enforcement.
 *
 * @remarks
 * - **Threading/Async:** All methods are synchronous for domain logic
 * - **Side effects:** No external dependencies, pure domain logic
 * - **Tenancy:** Customer-scoped with tenant item isolation
 */
export class CartAggregateFactory {
  /**
   * Creates a new cart aggregate.
   *
   * @param params - Creation parameters
   * @returns New cart aggregate
   * @throws Error - If business rules are violated
   *
   * @remarks
   * - Initializes with active status
   * - Sets expiration for stale cart cleanup
   * - Enforces customer or session identification
   * - FIXED: Uses ULID generator for proper ID generation
   *
   * @example
   * ```ts
   * const cart = CartAggregateFactory.create({
   *   customerId: 'customer_123',
   *   expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
   * });
   * ```
   */
  static create(params: {
    customerId?: CustomerId;
    sessionId?: string;
    expiresAt?: Date;
  }): CartAggregate {
    if (!params.customerId && !params.sessionId) {
      throw new Error('Cart must have either customerId or sessionId');
    }

    const now = new Date();
    const defaultExpiration = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return {
      id: DomainIdGenerator.generateCartId(), // FIXED: Use ULID generator
      customerId: params.customerId,
      sessionId: params.sessionId,
      status: new CartStatus('ACTIVE', now),
      items: [],
      expiresAt: params.expiresAt || defaultExpiration,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Adds item to cart with business rule validation.
   *
   * @param cart - Cart aggregate
   * @param params - Item addition parameters
   * @returns Updated cart aggregate
   * @throws Error - If cart cannot be modified or business rules violated
   *
   * @remarks
   * - Validates cart is active and not expired
   * - Merges quantities for existing items
   * - Prevents price manipulation by using observed price
   * - Enforces tenant isolation
   * - FIXED: Tracks price capture timestamp for freshness validation
   */
  static addItem(cart: CartAggregate, params: {
    tenantId: TenantId;
    catalogVariantId: CatalogVariantId;
    quantity: CartQuantity;
    observedUnitPrice: CurrencyAmount;
    productName: string;
    variantName: string;
  }): CartAggregate {
    if (!cart.status.canBeConverted()) {
      throw new Error(`Cannot add items to cart with status: ${cart.status.value}`);
    }

    if (cart.expiresAt && cart.expiresAt < new Date()) {
      throw new Error('Cannot add items to expired cart');
    }

    if (params.quantity <= 0) {
      throw new Error('Item quantity must be positive');
    }

    const now = new Date();
    const existingItemIndex = cart.items.findIndex(
      item => item.catalogVariantId === params.catalogVariantId && item.tenantId === params.tenantId
    );

    let updatedItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Merge with existing item
      const existingItem = cart.items[existingItemIndex];
      if (!existingItem) {
        throw new Error(`Existing item not found at index ${existingItemIndex}`);
      }

      const updatedItem: CartItem = {
        ...existingItem,
        quantity: existingItem.quantity + params.quantity,
        updatedAt: now,
      };
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = updatedItem;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: DomainIdGenerator.generateCartItemId(), // FIXED: Use ULID generator
        cartId: cart.id,
        tenantId: params.tenantId,
        catalogVariantId: params.catalogVariantId,
        quantity: params.quantity,
        observedUnitPrice: params.observedUnitPrice,
        productName: params.productName,
        variantName: params.variantName,
        priceCapturedAt: now, // NEW: Track price capture time
        createdAt: now,
        updatedAt: now,
      };
      updatedItems = [...cart.items, newItem];
    }

    return {
      ...cart,
      items: updatedItems,
      updatedAt: now,
    };
  }

  /**
   * Removes item from cart.
   *
   * @param cart - Cart aggregate
   * @param itemId - Item ID to remove
   * @returns Updated cart aggregate
   * @throws Error - If cart cannot be modified or item not found
   *
   * @remarks
   * - Validates cart is active
   * - Prevents removal of non-existent items
   * - Maintains cart integrity
   */
  static removeItem(cart: CartAggregate, itemId: CartItemId): CartAggregate {
    if (!cart.status.canBeConverted()) {
      throw new Error(`Cannot remove items from cart with status: ${cart.status.value}`);
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex < 0) {
      throw new Error(`Item not found in cart: ${itemId}`);
    }

    const updatedItems = cart.items.filter(item => item.id !== itemId);

    return {
      ...cart,
      items: updatedItems,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates item quantity with validation.
   *
   * @param cart - Cart aggregate
   * @param itemId - Item ID to update
   * @param newQuantity - New quantity value
   * @returns Updated cart aggregate
   * @throws Error - If cart cannot be modified or business rules violated
   *
   * @remarks
   * - Validates cart is active
   * - Prevents zero or negative quantities
   * - Removes item if quantity becomes zero
   */
  static updateItemQuantity(cart: CartAggregate, itemId: CartItemId, newQuantity: CartQuantity): CartAggregate {
    if (!cart.status.canBeConverted()) {
      throw new Error(`Cannot update items in cart with status: ${cart.status.value}`);
    }

    if (newQuantity <= 0) {
      return this.removeItem(cart, itemId);
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex < 0) {
      throw new Error(`Item not found in cart: ${itemId}`);
    }

    const existingItem = cart.items[itemIndex];
    if (!existingItem) {
      throw new Error(`Item not found at index ${itemIndex}`);
    }

    const updatedItems = [...cart.items];
    updatedItems[itemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      updatedAt: new Date(),
    };

    return {
      ...cart,
      items: updatedItems,
      updatedAt: new Date(),
    };
  }

  /**
   * Calculates cart totals with currency precision.
   *
   * @param cart - Cart aggregate
   * @returns Cart totals
   *
   * @remarks
   * - Computes subtotal with proper decimal handling
   * - Returns item count for UI display
   * - Uses observed prices (not live prices)
   */
  static calculateTotals(cart: CartAggregate): {
    itemCount: number;
    subtotalAmount: CurrencyAmount;
  } {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const subtotalCents = cart.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.observedUnitPrice) * item.quantity;
      return sum + Math.round(itemTotal * 100); // Convert to cents for precision
    }, 0);

    const subtotalAmount = (subtotalCents / 100).toFixed(2);

    return {
      itemCount,
      subtotalAmount,
    };
  }

  /**
   * Validates price freshness for all cart items.
   *
   * @param cart - Cart aggregate
   * @param getCurrentPrice - Function to get current catalog price
   * @param getItemMetadata - Function to get item metadata for volatility assessment
   * @returns Price freshness validation results
   *
   * @remarks
   * - NEW: Validates all cart items for price freshness
   * - Uses different thresholds for different product types
   * - Provides actionable recommendations for checkout
   */
  static validatePriceFreshness(
    cart: CartAggregate,
    getCurrentPrice: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<string>,
    getItemMetadata: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<{
      productCategory: string;
      isImported: boolean;
      supplierReliability: number;
    }>
  ): Promise<PriceFreshnessResult[]> {
    return Promise.all(
      cart.items.map(async (item) => {
        const currentPrice = await getCurrentPrice(item.tenantId, item.catalogVariantId);
        const metadata = await getItemMetadata(item.tenantId, item.catalogVariantId);

        const isHighVolatility = PriceFreshnessValidator.isHighVolatilityItem(metadata);
        const freshness = PriceFreshnessValidator.validatePriceFreshness({
          cartCreatedAt: cart.createdAt,
          currentPrice,
          observedPrice: item.observedUnitPrice,
          isHighVolatility,
        });

        return {
          itemId: item.id,
          isFresh: freshness.isFresh,
          priceChanged: freshness.priceChanged,
          recommendedAction: freshness.recommendedAction,
          priceDifference: freshness.priceDifference,
          currentPrice,
          observedPrice: item.observedUnitPrice,
        };
      })
    );
  }

  /**
   * Checks if cart is ready for conversion to order.
   *
   * @param cart - Cart aggregate
   * @param priceFreshnessResults - Optional price freshness validation results
   * @returns True if cart can be converted
   *
   * @remarks
   * - Validates cart has items
   * - Checks cart is in active state
   * - Ensures cart is not expired
   * - NEW: Optionally checks price freshness
   */
  static canBeConverted(
    cart: CartAggregate,
    priceFreshnessResults?: PriceFreshnessResult[]
  ): boolean {
    if (!cart.status.canBeConverted()) {
      return false;
    }

    if (cart.items.length === 0) {
      return false;
    }

    if (cart.expiresAt && cart.expiresAt < new Date()) {
      return false;
    }

    // NEW: Check price freshness if provided
    if (priceFreshnessResults) {
      const hasBlockedItems = priceFreshnessResults.some(
        result => result.recommendedAction === 'block'
      );
      if (hasBlockedItems) {
        return false;
      }
    }

    return true;
  }

  /**
   * Transitions cart status with validation.
   *
   * @param cart - Cart aggregate
   * @param newStatus - New status code
   * @param initiatedBy - Who initiated the transition
   * @returns Updated cart aggregate
   * @throws Error - If transition is not allowed
   *
   * @remarks
   * - Enforces state machine rules
   * - Creates audit trail context
   * - Prevents unauthorized status changes
   */
  static transitionStatus(cart: CartAggregate, newStatus: string, initiatedBy: string): CartAggregate {
    const updatedStatus = cart.status.transitionTo(newStatus, initiatedBy);

    return {
      ...cart,
      status: updatedStatus,
      updatedAt: new Date(),
    };
  }
}
