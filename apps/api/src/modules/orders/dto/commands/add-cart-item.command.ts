import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional, ValidateNested, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Command DTO for adding items to cart with price verification.
 *
 * @remarks
 * - **Scope:** Internal command between services
 * - **Authority:** System-to-system communication
 * - **Invariants:** All fields validated and price verified
 * - **Security:** Contains price verification context and tolerance checks
 */
export class AddCartItemCommand {
  @ApiProperty({
    description: 'Cart unique identifier',
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
    description: 'Catalog variant identifier',
    example: 'variant_123456789',
  })
  @IsString({ message: 'Catalog variant ID must be a string' })
  @IsNotEmpty({ message: 'Catalog variant ID is required' })
  catalogVariantId!: string;

  @ApiProperty({
    description: 'Quantity of items to add',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @ApiProperty({
    description: 'Observed unit price at time of addition (decimal string) - will be verified',
    example: '1500.50',
  })
  @IsString({ message: 'Observed unit price must be a string' })
  @IsNotEmpty({ message: 'Observed unit price is required' })
  observedUnitPrice!: string;

  @ApiProperty({
    description: 'Price verification tolerance percentage (default 5%)',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price tolerance must be a number' })
  @Min(0, { message: 'Price tolerance cannot be negative' })
  @Max(50, { message: 'Price tolerance cannot exceed 50%' })
  priceTolerancePercentage?: number;

  @ApiProperty({
    description: 'Product name snapshot at time of addition',
    example: 'Brake Pad Set - Front',
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  productName!: string;

  @ApiProperty({
    description: 'Variant name snapshot at time of addition',
    example: 'Premium Ceramic',
  })
  @IsString({ message: 'Variant name must be a string' })
  @IsNotEmpty({ message: 'Variant name is required' })
  variantName!: string;

  @ApiPropertyOptional({
    description: 'Command metadata for processing and analytics',
    example: { source: 'web', sessionId: 'sess_123456', userAgent: 'Mozilla/5.0...' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'User session identifier for tracking',
    example: 'sess_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'User IP address for fraud detection',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  ipAddress?: string;
}
