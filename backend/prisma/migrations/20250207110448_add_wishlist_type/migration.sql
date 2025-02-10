/*
  Warnings:

  - Added the required column `type` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "type" TEXT NOT NULL;
