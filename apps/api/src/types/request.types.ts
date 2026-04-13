import { Request } from 'express';

/**
 * Authenticated User Interface.
 *
 * @remarks
 * - **Scope:** User authentication context
 * - **Authority:** JWT token claims
 * - **Invariants:** Required fields for authorization
 */
export interface AuthenticatedUser {
  sub: string; // User ID
  scopes: string[]; // User scopes/permissions
  tenantId: string; // Tenant context
  [key: string]: unknown; // Additional user properties
}

/**
 * Enhanced Request Interface with Authentication.
 *
 * @remarks
 * - **Scope:** HTTP request with authentication context
 * - **Authority:** Express request extension
 * - **Invariants:** Type-safe user access
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Request Body Types for Checkout and Order Operations.
 *
 * @remarks
 * - **Scope:** Type-safe request body validation
 * - **Authority:** Business logic contracts
 * - **Invariants:** Strict typing for all operations
 */

export interface OrderTransitionRequestBody {
  status: string;
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutRequestBody {
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  paymentMethod?: {
    type: string;
    provider: string;
    [key: string]: unknown;
  };
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ReservationRequestBody {
  reservationDuration?: number;
  items?: Array<{
    cartItemId: string;
    quantity: number;
  }>;
}
