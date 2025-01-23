/*
  Warnings:

  - Changed the type of `type` on the `Stamp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Stamp" DROP COLUMN "type",
ADD COLUMN     "type" "StampType" NOT NULL;
