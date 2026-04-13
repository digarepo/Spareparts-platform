import { ulid } from 'ulid';

/**
 * Generates valid ULID strings for testing.
 */
export function generateUlid(): string {
  return ulid();
}

/**
 * Creates a valid Ethiopian address structure for testing.
 */
export function createEthiopianAddress(overrides?: Partial<any>) {
  return {
    street: 'Bole Road, Building 123',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    subCity: 'Bole',
    woreda: '05',
    postalCode: '1000',
    country: 'Ethiopia',
    ...overrides,
  };
}

/**
 * Creates valid Ethiopian monetary amounts as strings.
 */
export function createEthiopianAmount(amount: number | string): string {
  return String(amount);
}

/**
 * Creates a timestamp for price freshness testing.
 */
export function createPriceTimestamp(date?: Date): Date {
  return date || new Date();
}
