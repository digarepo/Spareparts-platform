import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  ValidateNested,
  IsObject,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateOrderRequest } from '@spareparts/contracts/checkout';

/**
 * Ethiopia-specific address DTO with comprehensive validation.
 *
 * @remarks
 * - Ethiopia-specific fields: subCity, woreda
 * - All fields are validated and sanitized
 * - Country code enforced as ISO 3166-1 alpha-2
 */
class EthiopiaAddressDto {
  @ApiProperty({
    description: 'Street address (sanitized)',
    example: 'Bole Road, Building 123',
    maxLength: 200,
  })
  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street is required' })
  @Length(5, 200, { message: 'Street must be between 5 and 200 characters' })
  @Matches(/^[a-zA-Z0-9\\s\\-\\._\\(\\)\\/\\[\\],#]+$/, {
    message: 'Street contains invalid characters'
  })
  street!: string;

  @ApiProperty({
    description: 'City name (validated format)',
    example: 'Addis Ababa',
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @Length(2, 100, { message: 'City must be between 2 and 100 characters' })
  @Matches(/^[a-zA-Z\\s]+$/, { message: 'City must contain only letters and spaces' })
  city!: string;

  @ApiProperty({
    description: 'State or region (validated format)',
    example: 'Addis Ababa',
    maxLength: 100,
  })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  @Length(2, 100, { message: 'State must be between 2 and 100 characters' })
  @Matches(/^[a-zA-Z\\s]+$/, { message: 'State must contain only letters and spaces' })
  state!: string;

  @ApiPropertyOptional({
    description: 'Sub-city (Ethiopia specific, validated)',
    example: 'Kirkos',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Sub-city must be a string' })
  @Length(2, 100, { message: 'Sub-city must be between 2 and 100 characters' })
  @Matches(/^[a-zA-Z\\s]+$/, { message: 'Sub-city must contain only letters and spaces' })
  subCity?: string;

  @ApiPropertyOptional({
    description: 'Woreda (Ethiopia specific, validated)',
    example: 'Woreda 04',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Woreda must be a string' })
  @Length(2, 50, { message: 'Woreda must be between 2 and 50 characters' })
  @Matches(/^[a-zA-Z0-9\\s]+$/, { message: 'Woreda contains invalid characters' })
  woreda?: string;

  @ApiPropertyOptional({
    description: 'Postal code (validated format)',
    example: '1000',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @Matches(/^[0-9A-Z-]+$/, { message: 'Postal code contains invalid characters' })
  postalCode?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2, validated)',
    example: 'ET',
    minLength: 2,
    maxLength: 2,
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @Length(2, 2, { message: 'Country must be exactly 2 characters' })
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be valid ISO 3166-1 alpha-2 code' })
  country!: string;
}

/**
 * Order metadata DTO with payment and delivery validation.
 *
 * @remarks
 * - Payment methods are restricted to supported options
 * - Promo codes are validated format
 * - Delivery notes are sanitized and length-limited
 */
class OrderMetadataDto {
  @ApiProperty({
    description: 'Payment method intended for use (validated options)',
    example: 'mobile_money',
    enum: ['mobile_money', 'bank_transfer', 'cash_on_delivery', 'card'],
  })
  @IsString({ message: 'Payment method must be a string' })
  @IsEnum(['mobile_money', 'bank_transfer', 'cash_on_delivery', 'card'], {
    message: 'Invalid payment method'
  })
  paymentMethod!: string;

  @ApiPropertyOptional({
    description: 'Promotional code applied (validated format)',
    example: 'SUMMER2024',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Promo code contains invalid characters' })
  promoCode?: string;

  @ApiPropertyOptional({
    description: 'Delivery notes or special instructions (sanitized)',
    example: 'Call before delivery',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Delivery notes must be a string' })
  @Length(1, 500, { message: 'Delivery notes must be between 1 and 500 characters' })
  @Matches(/^[a-zA-Z0-9\\s\\-\\._\\(\\)\\/\\[\\],#!?]+$/, {
    message: 'Delivery notes contain invalid characters'
  })
  deliveryNotes?: string;
}

/**
 * DTO for placing orders with comprehensive validation and Ethiopia-specific support.
 *
 * @remarks
 * - **Scope:** Order placement with inventory integration
 * - **Authority:** Customer cart ownership verification required
 * - **Invariants:** Ethiopia-specific address validation with proper formatting
 * - **Security:** All address fields are validated and sanitized
 * - **Integration:** Phase 4 inventory reservation orchestration
 */
export class PlaceOrderDto implements CreateOrderRequest {
  @ApiProperty({
    description: 'Cart identifier to convert to order (validated ULID)',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
    pattern: '^[0-9A-HJKMNP-TV-Z]{26}$',
  })
  @IsString({ message: 'Cart ID must be a string' })
  @IsNotEmpty({ message: 'Cart ID is required' })
  @Matches(/^[0-9A-HJKMNP-TV-Z]{26}$/, { message: 'Cart ID must be a valid ULID' })
  cartId!: string;

  @ApiProperty({
    description: 'Customer identifier (will be overridden with authenticated user ID)',
    example: 'customer_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Customer ID must be a string' })
  @IsNotEmpty({ message: 'Customer ID is required' })
  @Length(3, 100, { message: 'Customer ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Customer ID contains invalid characters' })
  customerId!: string;

  @ApiProperty({
    description: 'Shipping address (Ethiopia-specific fields with validation)',
    type: EthiopiaAddressDto,
  })
  @IsObject({ message: 'Shipping address must be an object' })
  @ValidateNested({ message: 'Shipping address validation failed' })
  @Type(() => EthiopiaAddressDto)
  shippingAddress!: EthiopiaAddressDto;

  @ApiProperty({
    description: 'Billing address (Ethiopia-specific fields with validation)',
    type: EthiopiaAddressDto,
  })
  @IsObject({ message: 'Billing address must be an object' })
  @ValidateNested({ message: 'Billing address validation failed' })
  @Type(() => EthiopiaAddressDto)
  billingAddress!: EthiopiaAddressDto;

  @ApiPropertyOptional({
    description: 'Order metadata for processing and analytics (validated)',
    type: OrderMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  @ValidateNested({ message: 'Metadata validation failed' })
  @Type(() => OrderMetadataDto)
  metadata?: Record<string, unknown>;
}
