/*
  Warnings:

  - The values [FAILED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `converted_currency` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `currency` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `currency` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `base_amount` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'BRL');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED_ENRICHMENT');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
COMMIT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "converted_currency" "Currency",
ADD COLUMN     "converted_unit_price" DOUBLE PRECISION,
ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "exchange_rate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "base_amount" SET NOT NULL,
DROP COLUMN "converted_currency",
ADD COLUMN     "converted_currency" "Currency";
