-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "csrfToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idleExpiresAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionTokenHash_key" ON "AdminSession"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminId_expiresAt_idx" ON "AdminSession"("adminId", "expiresAt");

-- CreateIndex
CREATE INDEX "AdminSession_idleExpiresAt_idx" ON "AdminSession"("idleExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_scope_identifierHash_windowStart_key" ON "RateLimitBucket"("scope", "identifierHash", "windowStart");

-- CreateIndex
CREATE INDEX "RateLimitBucket_scope_windowStart_idx" ON "RateLimitBucket"("scope", "windowStart");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
