/*
  Warnings:

  - You are about to drop the column `hashedPassword` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashedPassword";
