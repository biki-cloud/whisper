/*
  Warnings:

  - Changed the type of `type` on the `Stamp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StampType" AS ENUM ('thanks', 'love', 'smile', 'cry', 'sad', 'shock');

-- AlterTable
ALTER TABLE "Stamp" DROP COLUMN "type",
ADD COLUMN     "type" "StampType" NOT NULL;

-- CreateTable
CREATE TABLE "DeletedPost" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletedPost_ipAddress_idx" ON "DeletedPost"("ipAddress");

-- CreateIndex
CREATE INDEX "DeletedPost_deletedAt_idx" ON "DeletedPost"("deletedAt");
