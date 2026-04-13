import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsNotEmpty, ValidateNested, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Ethiopia-specific address command DTO with phone number support.
 *
 * @remarks
 * - **Scope:** Internal address representation for order creation
 * - **Authority:** System-to-system communication
 * - **Invariants:** Ethiopia-specific fields validated with phone number
 * - **Security:** Address data sanitized for storage, phone validated
 */
export class EthiopiaAddressCommand {
  @ApiProperty({
    description: 'Street address',
    example: 'Bole Road, Building 123',
  })
  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street is required' })
  street!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Addis Ababa',
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @ApiProperty({
    description: 'State/Region',
    example: 'Addis Ababa',
  })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  state!: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'ET',
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
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

  @ApiProperty({
    description: 'Phone number (Ethiopia format - primary for delivery)',
    example: '+251911234567',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required for delivery' })
  @Matches(/^\+251[79][0-9]{8}$/, {
    message: 'Phone number must be in Ethiopia format: +2519XXXXXXXX'
  })
  phoneNumber!: string;

  @ApiPropertyOptional({
    description: 'Alternative phone number',
    example: '+251722345678',
  })
  @IsOptional()
  @IsString({ message: 'Alternative phone number must be a string' })
  @Matches(/^\+251[79][0-9]{8}$/, {
    message: 'Alternative phone number must be in Ethiopia format (+2519XXXXXXXX or +2517XXXXXXXX)'
  })
  alternativePhoneNumber?: string;
}

/**
 * Command DTO for creating orders from carts with enhanced validation.
 *
 * @remarks
 * - **Scope:** Internal command for order creation workflow
 * - **Authority:** System-to-system communication with inventory
 * - **Invariants:** Cart validation and inventory reservation required
 * - **Security:** Contains payment processing context and fraud detection
 */
export class CreateOrderCommand {
  @ApiProperty({
    description: 'Cart identifier to convert to order',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsString({ message: 'Cart ID must be a string' })
  @IsNotEmpty({ message: 'Cart ID is required' })
  cartId!: string;

  @ApiProperty({
    description: 'Customer identifier',
    example: 'customer_123456789',
  })
  @IsString({ message: 'Customer ID must be a string' })
  @IsNotEmpty({ message: 'Customer ID is required' })
  customerId!: string;

  @ApiProperty({
    description: 'Tenant identifier for multi-tenant isolation',
    example: 'tenant_123456789',
  })
  @IsString({ message: 'Tenant ID must be a string' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: string;

  @ApiProperty({
    description: 'Shipping address (Ethiopia-specific fields with phone)',
    type: EthiopiaAddressCommand,
  })
  @IsObject({ message: 'Shipping address must be an object' })
  @ValidateNested({ message: 'Shipping address validation failed' })
  @Type(() => EthiopiaAddressCommand)
  shippingAddress!: EthiopiaAddressCommand;

  @ApiProperty({
    description: 'Billing address (Ethiopia-specific fields with phone)',
    type: EthiopiaAddressCommand,
  })
  @IsObject({ message: 'Billing address must be an object' })
  @ValidateNested({ message: 'Billing address validation failed' })
  @Type(() => EthiopiaAddressCommand)
  billingAddress!: EthiopiaAddressCommand;

  @ApiPropertyOptional({
    description: 'Order metadata for processing and analytics',
    example: { source: 'web', promotion: 'spring_sale', device: 'mobile' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Payment method identifier',
    example: 'payment_method_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Payment method must be a string' })
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'User IP address for fraud detection',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  ipAddress?: string;
}
