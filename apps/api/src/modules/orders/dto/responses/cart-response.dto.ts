import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsObject, IsArray, IsOptional, ValidateNested } from 'class-validator';
import type { CartResponse as CartResponseContract } from '@spareparts/contracts/checkout';

/**
 * Cart item response DTO with comprehensive product information.
 *
 * @remarks
 * - **Scope:** Read-only cart item representation
 * - **Authority:** Customer ownership verification required
 * - **Invariants:** Price snapshots preserved at time of addition
 * - **Security:** Sensitive fields filtered based on user context
 */
export class CartItemResponseDto {
  @ApiProperty({
    description: 'Cart item unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Cart item ID must be a string' })
  id!: string;

  @ApiProperty({
    description: 'Cart identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Cart ID must be a string' })
  cartId!: string;

  @ApiProperty({
    description: 'Tenant identifier',
    example: 'tenant_123456789',
  })
  @IsString({ message: 'Tenant ID must be a string' })
  tenantId!: string;

  @ApiProperty({
    description: 'Catalog variant identifier',
    example: 'variant_123456789',
  })
  @IsString({ message: 'Catalog variant ID must be a string' })
  catalogVariantId!: string;

  @ApiProperty({
    description: 'Product name at time of addition',
    example: 'Brake Pad Set - Front',
  })
  @IsString({ message: 'Product name must be a string' })
  productName!: string;

  @ApiProperty({
    description: 'Variant name at time of addition',
    example: 'Premium Ceramic',
  })
  @IsString({ message: 'Variant name must be a string' })
  variantName!: string;

  @ApiProperty({
    description: 'Quantity of items in cart',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price at time of addition (decimal string)',
    example: '1500.50',
  })
  @IsString({ message: 'Observed unit price must be a string' })
  observedUnitPrice!: string;

  @ApiPropertyOptional({
    description: 'Item metadata for processing and analytics',
    example: { source: 'product_listing', promotion: 'spring_sale' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'Timestamp when item was added to cart',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate({ message: 'Added at must be a date' })
  @Type(() => Date)
  addedAt!: Date;

  @ApiProperty({
    description: 'Timestamp when item was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate({ message: 'Created at must be a date' })
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when item was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate({ message: 'Updated at must be a date' })
  @Type(() => Date)
  updatedAt!: Date;
}

/**
 * Cart response DTO with comprehensive cart information and item details.
 *
 * @remarks
 * - **Scope:** Complete cart representation for customer and system use
 * - **Authority:** Customer ownership verification required
 * - **Invariants:** Total calculations are consistent with item prices
 * - **Security:** Customer ID filtered based on authentication context
 * - **Performance:** Optimized for cart listing and detail views
 */
export class CartResponseDto implements CartResponseContract {
  @ApiProperty({
    description: 'Cart unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Cart ID must be a string' })
  id!: string;

  @ApiPropertyOptional({
    description: 'Customer identifier (filtered based on authentication)',
    example: 'customer_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  customerId?: string;

  @ApiProperty({
    description: 'Cart status identifier',
    example: 'status_active',
  })
  @IsString({ message: 'Status ID must be a string' })
  statusId!: string;

  @ApiProperty({
    description: 'Cart status label',
    example: 'active',
  })
  @IsString({ message: 'Status label must be a string' })
  statusLabel!: string;

  @ApiProperty({
    description: 'Cart items with product details and pricing',
    type: [CartItemResponseDto],
  })
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true, message: 'Items validation failed' })
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];

  @ApiProperty({
    description: 'Cart totals and pricing information',
    type: Object,
  })
  @IsObject({ message: 'Totals must be an object' })
  totals!: {
    itemCount: number;
    subtotalAmount: string;
  };

  @ApiPropertyOptional({
    description: 'Cart expiration timestamp',
    example: '2024-01-22T10:30:00Z',
  })
  @IsOptional()
  @IsDate({ message: 'Expires at must be a date' })
  @Type(() => Date)
  expiresAt?: Date;

  @ApiProperty({
    description: 'Cart creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate({ message: 'Created at must be a date' })
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({
    description: 'Cart last update timestamp',
    example: '2024-01-15T11:45:00Z',
  })
  @IsDate({ message: 'Updated at must be a date' })
  @Type(() => Date)
  updatedAt!: Date;
}
