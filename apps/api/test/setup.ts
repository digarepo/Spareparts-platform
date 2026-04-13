import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Test infrastructure configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test_spareparts:test_spareparts@localhost:5433/test_spareparts';
const REDIS_TEST_DB = parseInt(process.env.REDIS_TEST_DB || '15', 10);
const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'test:idempotency:';

// Global test infrastructure
let prisma: PrismaClient;
let redis: Redis;

/**
 * Initialize Redis client for tests (DB 15 with prefix)
 */
async function initializeRedis(): Promise<Redis> {
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: REDIS_TEST_DB,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  });

  // Test Redis connection
  try {
    const pong = await redisClient.ping();
    console.log(`✅ Redis test connection established (DB ${REDIS_TEST_DB}): ${pong}`);
    return redisClient;
  } catch (error) {
    console.error('❌ Redis test connection failed:', error);
    throw new Error('REDIS_NOT_READY: Unable to connect to Redis test database');
  }
}

/**
 * Initialize Prisma client for tests
 */
async function initializePrisma(): Promise<PrismaClient> {
  const testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_DATABASE_URL,
      },
    },
  });

  try {
    await testPrisma.$connect();

    // Test database connection
    await testPrisma.$queryRaw`SELECT 1`;
    console.log('✅ Prisma test connection established');
    return testPrisma;
  } catch (error) {
    console.error('❌ Prisma test connection failed:', error);
    throw new Error('DATABASE_NOT_READY: Unable to connect to test database');
  }
}

/**
 * Clean up Redis test keys
 */
async function cleanupRedis(): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(`${REDIS_KEY_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Cleaned up ${keys.length} Redis test keys`);
    }
  } catch (error) {
    console.warn('⚠️ Redis cleanup warning:', error);
  }
}

/**
 * Clean up test database tables
 */
async function cleanupDatabase(): Promise<void> {
  if (!prisma) return;

  try {
    // Clean up in dependency order (foreign key constraints)
    const tables = [
      'order_status_history',
      'cart_status_history',
      'order_item',
      'cart_item',
      'order',
      'cart',
      'inventory_audit_event',
      'stock_movement',
      'inventory_allocation',
      'inventory_reservation',
      'inventory_item',
      'account_role',
      'session',
      'password_credential',
      'account',
      'tenant_membership',
      'user',
      'tenant',
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      } catch (error) {
        // Table might not exist, continue
        console.warn(`⚠️ Could not truncate table ${table}:`, error.message);
      }
    }

    console.log('🧹 Cleaned up test database tables');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

beforeAll(async () => {
  console.log('🚀 Setting up test infrastructure...');

  try {
    // Initialize Redis (DB 15)
    redis = await initializeRedis();

    // Initialize Prisma (test database)
    prisma = await initializePrisma();

    // Initial cleanup
    await cleanupRedis();
    await cleanupDatabase();

    console.log('✅ Test infrastructure ready');
  } catch (error) {
    console.error('❌ Test infrastructure setup failed:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Clean up before each test to ensure isolation
  await cleanupRedis();
});

afterEach(async () => {
  // Clean up after each test
  await cleanupRedis();
});

afterAll(async () => {
  console.log('🧹 Tearing down test infrastructure...');

  try {
    // Final cleanup
    await cleanupRedis();
    await cleanupDatabase();

    // Disconnect
    if (redis) {
      await redis.quit();
    }
    if (prisma) {
      await prisma.$disconnect();
    }

    console.log('✅ Test infrastructure torn down');
  } catch (error) {
    console.error('❌ Test infrastructure teardown failed:', error);
  }
});

// Global test utilities
declare global {
  var prisma: PrismaClient;
  var redis: Redis;
  var REDIS_KEY_PREFIX: string;
}

// Make available globally for tests
(globalThis as any).prisma = prisma;
(globalThis as any).redis = redis;
(globalThis as any).REDIS_KEY_PREFIX = REDIS_KEY_PREFIX;
