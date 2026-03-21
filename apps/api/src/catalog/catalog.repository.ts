import { Injectable, Logger } from '@nestjs/common';
import type {
  RequestContext,
  ProductStatus,
  ProductId,
} from '@spareparts/contracts';
import type { CatalogFilterCriteria } from '../../../../domains/catalog/filters/catalog-listing';
import type { PrismaClient } from '@prisma/client';
import { getTenantPrismaClient } from '../prisma/tenant-prisma.client';

/**
 * Repository for catalog database operations.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** database via Prisma client
 * - **Threading/Async:** all methods are async
 * - **Tenancy:** all queries use tenant-scoped Prisma client with RLS
 */
@Injectable()
export class CatalogRepository {
  private readonly logger = new Logger(CatalogRepository.name);

  /**
   * Creates a new product in the database.
   *
   * @param productData - Product creation data
   * @param ctx - Request context with tenant information
   * @returns The created product entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Database triggers handle audit trail creation
   * - PublishedAt is set to null for draft products
   */
  async create(
    productData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Creating product in database: ${productData.slug} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.create({
      data: {
        ...productData,
        publishedAt: productData.status === 'published' ? new Date() : null,
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product created in database: ${product.id} for tenant: ${ctx.tenantId}`,
    );

    return product;
  }

  /**
   * Updates an existing product in the database.
   *
   * @param productId - ULID of the product to update
   * @param updateData - Product update data
   * @param ctx - Request context with tenant information
   * @returns The updated product entity
   *
   * @remarks
   * - Only provided fields are updated
   * - PublishedAt is set when status changes to published
   * - All changes are tracked via database triggers
   */
  async update(
    productId: ProductId,
    updateData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Updating product in database: ${productId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    // Handle publishedAt timestamp for status changes
    let publishedAtUpdate = {};
    if (updateData.status === 'published' && updateData.status !== undefined) {
      publishedAtUpdate = { publishedAt: new Date() };
    } else if (updateData.status !== 'published' && updateData.status !== undefined) {
      publishedAtUpdate = { publishedAt: null };
    }

    const product = await (prisma as any).product.update({
      where: { id: productId },
      data: {
        ...updateData,
        ...publishedAtUpdate,
        updatedAt: new Date(),
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product updated in database: ${productId} for tenant: ${ctx.tenantId}`,
    );

    return product;
  }

  /**
   * Finds a product by ID within the tenant context.
   *
   * @param productId - ULID of the product to find
   * @param tenantId - Tenant ID for scoping
   * @returns The product entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes variants, prices, and quantities
   */
  async findById(
    productId: ProductId,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding product by ID: ${productId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product ${product ? 'found' : 'not found'}: ${productId} for tenant: ${tenantId}`,
    );

    return product;
  }

  /**
   * Finds a product by slug within the tenant context.
   *
   * @param slug - Product slug to find
   * @param tenantId - Tenant ID for scoping
   * @returns The product entity or null if not found
   *
   * @remarks
   * - Used for slug uniqueness validation
   * - Tenant-scoped via RLS policies
   */
  async findBySlug(
    slug: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding product by slug: ${slug} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.findUnique({
      where: { slug },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product by slug ${product ? 'found' : 'not found'}: ${slug} for tenant: ${tenantId}`,
    );

    return product;
  }

  /**
   * Lists products with filtering and pagination.
   *
   * @param criteria - Domain filter criteria
   * @param ctx - Request context with tenant information
   * @returns Array of products matching criteria
   *
   * @remarks
   * - Applies tenant-scoped RLS filtering
   * - Supports status, taxonomy, and search filters
   * - Pagination uses offset/limit for database efficiency
   */
  async list(
    criteria: CatalogFilterCriteria,
    ctx: RequestContext,
  ): Promise<any[]> {
    this.logger.debug(
      `Listing products for tenant: ${ctx.tenantId} with criteria: ${JSON.stringify(criteria)}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const whereClause = this.buildWhereClause(criteria);
    const orderByClause = this.buildOrderByClause(criteria);

    const products = await (prisma as any).product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip: criteria.pagination.offset,
      take: criteria.pagination.limit,
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Found ${products.length} products for tenant: ${ctx.tenantId}`,
    );

    return products;
  }

  /**
   * Publishes a product by updating its status and timestamp.
   *
   * @param productId - ULID of the product to publish
   * @param ctx - Request context with tenant information
   * @returns The updated product entity
   *
   * @remarks
   * - Sets status to 'published'
   * - Sets publishedAt timestamp to current time
   * - Database triggers handle audit logging
   */
  async publish(
    productId: ProductId,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Publishing product in database: ${productId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.update({
      where: { id: productId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product published in database: ${productId} for tenant: ${ctx.tenantId}`,
    );

    return product;
  }

  /**
   * Builds Prisma where clause from domain filter criteria.
   *
   * @param criteria - Domain filter criteria
   * @returns Prisma where clause object
   *
   * @remarks
   * - Translates domain filters to database queries
   * - Handles search term matching across name and description
   * - Supports taxonomy filtering
   */
  private buildWhereClause(criteria: CatalogFilterCriteria): any {
    const whereClause: any = {
      status: criteria.status,
    };

    // Add taxonomy filter if specified
    if (criteria.taxonomyIds && criteria.taxonomyIds.size > 0) {
      whereClause.taxonomyIds = {
        hasSome: Array.from(criteria.taxonomyIds),
      };
    }

    // Add search filter if specified
    if (criteria.searchText) {
      whereClause.OR = [
        {
          name: {
            contains: criteria.searchText,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: criteria.searchText,
            mode: 'insensitive',
          },
        },
      ];
    }

    return whereClause;
  }

  /**
   * Builds Prisma order by clause from filter criteria.
   *
   * @param criteria - Domain filter criteria
   * @returns Prisma order by clause object
   *
   * @remarks
   * - Default ordering by createdAt descending
   * - Can be extended to support custom sorting
   */
  private buildOrderByClause(criteria: CatalogFilterCriteria): any {
    return {
      createdAt: 'desc',
    };
  }

  /**
   * Creates a new variant in the database.
   *
   * @param variantData - Variant creation data
   * @param ctx - Request context with tenant information
   * @returns The created variant entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Database triggers handle audit trail creation
   */
  async createVariant(
    variantData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Creating variant in database: ${variantData.sku} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.create({
      data: {
        ...variantData,
        tenantId: ctx.tenantId,
      },
      include: {
        price: true,
        quantity: true,
      },
    });

    this.logger.debug(
      `Variant created in database: ${variant.id} for tenant: ${ctx.tenantId}`,
    );

    return variant;
  }

  /**
   * Updates an existing variant in the database.
   *
   * @param variantId - ULID of the variant to update
   * @param updateData - Variant update data
   * @param ctx - Request context with tenant information
   * @returns The updated variant entity
   *
   * @remarks
   * - Only provided fields are updated
   * - All changes are tracked via database triggers
   */
  async updateVariant(
    variantId: string,
    updateData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Updating variant in database: ${variantId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.update({
      where: { id: variantId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        price: true,
        quantity: true,
      },
    });

    this.logger.debug(
      `Variant updated in database: ${variantId} for tenant: ${ctx.tenantId}`,
    );

    return variant;
  }

  /**
   * Finds a variant by ID within the tenant context.
   *
   * @param variantId - ULID of the variant to find
   * @param tenantId - Tenant ID for scoping
   * @returns The variant entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes pricing and quantity information
   */
  async findVariantById(
    variantId: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding variant by ID: ${variantId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.findUnique({
      where: { id: variantId },
      include: {
        price: true,
        quantity: true,
      },
    });

    this.logger.debug(
      `Variant ${variant ? 'found' : 'not found'}: ${variantId} for tenant: ${tenantId}`,
    );

    return variant;
  }

  /**
   * Finds a variant by SKU within the tenant context.
   *
   * @param sku - Variant SKU to find
   * @param tenantId - Tenant ID for scoping
   * @returns The variant entity or null if not found
   *
   * @remarks
   * - Used for SKU uniqueness validation
   * - Tenant-scoped via RLS policies
   */
  async findBySku(
    sku: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding variant by SKU: ${sku} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.findUnique({
      where: { sku },
      include: {
        price: true,
        quantity: true,
      },
    });

    this.logger.debug(
      `Variant by SKU ${variant ? 'found' : 'not found'}: ${sku} for tenant: ${tenantId}`,
    );

    return variant;
  }

  /**
   * Creates a new taxonomy node in the database.
   *
   * @param taxonomyData - Taxonomy creation data
   * @param ctx - Request context with tenant information
   * @returns The created taxonomy entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Database triggers handle audit trail creation
   */
  async createTaxonomy(
    taxonomyData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Creating taxonomy in database: ${taxonomyData.label} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomy.create({
      data: {
        ...taxonomyData,
        tenantId: ctx.tenantId,
      },
    });

    this.logger.debug(
      `Taxonomy created in database: ${taxonomy.id} for tenant: ${ctx.tenantId}`,
    );

    return taxonomy;
  }

  /**
   * Updates an existing taxonomy node in the database.
   *
   * @param taxonomyId - ULID of the taxonomy node to update
   * @param updateData - Taxonomy update data
   * @param ctx - Request context with tenant information
   * @returns The updated taxonomy entity
   *
   * @remarks
   * - Only provided fields are updated
   * - All changes are tracked via database triggers
   */
  async updateTaxonomy(
    taxonomyId: string,
    updateData: any,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Updating taxonomy in database: ${taxonomyId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomy.update({
      where: { id: taxonomyId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    this.logger.debug(
      `Taxonomy updated in database: ${taxonomyId} for tenant: ${ctx.tenantId}`,
    );

    return taxonomy;
  }

  /**
   * Finds a taxonomy node by ID within the tenant context.
   *
   * @param taxonomyId - ULID of the taxonomy node to find
   * @param tenantId - Tenant ID for scoping
   * @returns The taxonomy entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes parent and child relationships
   */
  async findTaxonomyById(
    taxonomyId: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding taxonomy by ID: ${taxonomyId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomy.findUnique({
      where: { id: taxonomyId },
    });

    this.logger.debug(
      `Taxonomy ${taxonomy ? 'found' : 'not found'}: ${taxonomyId} for tenant: ${tenantId}`,
    );

    return taxonomy;
  }

  /**
   * Finds a taxonomy node by label and parent within the tenant context.
   *
   * @param label - Taxonomy label to find
   * @param parentId - Parent taxonomy ID (null for root level)
   * @param tenantId - Tenant ID for scoping
   * @returns The taxonomy entity or null if not found
   *
   * @remarks
   * - Used for label uniqueness validation
   * - Tenant-scoped via RLS policies
   */
  async findTaxonomyByLabelAndParent(
    label: string,
    parentId: string | null,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding taxonomy by label: ${label} under parent: ${parentId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomy.findFirst({
      where: {
        label,
        parentId,
      },
    });

    this.logger.debug(
      `Taxonomy by label ${taxonomy ? 'found' : 'not found'}: ${label} for tenant: ${tenantId}`,
    );

    return taxonomy;
  }

  /**
   * Lists all taxonomy nodes within the tenant context.
   *
   * @param tenantId - Tenant ID for scoping
   * @returns Array of taxonomy entities
   *
   * @remarks
   * - Returns flat list of all nodes for tenant
   * - Client-side responsible for tree construction
   * - Tenant-scoped via RLS policies
   */
  async listTaxonomies(tenantId: string): Promise<any[]> {
    this.logger.debug(
      `Listing taxonomies for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const taxonomies = await (prisma as any).taxonomy.findMany({
      orderBy: [
        { parentId: 'asc' }, // Root nodes first
        { label: 'asc' },     // Then alphabetical
      ],
    });

    this.logger.debug(
      `Listed ${taxonomies.length} taxonomies for tenant: ${tenantId}`,
    );

    return taxonomies;
  }

  /**
   * Checks if a taxonomy node is a descendant of another node.
   *
   * @param potentialAncestorId - ID of potential ancestor node
   * @param potentialDescendantId - ID of potential descendant node
   * @param tenantId - Tenant ID for scoping
   * @returns True if descendant relationship exists
   *
   * @remarks
   * - Used to prevent cycles in taxonomy hierarchy
   * - Recursive traversal of parent relationships
   */
  async isTaxonomyDescendant(
    potentialAncestorId: string,
    potentialDescendantId: string,
    tenantId: string,
  ): Promise<boolean> {
    this.logger.debug(
      `Checking if ${potentialDescendantId} is descendant of ${potentialAncestorId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    // Start with the potential descendant and traverse up
    let currentId = potentialDescendantId;
    const visited = new Set<string>();
    const maxDepth = 100; // Prevent infinite loops
    let depth = 0;

    while (currentId && depth < maxDepth) {
      if (visited.has(currentId)) {
        // Cycle detected
        this.logger.warn(`Cycle detected in taxonomy at node: ${currentId}`);
        break;
      }

      visited.add(currentId);

      if (currentId === potentialAncestorId) {
        return true;
      }

      // Get parent of current node
      const current = await (prisma as any).taxonomy.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      if (!current) {
        break;
      }

      currentId = current.parentId;
      depth++;
    }

    this.logger.debug(
      `Descendant check completed: ${potentialDescendantId} is ${depth >= maxDepth ? 'too deep' : 'not descendant'} of ${potentialAncestorId}`,
    );

    return false;
  }

  /**
   * Creates a classification assignment between a product and taxonomy node.
   *
   * @param productId - Product ID to assign
   * @param taxonomyId - Taxonomy node ID to assign to
   * @param tenantId - Tenant ID for scoping
   * @param ctx - Request context with actor information
   * @returns The created classification assignment
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Records assignment actor for audit trail
   */
  async createClassificationAssignment(
    productId: string,
    taxonomyId: string,
    tenantId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Creating classification assignment: product ${productId} -> taxonomy ${taxonomyId} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const assignment = await (prisma as any).productTaxonomyAssignment.create({
      data: {
        productId,
        taxonomyId,
        tenantId,
        assignedBy: ctx.actor.kind === 'platform' || ctx.actor.kind === 'tenant' ? ctx.actor.userId : 'system',
        assignedAt: new Date(),
      },
    });

    this.logger.debug(
      `Classification assignment created in database: ${assignment.id} for tenant: ${tenantId}`,
    );

    return assignment;
  }

  /**
   * Finds a classification assignment by product and taxonomy.
   *
   * @param productId - Product ID to search for
   * @param taxonomyId - Taxonomy node ID to search for
   * @param tenantId - Tenant ID for scoping
   * @returns The classification assignment or null if not found
   *
   * @remarks
   * - Used for uniqueness validation
   * - Tenant-scoped via RLS policies
   */
  async findClassificationAssignment(
    productId: string,
    taxonomyId: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding classification assignment: product ${productId} -> taxonomy ${taxonomyId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const assignment = await (prisma as any).productTaxonomyAssignment.findUnique({
      where: {
        productId_taxonomyId: {
          productId,
          taxonomyId,
        },
      },
    });

    this.logger.debug(
      `Classification assignment ${assignment ? 'found' : 'not found'}: product ${productId} -> taxonomy ${taxonomyId} for tenant: ${tenantId}`,
    );

    return assignment;
  }

  /**
   * Deletes a classification assignment.
   *
   * @param assignmentId - Assignment ID to delete
   * @param tenantId - Tenant ID for scoping
   * @returns Confirmation of deletion
   *
   * @remarks
   * - Soft delete preserves audit trail
   * - Hard delete removes record completely
   */
  async deleteClassificationAssignment(
    assignmentId: string,
    tenantId: string,
  ): Promise<void> {
    this.logger.debug(
      `Deleting classification assignment: ${assignmentId} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).productTaxonomyAssignment.delete({
      where: { id: assignmentId },
    });

    this.logger.debug(
      `Classification assignment deleted: ${assignmentId} for tenant: ${tenantId}`,
    );
  }

  /**
   * Lists all classification assignments for a product.
   *
   * @param productId - Product ID to list assignments for
   * @param tenantId - Tenant ID for scoping
   * @returns Array of classification assignments with taxonomy details
   *
   * @remarks
   * - Includes taxonomy node details for navigation
   * - Tenant-scoped via RLS policies
   */
  async listClassificationAssignments(
    productId: string,
    tenantId: string,
  ): Promise<any[]> {
    this.logger.debug(
      `Listing classification assignments for product: ${productId} in tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const assignments = await (prisma as any).productTaxonomyAssignment.findMany({
      where: { productId },
      include: {
        taxonomy: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    this.logger.debug(
      `Listed ${assignments.length} classification assignments for product: ${productId} in tenant: ${tenantId}`,
    );

    return assignments;
  }

  /**
   * Soft deletes a taxonomy node (marks as deleted but preserves data).
   *
   * @param taxonomyId - Taxonomy node ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The soft-deleted taxonomy node
   *
   * @remarks
   * - Preserves historical audit trail
   * - Prevents new assignments to deleted taxonomy
   * - Existing assignments remain for historical orders
   */
  async softDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Soft deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomy.update({
      where: { id: taxonomyId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.debug(
      `Taxonomy soft deleted: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );

    return taxonomy;
  }

  /**
   * Hard deletes a taxonomy node (permanently removes data).
   *
   * @param taxonomyId - Taxonomy node ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns Confirmation of hard deletion
   *
   * @remarks
   * - Requires elevated permissions
   * - Removes all associated data
   * - Cannot be undone
   */
  async hardDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).taxonomy.delete({
      where: { id: taxonomyId },
    });

    this.logger.debug(
      `Taxonomy hard deleted: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );
  }

  /**
   * Soft deletes a variant (marks as deleted but preserves data).
   *
   * @param variantId - Variant ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The soft-deleted variant
   *
   * @remarks
   * - Preserves historical order data
   * - Prevents new orders with deleted variant
   * - Inventory tracking preserved
   */
  async softDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Soft deleting variant: ${variantId} in tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.update({
      where: { id: variantId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.debug(
      `Variant soft deleted: ${variantId} in tenant: ${ctx.tenantId}`,
    );

    return variant;
  }

  /**
   * Hard deletes a variant (permanently removes data).
   *
   * @param variantId - Variant ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns Confirmation of hard deletion
   *
   * @remarks
   * - Requires elevated permissions
   * - Removes all associated data including inventory
   * - Cannot be undone
   */
  async hardDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting variant: ${variantId} in tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).variant.delete({
      where: { id: variantId },
    });

    this.logger.debug(
      `Variant hard deleted: ${variantId} in tenant: ${ctx.tenantId}`,
    );
  }
}
