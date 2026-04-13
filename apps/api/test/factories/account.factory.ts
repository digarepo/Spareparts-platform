import { generateUlid, createEthiopianAmount, createPriceTimestamp } from './index';

/**
 * Factory for creating Account test data matching the Prisma schema.
 */
export class AccountFactory {
  static createAccount(overrides?: Partial<Account>): Account {
    return {
      id: generateUlid(),
      identityId: generateUlid(),
      scopeCode: 'customer',
      tenantId: generateUlid(),
      accountStatusCode: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createCustomerAccount(tenantId?: string): Account {
    return this.createAccount({
      scopeCode: 'customer',
      tenantId: tenantId || generateUlid(),
      accountStatusCode: 'active',
    });
  }

  static createTenantAccount(tenantId: string): Account {
    return this.createAccount({
      scopeCode: 'tenant',
      tenantId,
      accountStatusCode: 'active',
    });
  }

  static createInactiveAccount(): Account {
    return this.createAccount({
      accountStatusCode: 'inactive',
    });
  }
}

// Type definition matching Prisma schema
export interface Account {
  id: string;
  identityId: string;
  scopeCode: string;
  tenantId: string | null;
  accountStatusCode: string;
  createdAt: Date;
  updatedAt: Date;
}
