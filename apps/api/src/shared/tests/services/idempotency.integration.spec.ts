import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { IdempotencyService, IdempotencyState } from '../../services/idempotency.service';
import Redis from 'ioredis';

describe('IdempotencyService Integration - Real Redis Infrastructure', () => {
  let idempotencyService: IdempotencyService;
  let testRedis: Redis;

  beforeAll(async () => {
    console.log('🔧 Manual Infrastructure Verification Starting...');

    // Manual Redis connection verification
    try {
      testRedis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: 15, // Test DB
      });

      const pingResult = await testRedis.ping();
      console.log(`✅ Redis ping successful: ${pingResult}`);

      if (pingResult !== 'PONG') {
        throw new Error(`Redis ping failed: Expected PONG, got ${pingResult}`);
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw new Error('INFRASTRUCTURE_NOT_READY: Redis connection failed');
    }

    // Manual Prisma connection verification
    try {
      const { PrismaClient } = await import('@prisma/client');
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || 'postgresql://test_spareparts:test_spareparts@localhost:5433/test_spareparts',
          },
        },
      });

      await testPrisma.$connect();
      const queryResult = await testPrisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Prisma connection successful:', queryResult);
      await testPrisma.$disconnect();
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      throw new Error('INFRASTRUCTURE_NOT_READY: Prisma connection failed');
    }

    // Initialize IdempotencyService with real Redis
    idempotencyService = new IdempotencyService(testRedis);
    console.log('✅ IdempotencyService initialized with real Redis');
  });

  beforeEach(async () => {
    // Clean up any existing test keys
    const keys = await testRedis.keys('test:idempotency:*');
    if (keys.length > 0) {
      await testRedis.del(...keys);
    }
  });

  afterEach(async () => {
    // Clean up after each test
    const keys = await testRedis.keys('test:idempotency:*');
    if (keys.length > 0) {
      await testRedis.del(...keys);
    }
  });

  afterAll(async () => {
    if (testRedis) {
      await testRedis.quit();
    }
  });

  describe('Redis Atomic Operations - SET NX EX', () => {
    it('should use atomic SET NX EX for new idempotency keys', async () => {
      const key = 'test:idempotency:set-nx-ex-test';
      const testData = { message: 'test data' };

      // First call should succeed (NX = Not Exists)
      const result1 = await idempotencyService.checkAndMarkProcessing(key);

      expect(result1.isNew).toBe(true);
      expect(result1.result).toBeUndefined();

      // Verify key exists in Redis with correct TTL (processing TTL is 5 minutes)
      const exists = await testRedis.exists(key);
      expect(exists).toBe(1);

      const ttl = await testRedis.ttl(key);
      expect(ttl).toBeGreaterThan(250); // Should be close to 300 seconds (5 minutes)
      expect(ttl).toBeLessThanOrEqual(300);

      // Second call should fail (NX = Not Exists, but key now exists)
      const result2 = await idempotencyService.checkAndMarkProcessing(key);

      expect(result2.isNew).toBe(false);
      expect(result2.result?.state).toBe(IdempotencyState.PROCESSING);
    });

    it('should handle processing state TTL correctly', async () => {
      const key = 'test:idempotency:ttl-test';

      // Mark as processing
      const result = await idempotencyService.checkAndMarkProcessing(key);
      expect(result.isNew).toBe(true);

      // Key should exist with correct TTL (5 minutes)
      let exists = await testRedis.exists(key);
      expect(exists).toBe(1);

      const ttl = await testRedis.ttl(key);
      expect(ttl).toBeGreaterThan(250); // Should be close to 300 seconds
      expect(ttl).toBeLessThanOrEqual(300);

      // Mark as success to test different TTL (24 hours for success)
      await idempotencyService.saveSuccessResult(key, { test: 'data' });

      const successTtl = await testRedis.ttl(key);
      expect(successTtl).toBeGreaterThan(86000); // Should be close to 24 hours (86400 seconds)
      expect(successTtl).toBeLessThanOrEqual(86400);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should prevent race conditions with concurrent requests', async () => {
      const key = 'test:idempotency:concurrent-test';
      const concurrentRequests = 10;

      // Fire multiple concurrent requests
      const promises = Array.from({ length: concurrentRequests }, () =>
        idempotencyService.checkAndMarkProcessing(key)
      );

      const results = await Promise.all(promises);

      // Only one should succeed (isNew = true)
      const successful = results.filter(r => r.isNew);
      const failed = results.filter(r => !r.isNew);

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(concurrentRequests - 1);

      // All should return processing state for the ones that failed (isNew=false)
      results.forEach(result => {
        if (!result.isNew) {
          expect(result.result?.state).toBe(IdempotencyState.PROCESSING);
        } else {
          expect(result.result).toBeUndefined();
        }
      });
    });

    it('should handle concurrent success marking safely', async () => {
      const key = 'test:idempotency:concurrent-success';
      const successData = { orderId: 'order-123', amount: 250.00 };

      // First, mark as processing
      await idempotencyService.checkAndMarkProcessing(key);

      // Fire multiple concurrent success operations
      const promises = Array.from({ length: 5 }, () =>
        idempotencyService.saveSuccessResult(key, successData)
      );

      const results = await Promise.allSettled(promises);

      // All should succeed (Redis SET is idempotent for same value)
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });

      // Verify the stored data
      const storedData = await testRedis.get(key);
      const parsedData = JSON.parse(storedData!);

      expect(parsedData.state).toBe(IdempotencyState.SUCCESS);
      expect(parsedData.data).toEqual(successData);
    });
  });

  describe('Result Replay and Caching', () => {
    it('should replay cached success results', async () => {
      const key = 'test:idempotency:replay-success';
      const originalData = { orderId: 'order-456', total: 450.00 };

      // Mark as processing
      await idempotencyService.checkAndMarkProcessing(key);

      // Mark as success
      await idempotencyService.saveSuccessResult(key, originalData);

      // Subsequent calls should return cached result
      const cachedResult = await idempotencyService.checkAndMarkProcessing(key);

      expect(cachedResult.isNew).toBe(false);
      expect(cachedResult.result?.state).toBe(IdempotencyState.SUCCESS);
      expect(cachedResult.result?.data).toEqual(originalData);
    });

    it('should replay cached failure results', async () => {
      const key = 'test:idempotency:replay-failure';
      const errorMessage = 'Payment failed: Insufficient funds';

      // Mark as processing
      await idempotencyService.checkAndMarkProcessing(key);

      // Mark as failure
      await idempotencyService.saveFailureResult(key, errorMessage);

      // Subsequent calls should return cached failure
      const cachedResult = await idempotencyService.checkAndMarkProcessing(key);

      expect(cachedResult.isNew).toBe(false);
      expect(cachedResult.result?.state).toBe(IdempotencyState.FAILED);
      expect(cachedResult.result?.error).toBe(errorMessage);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Redis unavailability gracefully', async () => {
      // Create a service with disconnected Redis
      const disconnectedRedis = new Redis({
        host: 'nonexistent-host',
        port: 9999,
        maxRetriesPerRequest: 0, // Fail fast
      });

      const disconnectedService = new IdempotencyService(disconnectedRedis);

      const result = await disconnectedService.checkAndMarkProcessing('test-key');

      expect(result.isNew).toBe(false);
      expect(result.result?.state).toBe(IdempotencyState.FAILED);
      expect(result.result?.error).toContain('Redis unavailable');

      await disconnectedRedis.quit();
    });

    it('should handle invalid JSON data gracefully', async () => {
      const key = 'test:idempotency:invalid-json';

      // Manually set invalid JSON in Redis
      await testRedis.setex(key, 60, 'invalid-json-data');

      // Service should handle gracefully
      const result = await idempotencyService.checkAndMarkProcessing(key);

      expect(result.isNew).toBe(false);
      expect(result.result?.state).toBe(IdempotencyState.FAILED);
    });

    it('should clean up expired keys properly', async () => {
      const key = 'test:idempotency:cleanup-test';

      // Create and immediately expire a key
      await testRedis.setex(key, 1, JSON.stringify({
        state: IdempotencyState.PROCESSING,
        timestamp: Date.now()
      }));

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Key should be gone and we should be able to create new one
      const result = await idempotencyService.checkAndMarkProcessing(key);
      expect(result.isNew).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-volume operations efficiently', async () => {
      const operationCount = 100;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      // Create many concurrent operations
      for (let i = 0; i < operationCount; i++) {
        const key = `test:idempotency:perf-${i}`;
        promises.push(idempotencyService.checkAndMarkProcessing(key));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All should succeed (unique keys)
      const successful = results.filter(r => r.isNew);
      expect(successful).toHaveLength(operationCount);

      // Performance check (should complete in reasonable time)
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds max for 100 operations

      console.log(`⚡ Processed ${operationCount} operations in ${duration}ms`);
    });
  });
});
