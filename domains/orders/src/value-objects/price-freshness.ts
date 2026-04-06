/**
 * Price freshness validator for marketplace pricing.
 *
 * @remarks
 * - **Scope:** price validation and staleness detection
 * - **Authority:** domain business rules only
 * - **Invariants:** prices have validity periods based on market conditions
 * - **Security:** prevents price manipulation through stale cart data
 */
export class PriceFreshnessValidator {
  private static readonly DEFAULT_FRESHNESS_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
  private static readonly EXTENDED_FRESHNESS_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Checks if cart item price is still fresh.
   *
   * @param cartCreatedAt - When cart was created
   * @param currentPrice - Current catalog price
   * @param observedPrice - Price captured when item was added to cart
   * @param isHighVolatility - Whether item has high price volatility
   * @returns Price freshness result
   *
   * @remarks
   * - Uses different thresholds for different product types
   * - High volatility items (imported parts) have shorter freshness
   * - Prevents checkout with outdated pricing
   */
  static validatePriceFreshness(params: {
    cartCreatedAt: Date;
    currentPrice: string;
    observedPrice: string;
    isHighVolatility?: boolean;
  }): {
    isFresh: boolean;
    priceChanged: boolean;
    recommendedAction: 'proceed' | 'warn' | 'block';
    priceDifference: number;
    freshnessThreshold: number;
  } {
    const now = new Date();
    const cartAge = now.getTime() - params.cartCreatedAt.getTime();

    // Use shorter threshold for high volatility items
    const threshold = params.isHighVolatility
      ? PriceFreshnessValidator.DEFAULT_FRESHNESS_THRESHOLD_MS
      : PriceFreshnessValidator.EXTENDED_FRESHNESS_THRESHOLD_MS;

    const isFresh = cartAge < threshold;
    const currentPriceNum = parseFloat(params.currentPrice);
    const observedPriceNum = parseFloat(params.observedPrice);
    const priceDifference = Math.abs(currentPriceNum - observedPriceNum);
    const priceChanged = currentPriceNum !== observedPriceNum;

    let recommendedAction: 'proceed' | 'warn' | 'block' = 'proceed';

    if (!isFresh && priceChanged) {
      recommendedAction = 'block';
    } else if (!isFresh || priceDifference > (currentPriceNum * 0.05)) { // 5% threshold
      recommendedAction = 'warn';
    }

    return {
      isFresh,
      priceChanged,
      recommendedAction,
      priceDifference,
      freshnessThreshold: threshold,
    };
  }

  /**
   * Determines if item has high price volatility.
   *
   * @param productCategory - Product category
   * @param isImported - Whether item is imported
   * @param supplierReliability - Supplier reliability score (0-1)
   * @returns True if item is high volatility
   *
   * @remarks
   * - Imported parts typically have higher volatility
   * - Lower supplier reliability increases volatility
   * - Used for freshness threshold calculation
   */
  static isHighVolatilityItem(params: {
    productCategory: string;
    isImported: boolean;
    supplierReliability: number;
  }): boolean {
    const highVolatilityCategories = [
      'engine_parts', 'electronics', 'sensors', 'imported_parts'
    ];

    const isHighVolatilityCategory = highVolatilityCategories.includes(params.productCategory);
    const isLowReliabilitySupplier = params.supplierReliability < 0.7;

    return params.isImported || isHighVolatilityCategory || isLowReliabilitySupplier;
  }
}
