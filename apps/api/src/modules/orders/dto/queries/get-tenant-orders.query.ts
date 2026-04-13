import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Tenant Orders Query DTO with comprehensive filtering options.
 *
 * @remarks
 * - **Scope:** Tenant staff order listing with advanced filtering
 * - **Authority:** Tenant-scoped order management
 * - **Invariants:** Strict type safety, comprehensive validation
 * - **Security:** Tenant isolation enforced via service layer
 *
 * Features:
 * - Customer filtering (tenant staff can view specific customer orders)
 * - Status filtering with multiple values support
 * - Date range filtering
 * - Pagination with limits
 * - Comprehensive validation
 */
export class GetTenantOrdersQuery {
  @ApiPropertyOptional({
    description: 'Filter by customer ID (tenant staff only)',
    example: 'customer_12345',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status (multiple values supported)',
    example: ['pending', 'confirmed'],
    isArray: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string', each: true })
  statuses?: string[];

  @ApiPropertyOptional({
    description: 'Filter by date range start (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date from must be a valid ISO 8601 date' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range end (ISO 8601 format)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date to must be a valid ISO 8601 date' })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100 items' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field for ordering results',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'total', 'status'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
