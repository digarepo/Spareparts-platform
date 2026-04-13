import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * Query DTO for retrieving order information.
 *
 * @remarks
 * - **Scope:** Internal query for order retrieval
 * - **Authority:** System-to-system communication
 * - **Invariants:** Order ownership verification required
 * - **Security:** Contains customer context for access control
 */
export class GetOrderQuery {
  @ApiProperty({
    description: 'Order unique identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId!: string;

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
    description: 'Include order items in response',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include items must be a boolean' })
  includeItems?: boolean;

  @ApiPropertyOptional({
    description: 'Include order history in response',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Include history must be a boolean' })
  includeHistory?: boolean;
}

/**
 * Query DTO for retrieving customer orders with pagination.
 *
 * @remarks
 * - **Scope:** Internal query for customer order listing
 * - **Authority:** System-to-system communication
 * - **Invariants:** Customer ownership verification required
 * - **Security:** Returns only orders belonging to customer
 */
export class GetCustomerOrdersQuery {
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
    description: 'Filter by order status',
    example: ['confirmed', 'shipped'],
  })
  @IsOptional()
  @IsArray({ message: 'Statuses must be an array' })
  statuses?: string[];

  @ApiPropertyOptional({
    description: 'Filter by date range start',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString({ message: 'Date from must be a string' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range end',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsString({ message: 'Date to must be a string' })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field and direction',
    example: 'createdAt:desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort must be a string' })
  sort?: string;
}
