import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, IsArray, IsOptional, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { OrderResponseDto } from './order-response.dto';
import type { ListOrdersResponse as ListOrdersResponseContract } from '@spareparts/contracts/checkout';

/**
 * Pagination metadata for order listings.
 *
 * @remarks
 * - **Scope:** Pagination information for order queries
 * - **Authority:** No special permissions required
 * - **Invariants:** Total count reflects filtered results
 * - **Security:** Page limits enforced to prevent data dumping
 */
export class OrderPaginationMetaDto {
  @ApiProperty({
    description: 'Current page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Page must be a number' })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Limit must be a number' })
  limit!: number;

  @ApiProperty({
    description: 'Total number of orders matching filters',
    example: 156,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Total must be a number' })
  total!: number;

  @ApiProperty({
    description: 'Total number of pages available',
    example: 8,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Total pages must be a number' })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there are more pages available',
    example: true,
  })
  @IsBoolean({ message: 'Has more must be a boolean' })
  hasMore!: boolean;

  @ApiPropertyOptional({
    description: 'Next page cursor for pagination',
    example: 'eyJwYWdlIjoyLCJsaW1pdCI6MjB9',
  })
  @IsOptional()
  @IsString({ message: 'Next cursor must be a string' })
  nextCursor?: string;

  @ApiPropertyOptional({
    description: 'Previous page cursor for pagination',
    example: 'eyJwYWdlIjoxLCJsaW1pdCI6MjB9',
  })
  @IsOptional()
  @IsString({ message: 'Previous cursor must be a string' })
  prevCursor?: string;
}

/**
 * List orders response DTO with pagination and order summaries.
 *
 * @remarks
 * - **Scope:** Paginated order listing for customer and admin views
 * - **Authority:** Orders filtered based on user permissions and ownership
 * - **Invariants:** Pagination metadata is consistent with results
 * - **Security:** Order data filtered based on authentication context
 * - **Performance:** Optimized for large datasets with cursor pagination
 */
export class ListOrdersResponseDto implements ListOrdersResponseContract {
  @ApiProperty({
    description: 'Array of orders matching the query criteria',
    type: [OrderResponseDto],
  })
  @IsArray({ message: 'Orders must be an array' })
  @ValidateNested({ each: true, message: 'Orders validation failed' })
  @Type(() => OrderResponseDto)
  orders!: OrderResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata for navigating results',
    type: OrderPaginationMetaDto,
  })
  @IsObject({ message: 'Pagination must be an object' })
  @ValidateNested({ message: 'Pagination validation failed' })
  @Type(() => OrderPaginationMetaDto)
  pagination!: OrderPaginationMetaDto;

  @ApiPropertyOptional({
    description: 'Applied filters for the query',
    example: { status: 'confirmed', customerId: 'customer_123' },
  })
  @IsOptional()
  @IsObject({ message: 'Filters must be an object' })
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Sorting criteria applied to results',
    example: { field: 'createdAt', direction: 'desc' },
  })
  @IsOptional()
  @IsObject({ message: 'Sort must be an object' })
  sort?: Record<string, unknown>;
}
