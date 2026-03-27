import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateULID } from '@spareparts/contracts';

/**
 * Audit service for authentication events.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Prisma persistence layer
 * - **Invariants:** Append-only audit trail, non-repudiation
 */
@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Records a successful authentication event.
     *
     * @param params - Event parameters including identity and context
     *
     * @remarks
     * - Creates append-only audit record
     * - Includes IP and user agent for forensics
     * - Never blocks authentication on audit failure
     */
    async recordAuthSuccess(params: {
        identityId: string;
        accountId?: string;
        eventType: 'login_success' | 'register_success' | 'refresh_success';
        scope: string;
        tenantId?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        try {
        await this.prisma.db.authEvent.create({
            data: {
            id: generateULID(),
            identityId: params.identityId,
            accountId: params.accountId,
            eventType: params.eventType,
            scope: params.scope,
            tenantId: params.tenantId,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            timestamp: new Date(),
            success: true,
            },
        });
        } catch (error) {
        // Audit failures should not block authentication
        console.error('Failed to record auth success audit:', error);
        }
    }

    /**
     * Records a failed authentication event.
     *
     * @param params - Event parameters including failure reason
     *
     * @remarks
     * - Captures failure reason for security analysis
     * - Does not reveal sensitive information
     * - Supports rate limiting and lockout analysis
     */
    async recordAuthFailure(params: {
        identityId?: string;
        eventType: 'login_failure' | 'register_failure' | 'refresh_failure';
        scope?: string;
        tenantId?: string;
        failureReason: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        try {
        await this.prisma.db.authEvent.create({
            data: {
            id: generateULID(),
            identityId: params.identityId,
            eventType: params.eventType,
            scope: params.scope,
            tenantId: params.tenantId,
            failureReason: params.failureReason,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            timestamp: new Date(),
            success: false,
            },
        });
        } catch (error) {
        console.error('Failed to record auth failure audit:', error);
        }
    }

    /**
     * Records a logout event.
     *
     * @param params - Event parameters for logout
     *
     * @remarks
     * - Tracks session termination
     * - Supports session lifecycle analysis
     * - Aids in security monitoring
     */
    async recordLogout(params: {
        identityId: string;
        accountId?: string;
        scope: string;
        tenantId?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        try {
        await this.prisma.db.authEvent.create({
            data: {
            id: generateULID(),
            identityId: params.identityId,
            accountId: params.accountId,
            eventType: 'logout',
            scope: params.scope,
            tenantId: params.tenantId,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            timestamp: new Date(),
            success: true,
            },
        });
        } catch (error) {
        console.error('Failed to record logout audit:', error);
        }
    }

    /**
     * Records a session revocation event.
     *
     * @param params - Event parameters for revocation
     *
     * @remarks
     * - Tracks forced session termination
     * - Supports security incident response
     * - Provides audit trail for admin actions
     */
    async recordSessionRevocation(params: {
        sessionId: string;
        identityId: string;
        accountId?: string;
        scope: string;
        tenantId?: string;
        reason: string;
    }): Promise<void> {
        try {
        await this.prisma.db.authEvent.create({
            data: {
            id: generateULID(),
            identityId: params.identityId,
            accountId: params.accountId,
            eventType: 'session_revoked',
            scope: params.scope,
            tenantId: params.tenantId,
            sessionId: params.sessionId,
            failureReason: params.reason,
            timestamp: new Date(),
            success: true,
            },
        });
        } catch (error) {
        console.error('Failed to record session revocation audit:', error);
        }
    }
}
