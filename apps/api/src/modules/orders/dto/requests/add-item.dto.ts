import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Length,
  Matches,
  ValidateNested,
  IsObject,
  Min,
  Max,
  IsDecimal
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { AddCartItemRequest } from '@spareparts/contracts/checkout';

/**
 * Item metadata DTO with comprehensive validation.
 *
 * @remarks
 * - Category is restricted to prevent injection
 * - Attributes are structured for analytics
 * - All fields are explicitly typed for security
 */
class ItemMetadataDto {
  @ApiProperty({
    description: 'Product category for analytics (sanitized)',
    example: 'engine_parts',
    maxLength: 100,
  })
  @IsString({ message: 'Category must be a string' })
  @Length(1, 100, { message: 'Category must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Category contains invalid characters' })
  category!: string;

  @ApiProperty({
    description: 'Variant attributes snapshot (structured data)',
    example: { color: 'red', size: 'M', material: 'steel' },
  })
  @IsObject({ message: 'Attributes must be an object' })
  attributes!: Record<string, unknown>;
}

/**
 * DTO for adding items to cart with strict validation and price security.
 *
 * @remarks
 * - **Scope:** Cart item addition with price freshness validation
 * - **Authority:** Customer cart ownership verification required
 * - **Invariants:** Price validation with robust decimal checking
 * - **Security:** Financial data protected with strict decimal validation
 * - **Validation:** Quantity limits and product name sanitization
 */
export class AddCartItemDto implements AddCartItemRequest {
  @ApiProperty({
    description: 'Cart identifier (must belong to authenticated customer)',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Cart ID must be a string' })
  @IsNotEmpty({ message: 'Cart ID is required' })
  @Matches(/^[0-9A-HJKMNP-TV-Z]{26}$/, { message: 'Cart ID must be a valid ULID' })
  cartId!: string;

  @ApiProperty({
    description: 'Tenant identifier (required for multi-tenant isolation)',
    example: 'tenant_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Tenant ID must be a string' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  @Length(3, 100, { message: 'Tenant ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Tenant ID contains invalid characters' })
  tenantId!: string;

  @ApiProperty({
    description: 'Catalog variant identifier (validated format)',
    example: 'variant_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Catalog variant ID must be a string' })
  @IsNotEmpty({ message: 'Catalog variant ID is required' })
  @Length(3, 100, { message: 'Catalog variant ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Catalog variant ID contains invalid characters' })
  catalogVariantId!: string;

  @ApiProperty({
    description: 'Quantity to add (must be positive, limited for abuse prevention)',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(100, { message: 'Quantity cannot exceed 100' })
  quantity!: number;

  @ApiProperty({
    description: 'Observed unit price at time of addition (robust decimal validation)',
    example: '1500.50',
    pattern: '^[0-9]+(\.[0-9]{1,2})?$',
  })
  @IsString({ message: 'Observed unit price must be a string' })
  @IsNotEmpty({ message: 'Observed unit price is required' })
  @Matches(/^[0-9]+(\.[0-9]{1,2})?$/, {
    message: 'Observed unit price must be a valid decimal with up to 2 decimal places'
  })
  @IsDecimal({
    decimal_digits: '2'
  })
  observedUnitPrice!: string;

  @ApiProperty({
    description: 'Product name snapshot at time of addition (sanitized)',
    example: 'Brake Pad Set - Front',
    maxLength: 200,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(1, 200, { message: 'Product name must be between 1 and 200 characters' })
  @Matches(/^[a-zA-Z0-9\\s\\-\\._\\(\\)\\/\\[\\]]+$/, {
    message: 'Product name contains invalid characters'
  })
  productName!: string;

  @ApiProperty({
    description: 'Variant name snapshot at time of addition (sanitized)',
    example: 'Premium Ceramic',
    maxLength: 200,
  })
  @IsString({ message: 'Variant name must be a string' })
  @IsNotEmpty({ message: 'Variant name is required' })
  @Length(1, 200, { message: 'Variant name must be between 1 and 200 characters' })
  @Matches(/^[a-zA-Z0-9\\s\\-\\._\\(\\)\\/\\[\\]]+$/, {
    message: 'Variant name contains invalid characters'
  })
  variantName!: string;

  @ApiProperty({
    description: 'Item metadata for analytics and tracking (validated)',
    type: ItemMetadataDto,
  })
  @IsObject({ message: 'Metadata must be an object' })
  @ValidateNested({ message: 'Metadata validation failed' })
  @Type(() => ItemMetadataDto)
  metadata!: ItemMetadataDto;
}
