/*
  Warnings:

  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `basePrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `subtotal` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `basePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `priceMultiplier` on the `ProductSize` table. All the data in the column will be lost.
  - You are about to drop the `ProductDrink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductExtra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductSauce` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantSetting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `city` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NOUVELLE', 'CONFIRMEE', 'PREPAREE', 'LIVREE', 'ANNULEE');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ProductDrink" DROP CONSTRAINT "ProductDrink_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductExtra" DROP CONSTRAINT "ProductExtra_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSauce" DROP CONSTRAINT "ProductSauce_productId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "name",
ADD COLUMN     "fullName" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "deliveryAddress" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'NOUVELLE',
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "selectedSizeName" TEXT,
ADD COLUMN     "selectedSizePrice" DECIMAL(10,2),
ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProductSize" DROP COLUMN "priceMultiplier",
ADD COLUMN     "priceModifier" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ProductDrink";

-- DropTable
DROP TABLE "ProductExtra";

-- DropTable
DROP TABLE "ProductSauce";

-- DropTable
DROP TABLE "RestaurantSetting";

-- CreateTable
CREATE TABLE "Sauce" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sauce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOptionLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sauceId" TEXT,
    "extraId" TEXT,
    "drinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOptionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantSettings" (
    "id" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "address" TEXT,
    "openingHours" TEXT,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "welcomeMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sauce_name_key" ON "Sauce"("name");

-- CreateIndex
CREATE INDEX "Sauce_active_idx" ON "Sauce"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_name_key" ON "Extra"("name");

-- CreateIndex
CREATE INDEX "Extra_active_idx" ON "Extra"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Drink_name_key" ON "Drink"("name");

-- CreateIndex
CREATE INDEX "Drink_active_idx" ON "Drink"("active");

-- CreateIndex
CREATE INDEX "ProductOptionLink_productId_idx" ON "ProductOptionLink"("productId");

-- CreateIndex
CREATE INDEX "ProductOptionLink_sauceId_idx" ON "ProductOptionLink"("sauceId");

-- CreateIndex
CREATE INDEX "ProductOptionLink_extraId_idx" ON "ProductOptionLink"("extraId");

-- CreateIndex
CREATE INDEX "ProductOptionLink_drinkId_idx" ON "ProductOptionLink"("drinkId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionLink_productId_sauceId_extraId_drinkId_key" ON "ProductOptionLink"("productId", "sauceId", "extraId", "drinkId");

-- CreateIndex
CREATE INDEX "Category_displayOrder_idx" ON "Category"("displayOrder");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Product_available_idx" ON "Product"("available");

-- AddForeignKey
ALTER TABLE "ProductOptionLink" ADD CONSTRAINT "ProductOptionLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionLink" ADD CONSTRAINT "ProductOptionLink_sauceId_fkey" FOREIGN KEY ("sauceId") REFERENCES "Sauce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionLink" ADD CONSTRAINT "ProductOptionLink_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionLink" ADD CONSTRAINT "ProductOptionLink_drinkId_fkey" FOREIGN KEY ("drinkId") REFERENCES "Drink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
