-- AlterEnum: Add DELETED to QuestionStatus
ALTER TYPE "QuestionStatus" ADD VALUE 'DELETED';

-- AlterTable questions: Add deletedAt field
ALTER TABLE "questions" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable ebooks: Add price and isFree fields
ALTER TABLE "ebooks" ADD COLUMN "price" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ebooks" ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable transactions: Add ebookId field
ALTER TABLE "transactions" ADD COLUMN "ebookId" TEXT;

-- CreateTable ebook_accesses
CREATE TABLE "ebook_accesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "transactionId" TEXT,
    "grantedBy" TEXT,
    "accessType" TEXT NOT NULL DEFAULT 'PURCHASE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ebook_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ebook_accesses_userId_idx" ON "ebook_accesses"("userId");

-- CreateIndex
CREATE INDEX "ebook_accesses_ebookId_idx" ON "ebook_accesses"("ebookId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "ebook_accesses_userId_ebookId_key" ON "ebook_accesses"("userId", "ebookId");

-- CreateIndex on transactions.ebookId
CREATE INDEX "transactions_ebookId_idx" ON "transactions"("ebookId");

-- AddForeignKey: ebook_accesses.userId -> users.id
ALTER TABLE "ebook_accesses" ADD CONSTRAINT "ebook_accesses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ebook_accesses.ebookId -> ebooks.id
ALTER TABLE "ebook_accesses" ADD CONSTRAINT "ebook_accesses_ebookId_fkey"
    FOREIGN KEY ("ebookId") REFERENCES "ebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ebook_accesses.transactionId -> transactions.id
ALTER TABLE "ebook_accesses" ADD CONSTRAINT "ebook_accesses_transactionId_fkey"
    FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: transactions.ebookId -> ebooks.id
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ebookId_fkey"
    FOREIGN KEY ("ebookId") REFERENCES "ebooks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
