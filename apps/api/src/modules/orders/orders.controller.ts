import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { Scopes } from '../../auth/decorators/scopes.decorator';
import { CurrentRequest } from '../../http/decorators/tenant-context.decorator';
import { OrderService } from './services/order.service';
import { OrderResponseDto } from './dto/responses/order-response.dto';
import { ListOrdersResponseDto } from './dto/responses/list-orders-response.dto';
import { GetOrderQuery } from './dto/queries/get-order.query';
import { GetCustomerOrdersQuery } from './dto/queries/get-order.query';
import { GetTenantOrdersQuery } from './dto/queries/get-tenant-orders.query';
import type { AuthenticatedRequest } from '../../types/request.types';

/**
 * Orders controller with customer and tenant-scoped order endpoints.
 *
 * @remarks
 * - **Scope:** Order retrieval and management endpoints
 * - **Authority:** Customer-owned orders with tenant isolation
 * - **Security:** Multi-tenant RLS enforcement, customer ownership verification
 * - **Standards:** RESTful design, comprehensive validation, audit logging
 *
 * Endpoints:
 * - GET /orders/:id - Customer order retrieval
 * - GET /orders - Customer order listing with pagination
 * - GET /tenant/orders/:id - Tenant order retrieval (staff scope)
 * - GET /tenant/orders - Tenant order listing (staff scope)
 */
@ApiTags('orders')
@Controller('orders')
@UseGuards(AuthGuard, ScopesGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly orderService: OrderService) {}

  /**
   * Retrieve a specific order by ID for the authenticated customer.
   *
   * @param id - Order identifier
   * @param query - Order query parameters
   * @param request - HTTP request with user context
   * @param tenantId - Tenant context from middleware
   * @returns Promise<OrderResponseDto> Order details
   */
  @Get(':id')
  @Scopes('customer')
  @ApiOperation({
    summary: 'Get customer order',
    description: 'Retrieve a specific order for the authenticated customer',
  })
  @ApiParam({
    name: 'id',
    description: 'Order identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found or access denied',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getOrder(
    @Param('id') id: string,
    @Query() query: GetOrderQuery,
    @Request() request: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Retrieving order: ${id} for customer in tenant: ${tenantId}`);

    const customerId = request.user.sub;
    const getOrderQuery: GetOrderQuery = {
      orderId: id,
      customerId,
      tenantId,
    };

    const order = await this.orderService.getOrder(getOrderQuery);

    this.logger.log(`Successfully retrieved order: ${id}`);
    return order;
  }

  /**
   * List orders for the authenticated customer with pagination and filtering.
   *
   * @param query - Order listing parameters
   * @param request - HTTP request with user context
   * @param tenantId - Tenant context from middleware
   * @returns Promise<ListOrdersResponseDto> Paginated order list
   */
  @Get()
  @Scopes('customer')
  @ApiOperation({
    summary: 'List customer orders',
    description: 'Retrieve paginated list of orders for the authenticated customer',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status',
    example: 'completed',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter orders from date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter orders to date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: ListOrdersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getCustomerOrders(
    @Query() query: GetCustomerOrdersQuery,
    @Request() request: AuthenticatedRequest,
  ): Promise<ListOrdersResponseDto> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Listing orders for customer in tenant: ${tenantId}`, {
      page: query.page,
      limit: query.limit,
      statuses: query.statuses,
    });

    const customerId = request.user.sub;
    const getOrdersQuery: GetCustomerOrdersQuery = {
      customerId,
      tenantId,
      page: query.page,
      limit: query.limit,
      statuses: query.statuses,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    const orders = await this.orderService.getCustomerOrders(getOrdersQuery);

    this.logger.log(`Successfully retrieved ${orders.orders.length} orders for customer`);
    return orders;
  }

  /**
   * Retrieve a specific order by ID for tenant staff (tenant-scoped view).
   *
   * @param id - Order identifier
   * @param query - Order query parameters
   * @param tenantId - Tenant context from middleware
   * @returns Promise<OrderResponseDto> Order details (tenant-scoped)
   */
  @Get('tenant/orders/:id')
  @Scopes('tenant')
  @ApiOperation({
    summary: 'Get tenant order',
    description: 'Retrieve a specific order for tenant staff with tenant-scoped view',
  })
  @ApiParam({
    name: 'id',
    description: 'Order identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found in tenant',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient scope for tenant access',
  })
  async getTenantOrder(
    @Param('id') id: string,
    @Query() query: GetOrderQuery,
    @Request() request: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Retrieving tenant order: ${id} in tenant: ${tenantId}`);

    // For tenant access, we don't filter by customerId
    // The repository's RLS policies will enforce tenant isolation
    const getOrderQuery: GetOrderQuery = {
      orderId: id,
      tenantId,
      customerId: '', // Required by type but empty for tenant access
    };

    const order = await this.orderService.getOrder(getOrderQuery);

    this.logger.log(`Successfully retrieved tenant order: ${id}`);
    return order;
  }

  /**
   * List orders for tenant staff with pagination and filtering.
   *
   * @param query - Order listing parameters
   * @param tenantId - Tenant context from middleware
   * @returns Promise<ListOrdersResponseDto> Paginated order list (tenant-scoped)
   */
  @Get('tenant/orders')
  @Scopes('tenant')
  @ApiOperation({
    summary: 'List tenant orders',
    description: 'Retrieve paginated list of orders for tenant staff',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    example: 'customer_123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status',
    example: 'completed',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter orders from date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter orders to date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: ListOrdersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient scope for tenant access',
  })
  async getTenantOrders(
    @Query() query: GetTenantOrdersQuery,
    @Request() request: AuthenticatedRequest,
  ): Promise<ListOrdersResponseDto> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Listing tenant orders in tenant: ${tenantId}`, {
      page: query.page,
      limit: query.limit,
      statuses: query.statuses,
      customerId: query.customerId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    // Convert tenant query to customer query format for service layer
    const getOrdersQuery: GetCustomerOrdersQuery = {
      customerId: query.customerId || '', // Empty string for tenant-wide view
      tenantId,
      page: query.page,
      limit: query.limit,
      statuses: query.statuses,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    const orders = await this.orderService.getCustomerOrders(getOrdersQuery);

    this.logger.log(`Successfully retrieved ${orders.orders.length} tenant orders`);
    return orders;
  }
}
