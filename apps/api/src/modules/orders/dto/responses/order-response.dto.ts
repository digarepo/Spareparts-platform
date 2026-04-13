import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsObject, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import type { OrderResponse as OrderResponseContract } from '@spareparts/contracts/checkout';

/**
 * Order item response DTO with comprehensive product and pricing information.
 *
 * @remarks
 * - **Scope:** Read-only order item representation
 * - **Authority:** Order ownership verification required
 * - **Invariants:** Price snapshots preserved at time of order
 * - **Security:** Cost prices filtered based on user role
 */
export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Order item ID must be a string' })
  id!: string;

  @ApiProperty({
    description: 'Order identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Order ID must be a string' })
  orderId!: string;

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
    description: 'Product name at time of order',
    example: 'Brake Pad Set - Front',
  })
  @IsString({ message: 'Product name must be a string' })
  productName!: string;

  @ApiProperty({
    description: 'Variant name at time of order',
    example: 'Premium Ceramic',
  })
  @IsString({ message: 'Variant name must be a string' })
  variantName!: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price at time of order (decimal string)',
    example: '1500.50',
  })
  @IsString({ message: 'Unit price must be a string' })
  unitPrice!: string;

  @ApiProperty({
    description: 'Total price for this item (decimal string)',
    example: '3001.00',
  })
  @IsString({ message: 'Total price must be a string' })
  totalPrice!: string;

  @ApiPropertyOptional({
    description: 'Item metadata for processing and analytics',
    example: { source: 'product_listing', reservation: 'confirmed' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'Timestamp when item was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDate({ message: 'Created at must be a date' })
  @Type(() => Date)
  createdAt!: Date;
}

/**
 * Ethiopia-specific address response DTO.
 *
 * @remarks
 * - **Scope:** Read-only address representation
 * - **Authority:** Order ownership verification required
 * - **Invariants:** Ethiopia-specific fields preserved
 * - **Security:** Address data masked based on user permissions
 */
export class EthiopiaAddressResponseDto {
  @ApiProperty({
    description: 'Street address',
    example: 'Bole Road, Building 123',
  })
  @IsString({ message: 'Street must be a string' })
  street!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Addis Ababa',
  })
  @IsString({ message: 'City must be a string' })
  city!: string;

  @ApiProperty({
    description: 'State/Region',
    example: 'Addis Ababa',
  })
  @IsString({ message: 'State must be a string' })
  state!: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'ET',
  })
  @IsString({ message: 'Country must be a string' })
  country!: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '1000',
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Sub-city (Ethiopia-specific)',
    example: 'Bole',
  })
  @IsOptional()
  @IsString({ message: 'Sub-city must be a string' })
  subCity?: string;

  @ApiPropertyOptional({
    description: 'Woreda (Ethiopia-specific)',
    example: 'Woreda 08',
  })
  @IsOptional()
  @IsString({ message: 'Woreda must be a string' })
  woreda?: string;
}

/**
 * Order response DTO with comprehensive order information and item details.
 *
 * @remarks
 * - **Scope:** Complete order representation for customer and system use
 * - **Authority:** Order ownership verification required
 * - **Invariants:** Total calculations are consistent with item prices and taxes
 * - **Security:** Sensitive fields filtered based on user context and role
 * - **Performance:** Optimized for order listing and detail views
 */
export class OrderResponseDto implements OrderResponseContract {
  @ApiProperty({
    description: 'Order unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Order ID must be a string' })
  id!: string;

  @ApiProperty({
    description: 'Customer identifier (filtered based on authentication)',
    example: 'customer_123456789',
  })
  @IsString({ message: 'Customer ID must be a string' })
  customerId!: string;

  @ApiProperty({
    description: 'Order status identifier',
    example: 'status_confirmed',
  })
  @IsString({ message: 'Status ID must be a string' })
  statusId!: string;

  @ApiProperty({
    description: 'Order status label',
    example: 'confirmed',
  })
  @IsString({ message: 'Status label must be a string' })
  statusLabel!: string;

  @ApiProperty({
    description: 'Order items with product details and pricing',
    type: [OrderItemResponseDto],
  })
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true, message: 'Items validation failed' })
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Order totals and pricing information',
    type: Object,
  })
  @IsObject({ message: 'Totals must be an object' })
  totals!: {
    subtotalAmount: string;
    taxAmount: string;
    shippingAmount: string;
    totalAmount: string;
  };

  @ApiProperty({
    description: 'Order addresses (shipping and billing)',
    type: Object,
  })
  @IsObject({ message: 'Addresses must be an object' })
  addresses!: {
    shipping: EthiopiaAddressResponseDto;
    billing: EthiopiaAddressResponseDto;
  };

  @ApiProperty({
    description: 'Order timestamps',
    type: Object,
  })
  @IsObject({ message: 'Timestamps must be an object' })
  timestamps!: {
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiPropertyOptional({
    description: 'Order metadata for processing and analytics',
    example: { source: 'web', promotion: 'spring_sale', inventory: 'reserved' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;
}
