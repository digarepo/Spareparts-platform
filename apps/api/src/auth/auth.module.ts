import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from '../infrastructure/token.service';
import { PasswordService } from '../infrastructure/password.service';
import { AuthGuard } from './guards/auth.guard';
import { AuditService } from './audit.service';
import { AuthContextInterceptor } from './interceptors/auth-context.interceptor';

/**
 * Authentication module for IAM functionality.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Domain services and contracts
 * - **Invariants:** Identity-only authentication, no authorization embeding
 * - **RLS Integration:** Includes Prisma extension for database context
 */
@Module({
    imports: [PrismaModule, TenancyModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenService,
        PasswordService,
        AuditService,
        AuthGuard,
        AuthContextInterceptor,
    ],
    exports: [
        AuthService,
        TokenService,
        PasswordService,
        AuditService,
        AuthGuard,
        AuthContextInterceptor,
    ],
})
export class AuthModule {}
