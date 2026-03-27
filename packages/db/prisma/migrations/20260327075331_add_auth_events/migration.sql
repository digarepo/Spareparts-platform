-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lifecycleStatusCode" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "scopeCode" TEXT NOT NULL,
    "tenantId" TEXT,
    "accountStatusCode" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordCredential" (
    "identityId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "algorithmParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("identityId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "scopeCode" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReasonCode" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "code" TEXT NOT NULL,
    "scopeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Permission" (
    "code" TEXT NOT NULL,
    "scopeCode" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "AccountRole" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "AccountRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "permissionCode" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_events" (
    "id" TEXT NOT NULL,
    "identityId" TEXT,
    "accountId" TEXT,
    "eventType" TEXT NOT NULL,
    "scope" TEXT,
    "tenantId" TEXT,
    "sessionId" TEXT,
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "auth_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_email_key" ON "Identity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRole_accountId_roleCode_key" ON "AccountRole"("accountId", "roleCode");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleCode_permissionCode_key" ON "RolePermission"("roleCode", "permissionCode");

-- CreateIndex
CREATE INDEX "auth_events_identityId_idx" ON "auth_events"("identityId");

-- CreateIndex
CREATE INDEX "auth_events_timestamp_idx" ON "auth_events"("timestamp");

-- CreateIndex
CREATE INDEX "auth_events_eventType_idx" ON "auth_events"("eventType");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordCredential" ADD CONSTRAINT "PasswordCredential_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRole" ADD CONSTRAINT "AccountRole_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRole" ADD CONSTRAINT "AccountRole_roleCode_fkey" FOREIGN KEY ("roleCode") REFERENCES "Role"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleCode_fkey" FOREIGN KEY ("roleCode") REFERENCES "Role"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionCode_fkey" FOREIGN KEY ("permissionCode") REFERENCES "Permission"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
