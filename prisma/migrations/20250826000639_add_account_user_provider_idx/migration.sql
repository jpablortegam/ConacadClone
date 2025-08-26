/*
  Warnings:

  - You are about to drop the column `time_range` on the `advisories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."advisories" DROP COLUMN "time_range";

-- CreateIndex
CREATE INDEX "accounts_userId_provider_idx" ON "public"."accounts"("userId", "provider");
