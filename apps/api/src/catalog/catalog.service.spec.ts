import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repository';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { RequestContext, ProductCreateRequest, TaxonomyCreateRequest, ClassificationAssignRequest } from '@spareparts/contracts';

describe('CatalogService', () => {
  let service: CatalogService;
  let repository: CatalogRepository;
  let mockContext: RequestContext;

  beforeEach(() => {
    // Mock repository
    repository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createVariant: vi.fn(),
      findVariantById: vi.fn(),
      findByVariantSku: vi.fn(),
      listVariants: vi.fn(),
      updateVariant: vi.fn(),
      deleteVariant: vi.fn(),
      createTaxonomy: vi.fn(),
      findTaxonomyById: vi.fn(),
      findTaxonomyByLabelAndParent: vi.fn(),
      listTaxonomies: vi.fn(),
      updateTaxonomy: vi.fn(),
      deleteTaxonomy: vi.fn(),
      isTaxonomyDescendant: vi.fn(),
      createClassificationAssignment: vi.fn(),
      findClassificationAssignment: vi.fn(),
      deleteClassificationAssignment: vi.fn(),
      listClassificationAssignments: vi.fn(),
      softDeleteTaxonomy: vi.fn(),
      hardDeleteTaxonomy: vi.fn(),
      softDeleteVariant: vi.fn(),
      hardDeleteVariant: vi.fn(),
    } as any;

    service = new CatalogService(repository);

    // Mock context
    mockContext = {
      correlationId: 'test-correlation-id',
      actor: {
        kind: 'tenant',
        scope: 'tenant',
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
      },
      tenantId: 'test-tenant-id',
    };
  });

  describe('Product Operations', () => {
    describe('createProduct', () => {
      it('should create a product successfully', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        const expectedProduct = {
          id: 'test-product-id',
          name: productRequest.name,
          slug: productRequest.slug,
          description: productRequest.description,
          status: 'draft' as const,
          tenantId: 'test-tenant-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.spyOn(repository, 'findBySlug').mockResolvedValue(null);
        vi.spyOn(repository, 'create').mockResolvedValue(expectedProduct);

        // Act
        const result = await service.createProduct(productRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(repository.findBySlug).toHaveBeenCalledWith('test-product', 'test-tenant-id');
        expect(repository.create).toHaveBeenCalledWith({
          ...productRequest,
          slug: 'test-product',
          status: 'draft',
          tenantId: 'test-tenant-id',
        }, mockContext);
      });

      it('should throw ConflictException when slug already exists', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        vi.spyOn(repository, 'findBySlug').mockResolvedValue({
          id: 'existing-product-id',
          slug: 'test-product',
          name: 'Existing Product',
          status: 'draft',
          tenantId: 'test-tenant-id',
        } as any);

        // Act & Assert
        await expect(service.createProduct(productRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });

      it('should throw BadRequestException when tenant context is missing', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        const invalidContext = {
          ...mockContext,
          tenantId: undefined,
        };

        // Act & Assert
        await expect(service.createProduct(productRequest, invalidContext))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('updateProduct', () => {
      it('should update a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const updateRequest = {
          name: 'Updated Product',
          description: 'Updated Description',
        };

        const existingProduct = {
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          status: 'draft',
          tenantId: 'test-tenant-id',
        };

        const updatedProduct = {
          ...existingProduct,
          ...updateRequest,
          updatedAt: new Date(),
        };

        vi.spyOn(repository, 'findById').mockResolvedValue(existingProduct);
        vi.spyOn(repository, 'findBySku').mockResolvedValue(null);
        vi.spyOn(repository, 'update').mockResolvedValue(updatedProduct);

        // Act
        const result = await service.updateProduct(productId, updateRequest, mockContext);

        // Assert
        expect(result).toEqual(updatedProduct);
        expect(repository.findById).toHaveBeenCalledWith(productId, 'test-tenant-id');
        expect(repository.update).toHaveBeenCalledWith(productId, updateRequest, mockContext);
      });

      it('should throw NotFoundException when product not found', async () => {
        // Arrange
        const productId = 'non-existent-product-id';
        const updateRequest = { name: 'Updated Product' };

        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        // Act & Assert
        await expect(service.updateProduct(productId, updateRequest, mockContext))
          .rejects.toThrow(NotFoundException);
      });
    });

    describe('publishProduct', () => {
      it('should publish a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const existingProduct = {
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          status: 'draft',
          slug: 'test-product',
          tenantId: 'test-tenant-id',
        };

        const publishedProduct = {
          ...existingProduct,
          status: 'published',
          publishedAt: new Date(),
        };

        vi.spyOn(repository, 'findById').mockResolvedValue(existingProduct);
        vi.spyOn(repository, 'update').mockResolvedValue(publishedProduct);

        // Act
        const result = await service.publishProduct(productId, mockContext);

        // Assert
        expect(result).toEqual(publishedProduct);
        expect(repository.update).toHaveBeenCalledWith(productId, {
          status: 'published',
          publishedAt: expect.any(Date),
        }, mockContext);
      });

      it('should throw BadRequestException when product is already published', async () => {
        // Arrange
        const productId = 'test-product-id';
        const existingProduct = {
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          status: 'published',
          tenantId: 'test-tenant-id',
        };

        vi.spyOn(repository, 'findById').mockResolvedValue(existingProduct);

        // Act & Assert
        await expect(service.publishProduct(productId, mockContext))
          .rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Taxonomy Operations', () => {
    describe('createTaxonomy', () => {
      it('should create taxonomy successfully', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Test Category',
          parentId: null,
          metadata: {},
        };

        const expectedTaxonomy = {
          id: 'test-taxonomy-id',
          ...taxonomyRequest,
          tenantId: 'test-tenant-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.spyOn(repository, 'findTaxonomyByLabelAndParent').mockResolvedValue(null);
        vi.spyOn(repository, 'createTaxonomy').mockResolvedValue(expectedTaxonomy);

        // Act
        const result = await service.createTaxonomy(taxonomyRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedTaxonomy);
        expect(repository.findTaxonomyByLabelAndParent).toHaveBeenCalledWith(
          'Test Category',
          null,
          'test-tenant-id'
        );
      });

      it('should throw ConflictException when label already exists in parent scope', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Test Category',
          parentId: null,
          metadata: {},
        };

        vi.spyOn(repository, 'findTaxonomyByLabelAndParent').mockResolvedValue({
          id: 'existing-taxonomy-id',
          label: 'Test Category',
        } as any);

        // Act & Assert
        await expect(service.createTaxonomy(taxonomyRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });

      it('should throw ForbiddenException when non-platform operator tries to create platform-owned taxonomy', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Platform Category',
          parentId: null,
          isPlatformOwned: true,
        };

        vi.spyOn(repository, 'findTaxonomyByLabelAndParent').mockResolvedValue(null);

        // Act & Assert
        await expect(service.createTaxonomy(taxonomyRequest, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateTaxonomy', () => {
      it('should update taxonomy successfully', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const updateRequest = {
          label: 'Updated Category',
        };

        const existingTaxonomy = {
          id: taxonomyId,
          label: 'Test Category',
          parentId: null,
          tenantId: 'test-tenant-id',
          isPlatformOwned: false,
        };

        const updatedTaxonomy = {
          ...existingTaxonomy,
          ...updateRequest,
          updatedAt: new Date(),
        };

        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue(existingTaxonomy);
        vi.spyOn(repository, 'findTaxonomyByLabelAndParent').mockResolvedValue(null);
        vi.spyOn(repository, 'updateTaxonomy').mockResolvedValue(updatedTaxonomy);

        // Act
        const result = await service.updateTaxonomy(taxonomyId, updateRequest, mockContext);

        // Assert
        expect(result).toEqual(updatedTaxonomy);
      });

      it('should throw ForbiddenException when non-platform operator tries to modify platform-owned taxonomy', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const updateRequest = { label: 'Updated Category' };

        const platformTaxonomy = {
          id: taxonomyId,
          label: 'Platform Category',
          parentId: null,
          tenantId: 'test-tenant-id',
          isPlatformOwned: true,
        };

        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue(platformTaxonomy);

        // Act & Assert
        await expect(service.updateTaxonomy(taxonomyId, updateRequest, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Classification Assignment Operations', () => {
    describe('assignProductToTaxonomy', () => {
      it('should assign product to taxonomy successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignmentRequest: ClassificationAssignRequest = {
          productId,
          taxonomyId: 'test-taxonomy-id',
        };

        const existingProduct = {
          id: productId,
          name: 'Test Product',
          tenantId: 'test-tenant-id',
        };

        const existingTaxonomy = {
          id: 'test-taxonomy-id',
          label: 'Test Category',
          tenantId: 'test-tenant-id',
        };

        const expectedAssignment = {
          id: 'assignment-id',
          productId,
          taxonomyId: 'test-taxonomy-id',
          tenantId: 'test-tenant-id',
          assignedAt: new Date(),
          assignedBy: 'test-user-id',
        };

        vi.spyOn(repository, 'findById').mockResolvedValue(existingProduct);
        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue(existingTaxonomy);
        vi.spyOn(repository, 'findClassificationAssignment').mockResolvedValue(null);
        vi.spyOn(repository, 'createClassificationAssignment').mockResolvedValue(expectedAssignment);

        // Act
        const result = await service.assignProductToTaxonomy(productId, assignmentRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedAssignment);
        expect(repository.findById).toHaveBeenCalledWith(productId, 'test-tenant-id');
        expect(repository.findTaxonomyById).toHaveBeenCalledWith('test-taxonomy-id', 'test-tenant-id');
        expect(repository.createClassificationAssignment).toHaveBeenCalledWith(
          productId,
          'test-taxonomy-id',
          'test-tenant-id',
          mockContext
        );
      });

      it('should throw ConflictException when assignment already exists', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignmentRequest: ClassificationAssignRequest = {
          productId,
          taxonomyId: 'test-taxonomy-id',
        };

        vi.spyOn(repository, 'findById').mockResolvedValue({ id: productId } as any);
        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue({ id: 'test-taxonomy-id' } as any);
        vi.spyOn(repository, 'findClassificationAssignment').mockResolvedValue({
          id: 'existing-assignment-id',
        } as any);

        // Act & Assert
        await expect(service.assignProductToTaxonomy(productId, assignmentRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });
    });
  });

  describe('Delete Operations', () => {
    describe('softDeleteTaxonomy', () => {
      it('should soft delete taxonomy successfully', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const existingTaxonomy = {
          id: taxonomyId,
          label: 'Test Category',
          tenantId: 'test-tenant-id',
        };

        const softDeletedTaxonomy = {
          ...existingTaxonomy,
          deletedAt: new Date(),
        };

        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue(existingTaxonomy);
        vi.spyOn(repository, 'softDeleteTaxonomy').mockResolvedValue(softDeletedTaxonomy);

        // Act
        const result = await service.softDeleteTaxonomy(taxonomyId, mockContext);

        // Assert
        expect(result).toEqual(softDeletedTaxonomy);
        expect(repository.findTaxonomyById).toHaveBeenCalledWith(taxonomyId, 'test-tenant-id');
        expect(repository.softDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, mockContext);
      });
    });

    describe('hardDeleteTaxonomy', () => {
      it('should hard delete taxonomy successfully for platform operator', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const platformContext = {
          ...mockContext,
          actor: {
            kind: 'platform' as const,
            scope: 'platform' as const,
            userId: 'platform-operator-id',
          },
        };

        const existingTaxonomy = {
          id: taxonomyId,
          label: 'Test Category',
          tenantId: 'test-tenant-id',
        };

        vi.spyOn(repository, 'findTaxonomyById').mockResolvedValue(existingTaxonomy);
        vi.spyOn(repository, 'hardDeleteTaxonomy').mockResolvedValue();

        // Act
        await service.hardDeleteTaxonomy(taxonomyId, platformContext);

        // Assert
        expect(repository.findTaxonomyById).toHaveBeenCalledWith(taxonomyId, 'test-tenant-id');
        expect(repository.hardDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, platformContext);
      });

      it('should throw ForbiddenException when non-platform operator tries hard delete', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';

        // Act & Assert
        await expect(service.hardDeleteTaxonomy(taxonomyId, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('requireTenantId', () => {
      it('should return tenant ID when present', () => {
        // Act
        const result = (service as any).requireTenantId(mockContext);

        // Assert
        expect(result).toBe('test-tenant-id');
      });

      it('should throw BadRequestException when tenant ID is missing', () => {
        // Arrange
        const invalidContext = {
          ...mockContext,
          tenantId: undefined,
        };

        // Act & Assert
        expect(() => (service as any).requireTenantId(invalidContext))
          .toThrow(BadRequestException);
      });
    });
  });
});
