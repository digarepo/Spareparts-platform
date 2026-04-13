import {
  IsString,
  IsOptional,
  Length,
  Matches,
  IsEnum,
  ValidateNested,
  IsObject,
  IsDateString
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateCartRequest } from '@spareparts/contracts/checkout';

/**
 * Cart metadata DTO with strict validation and security controls.
 *
 * @remarks
 * - All fields are validated to prevent injection attacks
 * - User agent and IP are sanitized for analytics
 * - Campaign codes are restricted to alphanumeric characters
 */
class CartMetadataDto {
  @ApiPropertyOptional({
    description: 'User agent string for analytics (sanitized)',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'User agent must be a string' })
  @Length(1, 500, { message: 'User agent must be between 1 and 500 characters' })
  @Matches(/^[a-zA-Z0-9\s\-\._\(\)\/\[\]]+$/, {
    message: 'User agent contains invalid characters'
  })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Client IP address for fraud detection (validated format)',
    example: '192.168.1.100',
    maxLength: 45,
  })
  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  @Matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^localhost$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, {
    message: 'IP address must be a valid IPv4, IPv6, or localhost format'
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Campaign or source identifier (sanitized)',
    example: 'summer_sale_2024',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Campaign must be a string' })
  @Length(1, 100, { message: 'Campaign must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Campaign contains invalid characters' })
  campaign?: string;
}

/**
 * DTO for cart creation requests with Zero-Trust validation and security hardening.
 *
 * @remarks
 * - **Scope:** Customer cart creation with tenant isolation
 * - **Authority:** Authenticated customer context required
 * - **Invariants:** Customer ID is stripped and replaced with authenticated user
 * - **Security:** Defense in depth - customerId is ignored and overridden
 * - **Validation:** Strict type checking with proper date transformation
 */
export class CreateCartDto implements CreateCartRequest {
  @ApiPropertyOptional({
    description: 'Customer identifier (will be overridden by authenticated context - ignored)',
    example: 'customer_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  @Length(3, 100, { message: 'Customer ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Customer ID contains invalid characters' })
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Currency code (defaults to ETB for Ethiopian market)',
    example: 'ETB',
    enum: ['ETB', 'USD', 'EUR'],
  })
  @IsOptional()
  @IsEnum(['ETB', 'USD', 'EUR'], { message: 'Invalid currency code' })
  currency?: 'ETB' | 'USD' | 'EUR';

  @ApiPropertyOptional({
    description: 'Cart expiration timestamp (must be in the future, auto-transformed)',
    example: '2024-04-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid ISO date string' })
  @Transform(({ value }) => {
    // Ensure proper Date transformation for Prisma compatibility
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date;
    }
    return value;
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Cart metadata for analytics and tracking (validated)',
    type: CartMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  @ValidateNested({ message: 'Metadata validation failed' })
  @Type(() => CartMetadataDto)
  metadata?: CartMetadataDto;
}
