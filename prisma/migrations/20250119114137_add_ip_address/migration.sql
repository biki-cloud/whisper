-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "ipAddress" TEXT NOT NULL DEFAULT '127.0.0.1';

-- CreateIndex
CREATE INDEX "Post_ipAddress_idx" ON "Post"("ipAddress");
