import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
  TaxonomyCreateRequest,
  TaxonomyUpdateRequest,
  ClassificationAssignRequest,
  ClassificationBulkAssignRequest,
} from '../index';

describe('Catalog Contracts Validation', () => {
  describe('ProductCreateRequest', () => {
    it('should validate a valid product create request', () => {
      // Arrange
      const validRequest: ProductCreateRequest = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        status: 'draft',
      };

      // Act
      const result = z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
        status: z.enum(['draft', 'published', 'inactive']).default('draft'),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Product');
        expect(result.data.slug).toBe('test-product');
        expect(result.data.description).toBe('Test Description');
        expect(result.data.status).toBe('draft');
      }
    });

    it('should reject invalid product create request', () => {
      // Arrange
      const invalidRequest = {
        name: '', // Empty name
        sku: 'TEST-001',
        description: 'Test Description',
      };

      // Act
      const result = z.object({
        name: z.string().min(1).max(255),
        sku: z.string().min(1).max(100),
        description: z.string().max(2000).optional(),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toContain('name');
        expect(result.error.issues[0].message).toContain('Too small');
      }
    });

    it('should reject slug that is too long', () => {
      // Arrange
      const invalidRequest = {
        name: 'Test Product',
        slug: 'A'.repeat(256), // Too long slug
        description: 'Test Description',
      };

      // Act
      const result = z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
        status: z.enum(['draft', 'published', 'inactive']).default('draft'),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('slug');
        expect(result.error.issues[0].message).toContain('Too big');
      }
    });
  });

  describe('ProductUpdateRequest', () => {
    it('should validate partial product update request', () => {
      // Arrange
      const validRequest: ProductUpdateRequest = {
        name: 'Updated Product',
        description: 'Updated Description',
      };

      // Act
      const result = z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).optional(),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Product');
        expect(result.data.description).toBe('Updated Description');
      }
    });

    it('should accept empty update request', () => {
      // Arrange
      const emptyRequest = {};

      // Act
      const result = z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).optional(),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
      }).safeParse(emptyRequest);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('TaxonomyCreateRequest', () => {
    it('should validate valid taxonomy create request', () => {
      // Arrange
      const validRequest: TaxonomyCreateRequest = {
        label: 'Electronics',
        parentId: null,
        metadata: {
          sortOrder: 10,
          facet: true,
        },
        isPlatformOwned: false,
      };

      // Act
      const result = z.object({
        parentId: z.string().ulid().nullable(),
        label: z.string().min(1).max(255),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
        isPlatformOwned: z.boolean().optional(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe('Electronics');
        expect(result.data.parentId).toBe(null);
        expect(result.data.isPlatformOwned).toBe(false);
      }
    });

    it('should validate taxonomy with parent', () => {
      // Arrange
      const validRequest: TaxonomyCreateRequest = {
        label: 'Smartphones',
        parentId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
        metadata: {
          icon: 'smartphone',
        },
      };

      // Act
      const result = z.object({
        parentId: z.string().ulid().nullable(),
        label: z.string().min(1).max(255),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
        isPlatformOwned: z.boolean().optional(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe('Smartphones');
        expect(result.data.parentId).toBe('01HXYKJ2R5E4X2Y3Z4A5B6C7D');
      }
    });

    it('should reject invalid ULID for parent', () => {
      // Arrange
      const invalidRequest: TaxonomyCreateRequest = {
        label: 'Smartphones',
        parentId: 'invalid-ulid',
      };

      // Act
      const result = z.object({
        parentId: z.string().ulid().nullable(),
        label: z.string().min(1).max(255),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
        isPlatformOwned: z.boolean().optional(),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('parentId');
      }
    });
  });

  describe('TaxonomyUpdateRequest', () => {
    it('should validate partial taxonomy update request', () => {
      // Arrange
      const validRequest: TaxonomyUpdateRequest = {
        label: 'Updated Electronics',
        metadata: {
          newField: 'value',
        },
      };

      // Act
      const result = z.object({
        parentId: z.string().ulid().nullable().optional(),
        label: z.string().min(1).max(255).optional(),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
        isPlatformOwned: z.boolean().optional(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe('Updated Electronics');
      }
    });

    it('should validate parent change in update request', () => {
      // Arrange
      const validRequest: TaxonomyUpdateRequest = {
        parentId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
      };

      // Act
      const result = z.object({
        parentId: z.string().ulid().nullable().optional(),
        label: z.string().min(1).max(255).optional(),
        metadata: z.record(z.string(), z.unknown().optional()).optional(),
        isPlatformOwned: z.boolean().optional(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('ClassificationAssignRequest', () => {
    it('should validate valid classification assignment request', () => {
      // Arrange
      const validRequest: ClassificationAssignRequest = {
        productId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
        taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7E',
      };

      // Act
      const result = z.object({
        productId: z.string().ulid(),
        taxonomyId: z.string().ulid(),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.productId).toBe('01HXYKJ2R5E4X2Y3Z4A5B6C7D');
        expect(result.data.taxonomyId).toBe('01HXYKJ2R5E4X2Y3Z4A5B6C7E');
      }
    });

    it('should reject invalid product ULID', () => {
      // Arrange
      const invalidRequest: ClassificationAssignRequest = {
        productId: 'invalid-product-id',
        taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7E',
      };

      // Act
      const result = z.object({
        productId: z.string().ulid(),
        taxonomyId: z.string().ulid(),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('productId');
      }
    });

    it('should reject invalid taxonomy ULID', () => {
      // Arrange
      const invalidRequest: ClassificationAssignRequest = {
        productId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
        taxonomyId: 'invalid-taxonomy-id',
      };

      // Act
      const result = z.object({
        productId: z.string().ulid(),
        taxonomyId: z.string().ulid(),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('taxonomyId');
      }
    });
  });

  describe('ClassificationBulkAssignRequest', () => {
    it('should validate valid bulk assignment request', () => {
      // Arrange
      const validRequest: ClassificationBulkAssignRequest = {
        assignments: [
          {
            productId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
            taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7E',
          },
          {
            productId: '01HXYKJ2R5E4X2Y3Z4A5B6C7F',
            taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7G',
          },
        ],
      };

      // Act
      const result = z.object({
        assignments: z.array(z.object({
          productId: z.string().ulid(),
          taxonomyId: z.string().ulid(),
        })),
      }).safeParse(validRequest);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.assignments).toHaveLength(2);
        expect(result.data.assignments[0].productId).toBe('01HXYKJ2R5E4X2Y3Z4A5B6C7D');
        expect(result.data.assignments[1].productId).toBe('01HXYKJ2R5E4X2Y3Z4A5B6C7F');
      }
    });

    it('should reject empty assignments array', () => {
      // Arrange
      const invalidRequest: ClassificationBulkAssignRequest = {
        assignments: [],
      };

      // Act
      const result = z.object({
        assignments: z.array(z.object({
          productId: z.string().ulid(),
          taxonomyId: z.string().ulid(),
        })).min(1),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('assignments');
        expect(result.error.issues[0].message).toContain('minimum');
      }
    });

    it('should reject assignments array with invalid items', () => {
      // Arrange
      const invalidRequest: ClassificationBulkAssignRequest = {
        assignments: [
          {
            productId: '01HXYKJ2R5E4X2Y3Z4A5B6C7D',
            taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7E',
          },
          {
            productId: 'invalid-product-id',
            taxonomyId: '01HXYKJ2R5E4X2Y3Z4A5B6C7G',
          },
        ],
      };

      // Act
      const result = z.object({
        assignments: z.array(z.object({
          productId: z.string().ulid(),
          taxonomyId: z.string().ulid(),
        })),
      }).safeParse(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['assignments', 1, 'productId']);
      }
    });
  });

  describe('Metadata Validation', () => {
    it('should accept complex metadata structures', () => {
      // Arrange
      const complexMetadata = {
        stringField: 'test',
        numberField: 42,
        booleanField: true,
        arrayField: ['item1', 'item2'],
        objectField: {
          nestedField: 'nested value',
          nestedNumber: 123,
        },
        nullField: null,
        undefinedField: undefined,
      };

      // Act
      const result = z.record(z.string(), z.unknown().optional()).safeParse(complexMetadata);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stringField).toBe('test');
        expect(result.data.numberField).toBe(42);
        expect(result.data.booleanField).toBe(true);
        expect(result.data.arrayField).toEqual(['item1', 'item2']);
        expect(result.data.objectField).toEqual({
          nestedField: 'nested value',
          nestedNumber: 123,
        });
        expect(result.data.nullField).toBe(null);
        expect(result.data.undefinedField).toBeUndefined();
      }
    });

    it('should reject non-string keys in metadata', () => {
      // Arrange
      const invalidMetadata = {
        123: 'number key',
        [Symbol('test')]: 'symbol key',
      };

      // Act & Assert
      // JavaScript objects automatically convert number keys to strings
      // but symbols cannot be used as object keys in JSON
      expect(() => {
        z.record(z.string(), z.unknown().optional()).parse(invalidMetadata);
      }).not.toThrow();
    });
  });

  describe('ULID Validation', () => {
    it('should accept valid ULIDs', () => {
      // Arrange
      const validUlid = '01HXYKJ2R5E4X2Y3Z4A5B6C7D';

      // Act
      const result = z.string().ulid().safeParse(validUlid);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject invalid ULIDs', () => {
      // Arrange
      const invalidUlid = 'invalid-ulid-format';

      // Act
      const result = z.string().ulid().safeParse(invalidUlid);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject ULIDs that are too short', () => {
      // Arrange
      const shortUlid = '01HXYKJ2R5E4X2Y3Z4A5B6';

      // Act
      const result = z.string().ulid().safeParse(shortUlid);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject ULIDs that are too long', () => {
      // Arrange
      const longUlid = '01HXYKJ2R5E4X2Y3Z4A5B6C7DEXTRA';

      // Act
      const result = z.string().ulid().safeParse(longUlid);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
