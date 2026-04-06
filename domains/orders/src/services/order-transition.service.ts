import { OrderAggregate, OrderAggregateFactory } from '../order.aggregate';

/**
 * Order transition service with state machine enforcement.
 *
 * @remarks
 * - **Scope:** order lifecycle management
 * - **Authority:** domain business rules only
 * - **Invariants:** order transitions follow strict state machine
 * - **Security:** prevents unauthorized state changes
 */
export class OrderTransitionService {
  /**
   * Processes order transition with validation and side effects.
   *
   * @param params - Transition parameters
   * @returns Updated order aggregate
   * @throws Error - If transition is not allowed
   *
   * @remarks
   * - Validates transition eligibility
   * - Executes transition with audit trail
   * - Handles side effects (inventory, notifications)
   * - Ensures atomicity of transition
   */
  static async processTransition(params: {
    order: OrderAggregate;
    targetStatus: 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    initiatedBy: string;
    reason?: string;
    sideEffects?: {
      onConfirm?: (order: OrderAggregate) => Promise<void>;
      onShip?: (order: OrderAggregate) => Promise<void>;
      onComplete?: (order: OrderAggregate) => Promise<void>;
      onCancel?: (order: OrderAggregate, reason: string) => Promise<void>;
      onFail?: (order: OrderAggregate, reason: string) => Promise<void>;
    };
  }): Promise<OrderAggregate> {
    const { order, targetStatus, initiatedBy, reason, sideEffects } = params;

    let updatedOrder: OrderAggregate;

    // Process transition based on target status
    switch (targetStatus) {
      case 'CONFIRMED':
        updatedOrder = OrderAggregateFactory.confirm(order, initiatedBy);
        if (sideEffects?.onConfirm) {
          await sideEffects.onConfirm(updatedOrder);
        }
        break;

      case 'SHIPPED':
        updatedOrder = OrderAggregateFactory.ship(order, initiatedBy);
        if (sideEffects?.onShip) {
          await sideEffects.onShip(updatedOrder);
        }
        break;

      case 'COMPLETED':
        updatedOrder = OrderAggregateFactory.complete(order, initiatedBy);
        if (sideEffects?.onComplete) {
          await sideEffects.onComplete(updatedOrder);
        }
        break;

      case 'CANCELLED':
        if (!reason) {
          throw new Error('Reason is required for order cancellation');
        }
        updatedOrder = OrderAggregateFactory.cancel(order, reason, initiatedBy);
        if (sideEffects?.onCancel) {
          await sideEffects.onCancel(updatedOrder, reason);
        }
        break;

      case 'FAILED':
        if (!reason) {
          throw new Error('Reason is required for order failure');
        }
        updatedOrder = OrderAggregateFactory.markAsFailed(order, reason, initiatedBy);
        if (sideEffects?.onFail) {
          await sideEffects.onFail(updatedOrder, reason);
        }
        break;

      default:
        throw new Error(`Invalid target status: ${targetStatus}`);
    }

    return updatedOrder;
  }

  /**
   * Validates transition eligibility without executing.
   *
   * @param params - Validation parameters
   * @returns Validation result
   *
   * @remarks
   * - Used for pre-transition validation
   * - Provides feedback on why transition might fail
   * - Does not execute any side effects
   * - FIXED: Uses isTerminal() instead of canBeModified() for proper logic
   */
  static validateTransitionEligibility(params: {
    order: OrderAggregate;
    targetStatus: 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    initiatedBy: string;
  }): {
    canTransition: boolean;
    reason?: string;
    requirements?: Array<{
      type: 'missing_data' | 'invalid_state' | 'permission_denied';
      description: string;
    }>;
  } {
    const { order, targetStatus } = params;

    // FIXED: Use isTerminal() instead of canBeModified() for proper logic
    // Terminal orders cannot transition at all (except for special cases)
    if (order.status.isTerminal() && targetStatus !== 'FAILED') { // Allow retry from FAILED to PENDING
      return {
        canTransition: false,
        reason: `Order cannot be modified from terminal status: ${order.status.value}`,
        requirements: [{
          type: 'invalid_state',
          description: 'Order is in a terminal state and cannot be modified',
        }],
      };
    }

    // Check specific transition requirements
    const requirements: Array<{
      type: 'missing_data' | 'invalid_state' | 'permission_denied';
      description: string;
    }> = [];

    switch (targetStatus) {
      case 'CONFIRMED':
        if (order.status.value !== 'PENDING') {
          requirements.push({
            type: 'invalid_state',
            description: 'Order must be in PENDING status to be confirmed',
          });
        }
        break;

      case 'SHIPPED':
        if (order.status.value !== 'CONFIRMED') {
          requirements.push({
            type: 'invalid_state',
            description: 'Order must be confirmed before it can be shipped',
          });
        }
        break;

      case 'COMPLETED':
        if (order.status.value !== 'SHIPPED') {
          requirements.push({
            type: 'invalid_state',
            description: 'Order must be shipped before it can be completed',
          });
        }
        break;

      case 'CANCELLED':
        if (!order.status.canBeCancelled()) {
          requirements.push({
            type: 'invalid_state',
            description: 'Order cannot be cancelled from current status',
          });
        }
        break;

      case 'FAILED':
        if (!['CONFIRMED', 'IN_PROGRESS', 'SHIPPED'].includes(order.status.value)) {
          requirements.push({
            type: 'invalid_state',
            description: 'Order must be in progress to be marked as failed',
          });
        }
        break;
    }

    return {
      canTransition: requirements.length === 0,
      reason: requirements.length > 0 ? requirements[0]?.description : undefined,
      requirements: requirements.length > 0 ? requirements : undefined,
    };
  }

  /**
   * Gets available transitions for current order state.
   *
   * @param order - Order aggregate
   * @returns List of possible transitions
   *
   * @remarks
   * - Used for UI state management
   * - Provides context for available actions
   * - Helps prevent invalid API calls
   */
  static getAvailableTransitions(order: OrderAggregate): Array<{
    status: string;
    label: string;
    description: string;
    requiresReason: boolean;
    requiresPermission?: string;
  }> {
    const transitions: Array<{
      status: string;
      label: string;
      description: string;
      requiresReason: boolean;
      requiresPermission?: string;
    }> = [];

    switch (order.status.value) {
      case 'PENDING':
        transitions.push({
          status: 'CONFIRMED',
          label: 'Confirm Order',
          description: 'Confirm the order and begin processing',
          requiresReason: false,
          requiresPermission: 'order.confirm',
        }, {
          status: 'CANCELLED',
          label: 'Cancel Order',
          description: 'Cancel the order and release inventory',
          requiresReason: true,
          requiresPermission: 'order.cancel',
        });
        break;

      case 'CONFIRMED':
        transitions.push({
          status: 'IN_PROGRESS',
          label: 'Start Processing',
          description: 'Begin processing the order',
          requiresReason: false,
          requiresPermission: 'order.process',
        }, {
          status: 'CANCELLED',
          label: 'Cancel Order',
          description: 'Cancel the order and release inventory',
          requiresReason: true,
          requiresPermission: 'order.cancel',
        });
        break;

      case 'IN_PROGRESS':
        transitions.push({
          status: 'SHIPPED',
          label: 'Ship Order',
          description: 'Mark the order as shipped',
          requiresReason: false,
          requiresPermission: 'order.ship',
        }, {
          status: 'CANCELLED',
          label: 'Cancel Order',
          description: 'Cancel the order and handle returns',
          requiresReason: true,
          requiresPermission: 'order.cancel',
        }, {
          status: 'FAILED',
          label: 'Mark as Failed',
          description: 'Mark the order as failed due to issues',
          requiresReason: true,
          requiresPermission: 'order.fail',
        });
        break;

      case 'SHIPPED':
        transitions.push({
          status: 'COMPLETED',
          label: 'Complete Order',
          description: 'Mark the order as successfully delivered',
          requiresReason: false,
          requiresPermission: 'order.complete',
        }, {
          status: 'FAILED',
          label: 'Mark as Failed',
          description: 'Mark the order as failed due to delivery issues',
          requiresReason: true,
          requiresPermission: 'order.fail',
        });
        break;

      case 'FAILED':
        transitions.push({
          status: 'PENDING',
          label: 'Retry Order',
          description: 'Retry the failed order',
          requiresReason: false,
          requiresPermission: 'order.retry',
        });
        break;

      // Terminal states have no transitions
      case 'COMPLETED':
      case 'CANCELLED':
        break;
    }

    return transitions;
  }
}
