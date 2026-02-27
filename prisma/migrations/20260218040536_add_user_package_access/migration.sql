-- CreateTable
CREATE TABLE "user_package_accesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "user_package_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_package_accesses_userId_idx" ON "user_package_accesses"("userId");

-- CreateIndex
CREATE INDEX "user_package_accesses_packageId_idx" ON "user_package_accesses"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_package_accesses_userId_packageId_key" ON "user_package_accesses"("userId", "packageId");

-- AddForeignKey
ALTER TABLE "user_package_accesses" ADD CONSTRAINT "user_package_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_accesses" ADD CONSTRAINT "user_package_accesses_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "exam_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
