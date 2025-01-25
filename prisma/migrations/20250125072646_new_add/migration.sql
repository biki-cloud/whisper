-- AlterTable
ALTER TABLE "Stamp" ADD COLUMN     "native" TEXT NOT NULL DEFAULT '';

-- RenameIndex
ALTER INDEX "DeletedPost_ipAddress_idx" RENAME TO "DeletedPost_anonymousId_idx";

-- RenameIndex
ALTER INDEX "Post_ipAddress_idx" RENAME TO "Post_anonymousId_idx";

-- RenameIndex
ALTER INDEX "Stamp_ipAddress_idx" RENAME TO "Stamp_anonymousId_idx";
