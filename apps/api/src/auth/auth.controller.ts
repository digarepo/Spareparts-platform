import { Controller, Post, Get, Body, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { AuthGuard } from './guards/auth.guard';
import {
    PasswordAuthRequestSchema,
    RefreshTokenRequestSchema,
    LogoutRequestSchema,
    AuthResponseSchema,
    type AuthResponse,
    type PasswordAuthRequest,
    type RefreshTokenRequest,
    type LogoutRequest
} from '@spareparts/contracts/iam';
import { AuthContext } from '../prisma/auth-context.extension';

/**
 * Extended Request interface with auth context.
 */
interface AuthRequest {
  auth?: AuthContext;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * Authentication controller for IAM endpoints.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Contracts validation and domain services
 * - **Invariants:** Identity-only authentication, comprehensive audit trail
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Registers a new identity and account.
     *
     * @param body - Registration request with credentials and scope
     * @param req - Express request for IP and user agent
     * @returns Authentication response with tokens and session
     *
     * @remarks
     * - Validates request using contract schema
     * - Creates identity and account in transaction
     * - Issues initial tokens for immediate access
     * - Records comprehensive audit trail
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register new identity and account' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Identity and account created successfully'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already exists'
    })
    async register(
        @Body()body: PasswordAuthRequest,
        @Request()req: AuthRequest,
    ): Promise<AuthResponse> {
        // Validate request using contract schema
        const validatedBody = PasswordAuthRequestSchema.parse(body);

        return await this.authService.register({
        email: validatedBody.email,
        password: validatedBody.password,
        scope: validatedBody.scopeCode,
        tenantId: validatedBody.tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        });
    }

    /**
     * Authenticates credentials and issues tokens.
     *
     * @param body - Login request with credentials
     * @param req - Express request for IP and user agent
     * @returns Authentication response with tokens and session
     *
     * @remarks
     * - Validates credentials using domain authentication
     * - Supports multi-scope login (platform/tenant/customer)
     * - Implements secure token issuance
     * - Records authentication attempt for security
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate and receive tokens' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Authentication successful'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials'
    })
    async login(
        @Body()body: PasswordAuthRequest,
        @Request()req: AuthRequest,
    ): Promise<AuthResponse> {
        // Validate request using contract schema
        const validatedBody = PasswordAuthRequestSchema.parse(body);

        return await this.authService.login({
        email: validatedBody.email,
        password: validatedBody.password,
        scope: validatedBody.scopeCode,
        tenantId: validatedBody.tenantId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        });
    }

    /**
     * Refreshes access and refresh tokens.
     *
     * @param body - Refresh token request
     * @param req - Express request for IP and user agent
     * @returns Authentication response with rotated tokens
     *
     * @remarks
     * - Implements secure token rotation strategy
     * - Revokes previous refresh token on use
     * - Prevents token replay attacks
     * - Maintains session continuity
     */
     @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tokens refreshed successfully'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired refresh token'
    })
    async refreshToken(
        @Body() body: RefreshTokenRequest,
        @Request() req: AuthRequest,
    ): Promise<AuthResponse> {
        // Validate request using contract schema
        const validatedBody = RefreshTokenRequestSchema.parse(body);

        return await this.authService.refreshToken({
        refreshToken: validatedBody.refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        });
    }

    /**
     * Logs out by revoking the session.
     *
     * @param body - Logout request with refresh token
     * @param req - Express request for IP and user agent
     *
     * @remarks
     * - Revokes all active sessions for identity
     * - Invalidates refresh tokens
     * - Records logout for audit trail
     * - Supports immediate session termination
     */
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Logout and revoke session' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Logout successful'
    })
    async logout(
        @Body() body: LogoutRequest,
        @Request() req: AuthRequest,
    ): Promise<{ success: boolean; message: string }> {
        // Validate request using contract schema
        const validatedBody = LogoutRequestSchema.parse(body);

        await this.authService.logout({
        refreshToken: validatedBody.refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        });

        return {
        success: true,
        message: 'Logout successful',
        };
    }

    /**
     * Validates current authentication token.
     *
     * @param req - Express request with authentication context
     * @returns Validation result with identity information
     *
     * @remarks
     * - Provides token validation endpoint
     * - Returns current authentication context
     * - Useful for client-side token validation
     * - Supports session health checks
     */
    @Get('validate')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Validate current authentication' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token is valid'
    })
    async validate(@Request() req: AuthRequest): Promise<{
        valid: boolean;
        user?: AuthContext;
    }> {
        return {
            valid: !!req.auth,
            user: req.auth || undefined,
        };
    }
}
