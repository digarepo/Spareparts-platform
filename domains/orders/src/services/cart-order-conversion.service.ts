import type {
  TenantId,
  CheckoutCatalogVariantId as CatalogVariantId,
} from '@spareparts/contracts';
import { CartAggregate, CartAggregateFactory, PriceFreshnessResult } from '../cart.aggregate';
import { OrderAggregate, OrderAggregateFactory } from '../order.aggregate';

/**
 * Cart to order conversion service with inventory integration.
 *
 * @remarks
 * - **Scope:** checkout process orchestration
 * - **Authority:** domain business rules only
 * - **Invariants:** conversion is atomic and consistent
 * - **Security:** prevents conversion of invalid carts
 */
export class CartOrderConversionService {
  /**
   * Converts cart to order with inventory reservation.
   *
   * @param params - Conversion parameters
   * @returns Conversion result with order and reservation details
   * @throws Error - If conversion business rules are violated
   *
   * @remarks
   * - Validates cart readiness for conversion
   * - Creates inventory reservations for all items
   * - Captures pricing snapshots at conversion time
   * - Links order to Phase 4 inventory reservations
   * - FIXED: Handles reservation race conditions with compensating actions
   *
   * @example
   * ```ts
   * const result = await CartOrderConversionService.convertToOrder({
   *   cart,
   *   shippingAddress,
   *   billingAddress,
   *   createInventoryReservation,
   *   getCurrentPrice,
   *   getItemMetadata
   * });
   * ```
   */
  static async convertToOrder(params: {
    cart: CartAggregate;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode?: string;
      subCity?: string;
      woreda?: string;
      country: string;
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode?: string;
      subCity?: string;
      woreda?: string;
      country: string;
    };
    createInventoryReservation: (params: {
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      quantity: number;
      purpose: string;
      referenceId: string;
    }) => Promise<{
      id: string;
      expiresAt: Date;
    }>;
    cancelInventoryReservation: (reservationId: string) => Promise<void>;
    getCurrentPrice: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<string>;
    getItemMetadata: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<{
      productCategory: string;
      isImported: boolean;
      supplierReliability: number;
    }>;
    initiatedBy: string;
  }): Promise<{
    order: OrderAggregate;
    reservations: Array<{
      id: string;
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      quantity: number;
      expiresAt: Date;
    }>;
    priceFreshnessResults: PriceFreshnessResult[];
  }> {
    const { cart, shippingAddress, billingAddress, initiatedBy } = params;

    // Step 1: Validate cart can be converted
    if (!cart.customerId) {
      throw new Error('Cart must have a customer to convert to order');
    }

    // Step 2: Validate price freshness
    const priceFreshnessResults = await CartAggregateFactory.validatePriceFreshness(
      cart,
      params.getCurrentPrice,
      params.getItemMetadata
    );

    if (!CartAggregateFactory.canBeConverted(cart, priceFreshnessResults)) {
      const blockedItems = priceFreshnessResults.filter(r => r.recommendedAction === 'block');
      throw new Error(
        `Cannot convert cart to order. ${blockedItems.length} items have stale prices or other issues.`
      );
    }

    // Step 3: Create inventory reservations with race condition handling
    const reservations: Array<{
      id: string;
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      quantity: number;
      expiresAt: Date;
    }> = [];

    const successfulReservationIds: string[] = [];

    try {
      for (const item of cart.items) {
        try {
          const reservation = await params.createInventoryReservation({
            tenantId: item.tenantId,
            catalogVariantId: item.catalogVariantId,
            quantity: item.quantity,
            purpose: 'order',
            referenceId: cart.id, // Reference the cart for audit
          });

          const reservationData = {
            id: reservation.id,
            tenantId: item.tenantId,
            catalogVariantId: item.catalogVariantId,
            quantity: item.quantity,
            expiresAt: reservation.expiresAt,
          };

          reservations.push(reservationData);
          successfulReservationIds.push(reservation.id);
        } catch (error) {
          // FIXED: Compensating action - cancel all successful reservations
          await Promise.all(
            successfulReservationIds.map(async (reservationId) => {
              try {
                await params.cancelInventoryReservation(reservationId);
              } catch (cancelError) {
                // Log the cancellation error but don't fail the main operation
                console.error(`Failed to cancel reservation ${reservationId}:`, cancelError);
              }
            })
          );

          throw new Error(
            `Failed to create inventory reservation for item ${item.catalogVariantId}: ${(error as Error).message}. All reservations have been cancelled.`
          );
        }
      }

      // Step 4: Create order with reservation links
      const orderItems = cart.items.map((item) => {
        const reservation = reservations.find(r =>
          r.tenantId === item.tenantId && r.catalogVariantId === item.catalogVariantId
        );

        return {
          tenantId: item.tenantId,
          catalogVariantId: item.catalogVariantId,
          inventoryReservationId: reservation?.id,
          quantity: item.quantity,
          unitPrice: item.observedUnitPrice,
          productName: item.productName,
          variantName: item.variantName,
          variantAttributes: undefined, // TODO: Get from catalog if needed
          pricingMetadata: {
            priceCapturedAt: item.priceCapturedAt.toISOString(),
            originalCartItemId: item.id,
          },
        };
      });

      const order = OrderAggregateFactory.create({
        customerId: cart.customerId!,
        items: orderItems,
        shippingAddress,
        billingAddress,
        metadata: {
          convertedFromCartId: cart.id,
          conversionTimestamp: new Date().toISOString(),
          priceValidationResults: priceFreshnessResults,
        },
      });

      return {
        order,
        reservations,
        priceFreshnessResults,
      };
    } catch (error) {
      // If we fail after creating reservations but before creating order,
      // ensure all reservations are cancelled
      if (successfulReservationIds.length > 0) {
        await Promise.all(
          successfulReservationIds.map(async (reservationId) => {
            try {
              await params.cancelInventoryReservation(reservationId);
            } catch (cancelError) {
              console.error(`Failed to cancel reservation ${reservationId} during error cleanup:`, cancelError);
            }
          })
        );
      }
      throw error;
    }
  }

  /**
   * Validates cart readiness for conversion without creating order.
   *
   * @param params - Validation parameters
   * @returns Validation results with recommendations
   *
   * @remarks
   * - Used for pre-checkout validation
   * - Provides actionable feedback to users
   * - Does not create any side effects
   */
  static async validateConversionReadiness(params: {
    cart: CartAggregate;
    getCurrentPrice: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<string>;
    getItemMetadata: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<{
      productCategory: string;
      isImported: boolean;
      supplierReliability: number;
    }>;
  }): Promise<{
    canConvert: boolean;
    issues: Array<{
      type: 'error' | 'warning';
      message: string;
      itemId?: string;
      recommendation: string;
    }>;
    priceFreshnessResults: PriceFreshnessResult[];
  }> {
    const { cart } = params;

    const issues: Array<{
      type: 'error' | 'warning';
      message: string;
      itemId?: string;
      recommendation: string;
    }> = [];

    // Check basic cart requirements
    if (!cart.customerId) {
      issues.push({
        type: 'error',
        message: 'Cart must have a customer',
        recommendation: 'Please sign in to complete your order',
      });
    }

    if (cart.items.length === 0) {
      issues.push({
        type: 'error',
        message: 'Cart is empty',
        recommendation: 'Add items to your cart to continue',
      });
    }

    if (cart.expiresAt && cart.expiresAt < new Date()) {
      issues.push({
        type: 'error',
        message: 'Cart has expired',
        recommendation: 'Please add items again to create a new cart',
      });
    }

    // Validate price freshness
    const priceFreshnessResults = await CartAggregateFactory.validatePriceFreshness(
      cart,
      params.getCurrentPrice,
      params.getItemMetadata
    );

    priceFreshnessResults.forEach((result) => {
      if (result.recommendedAction === 'block') {
        issues.push({
          type: 'error',
          message: `Price has changed significantly for item`,
          itemId: result.itemId,
          recommendation: 'Please review the updated price before proceeding',
        });
      } else if (result.recommendedAction === 'warn') {
        issues.push({
          type: 'warning',
          message: `Price may be stale for item`,
          itemId: result.itemId,
          recommendation: 'Consider refreshing the cart for the most current pricing',
        });
      }
    });

    const canConvert = issues.filter(i => i.type === 'error').length === 0;

    return {
      canConvert,
      issues,
      priceFreshnessResults,
    };
  }
}
