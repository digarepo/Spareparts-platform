import { z } from 'zod';
import {
  CatalogVariantIdSchema,
  InventoryTenantIdSchema
} from './identifiers';
import { InventoryQuantityBreakdownSchema } from './quantities';

/**
 * Sellability decision enumeration.
 *
 * @remarks
 * - Defines possible sellability outcomes
 * - Used for catalog and inventory integration
 * - Supports business rule evaluation
 */
export const SellabilityDecisionSchema = z.enum([
  'sellable',
  'not_sellable',
  'restricted',
  'unknown',
]);
export type SellabilityDecision = z.infer<typeof SellabilityDecisionSchema>;

/**
 * Sellability reason enumeration.
 *
 * @remarks
 * - Defines why a variant is or isn't sellable
 * - Used for debugging and user communication
 * - Supports business rule transparency
 */
export const SellabilityReasonSchema = z.enum([
  'sufficient_inventory',
  'low_inventory',
  'out_of_stock',
  'not_active',
  'restricted_catalog',
  'restricted_pricing',
  'business_rule',
  'system_error',
]);
export type SellabilityReason = z.infer<typeof SellabilityReasonSchema>;

/**
 * Sellability evaluation request schema.
 *
 * @remarks
 * - Requests sellability decision for a variant
 * - Includes context for evaluation
 * - Used by catalog and ordering systems
 */
export const SellabilityEvaluationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantId: CatalogVariantIdSchema,
  context: z.object({
    /** Requesting system or user */
    requestedBy: z.string(),

    /** Additional context for evaluation */
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type SellabilityEvaluationRequest = z.infer<typeof SellabilityEvaluationRequestSchema>;

/**
 * Sellability evaluation response schema.
 *
 * @remarks
 * - Returns sellability decision and reasoning
 * - Includes inventory state for transparency
 * - Provides actionable information
 */
export const SellabilityEvaluationResponseSchema = z.object({
  decision: SellabilityDecisionSchema,
  reason: SellabilityReasonSchema,
  inventoryState: InventoryQuantityBreakdownSchema,
  context: z.object({
    canFulfillImmediately: z.boolean(),
    estimatedRestockDate: z.date().optional(),
    minimumOrderQuantity: z.number().int().min(1).optional(),
    maximumOrderQuantity: z.number().int().min(1).optional(),
  }).optional(),
  evaluatedAt: z.date(),
  validUntil: z.date().optional(),
  warnings: z.array(z.string()).optional(),
});
export type SellabilityEvaluationResponse = z.infer<typeof SellabilityEvaluationResponseSchema>;

/**
 * Bulk sellability evaluation request schema.
 *
 * @remarks
 * - Evaluates sellability for multiple variants
 * - Optimized for catalog page loads
 * - Supports batch processing
 */
export const BulkSellabilityEvaluationRequestSchema = z.object({
  tenantId: InventoryTenantIdSchema,
  catalogVariantIds: z.array(CatalogVariantIdSchema)
    .min(1, 'At least one variant ID is required')
    .max(50, 'Cannot exceed 50 variants per request'),
  context: z.object({
    requestedBy: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type BulkSellabilityEvaluationRequest = z.infer<typeof BulkSellabilityEvaluationRequestSchema>;

/**
 * Bulk sellability evaluation response schema.
 *
 * @remarks
 * - Returns sellability decisions for all variants
 * - Includes summary statistics
 * - Optimized for catalog display
 */
export const BulkSellabilityEvaluationResponseSchema = z.object({
  results: z.array(z.object({
    catalogVariantId: CatalogVariantIdSchema,
    decision: SellabilityDecisionSchema,
    reason: SellabilityReasonSchema,
    inventoryState: InventoryQuantityBreakdownSchema,
    canFulfillImmediately: z.boolean(),
    warnings: z.array(z.string()).optional(),
  })),
  summary: z.object({
    totalVariants: z.number().int(),
    sellableCount: z.number().int(),
    notSellableCount: z.number().int(),
    restrictedCount: z.number().int(),
    outOfStockCount: z.number().int(),
  }),
  evaluatedAt: z.date(),
});
export type BulkSellabilityEvaluationResponse = z.infer<typeof BulkSellabilityEvaluationResponseSchema>;

/**
 * Sellability rule configuration schema.
 *
 * @remarks
 * - Defines business rules for sellability evaluation
 * - Supports configurable decision logic
 * - Used for rule management and testing
 */
export const SellabilityRuleConfigSchema = z.object({
  minimumAvailableQuantity: z.number().int().min(0).default(1),
  lowStockThreshold: z.number().int().min(0).default(5),
  maxOrderPercentage: z.number().int().min(1).max(100).default(100),
  allowBackorders: z.boolean().default(false),
  ruleOverrides: z.array(z.object({
    catalogVariantId: CatalogVariantIdSchema,
    decision: SellabilityDecisionSchema,
    reason: SellabilityReasonSchema,
    expiresAt: z.date().optional(),
  })).optional(),
});
export type SellabilityRuleConfig = z.infer<typeof SellabilityRuleConfigSchema>;
