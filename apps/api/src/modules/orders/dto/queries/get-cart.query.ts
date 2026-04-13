import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * Query DTO for retrieving cart information.
 *
 * @remarks
 * - **Scope:** Internal query for cart retrieval
 * - **Authority:** System-to-system communication
 * - **Invariants:** Cart ownership verification required
 * - **Security:** Contains customer context for access control
 */
export class GetCartQuery {
  @ApiProperty({
    description: 'Cart unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsString({ message: 'Cart ID must be a string' })
  @IsNotEmpty({ message: 'Cart ID is required' })
  cartId!: string;

  @ApiProperty({
    description: 'Customer identifier for ownership verification',
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

  @ApiPropertyOptional({
    description: 'Include expired carts in results',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include expired must be a boolean' })
  includeExpired?: boolean;

  @ApiPropertyOptional({
    description: 'User session identifier for tracking',
    example: 'sess_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  sessionId?: string;
}

/**
 * Query DTO for retrieving customer carts.
 *
 * @remarks
 * - **Scope:** Internal query for customer cart listing
 * - **Authority:** System-to-system communication
 * - **Invariants:** Customer ownership verification required
 * - **Security:** Returns only carts belonging to customer
 */
export class GetCustomerCartsQuery {
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

  @ApiPropertyOptional({
    description: 'Filter by cart status',
    example: 'active',
    enum: ['active', 'expired', 'converted', 'abandoned'],
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of carts to return',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  limit?: number;
}
