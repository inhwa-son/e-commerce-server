-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('BEFORE_PAYMENT', 'WAITING_FOR_PAYMENT', 'PAYMENT_COMPLETED', 'PREPARING_PRODUCT', 'PREPARING_FOR_SHIPMENT', 'SHIPPING', 'SHIPPED', 'PURCHASE_CONFIRMED', 'CANCEL_REQUEST', 'CANCELED', 'ARCHIVED', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('NOT_PAID', 'AWAITING', 'CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELED', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "itemStatus" AS ENUM ('DRAFT', 'DRAFT_ORDER', 'ORDER', 'PREPARING_PRODUCT', 'PREPARING_FOR_SHIPMENT', 'SHIPPING', 'SHIPPED', 'PURCHASE_CONFIRMED', 'ARCHIVED', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "ClaimResponsibility" AS ENUM ('CUSTOMER', 'STORE');

-- CreateEnum
CREATE TYPE "ClaimPaymentStatusEnum" AS ENUM ('NA', 'NOT_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('RETURN', 'REPLACE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "customer_user" (
    "customer_user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_user_pkey" PRIMARY KEY ("customer_user_id")
);

-- CreateTable
CREATE TABLE "product" (
    "product_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" VARCHAR(512),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "product_variant_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 0,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "claim_quantity" INTEGER NOT NULL DEFAULT 0,
    "product_variant_price" DECIMAL NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("product_variant_id")
);

-- CreateTable
CREATE TABLE "order" (
    "order_id" SERIAL NOT NULL,
    "customer_user_id" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'BEFORE_PAYMENT',
    "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'NOT_PAID',
    "canceled_at" TIMESTAMP(3),
    "payment_amount" DECIMAL NOT NULL,
    "payment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "line_item" (
    "item_id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "status" "itemStatus" NOT NULL DEFAULT 'DRAFT',
    "title" VARCHAR NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fulfilled_quantity" INTEGER,
    "returned_quantity" INTEGER,
    "shipped_quantity" INTEGER,
    "original_amount" DECIMAL,
    "payment_amount" DECIMAL,
    "order_id" INTEGER NOT NULL,
    "purchase_confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "line_item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" SERIAL NOT NULL,
    "amount" DECIMAL NOT NULL,
    "current_amount" DECIMAL NOT NULL,
    "refunded_amount" DECIMAL DEFAULT 0,
    "captured_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "order_claim_item" (
    "order_claim_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "type" "ClaimType" NOT NULL,
    "claim_responsibility" "ClaimResponsibility" NOT NULL,
    "claim_quantity" INTEGER NOT NULL,
    "note" VARCHAR(512),
    "refund_amount" DECIMAL,
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "order_claim_item_pkey" PRIMARY KEY ("order_claim_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_email_key" ON "customer_user"("email");

-- CreateIndex
CREATE INDEX "customer_user_email_idx" ON "customer_user"("email");

-- CreateIndex
CREATE INDEX "product_variant_product_id_idx" ON "product_variant"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_payment_id_key" ON "order"("payment_id");

-- CreateIndex
CREATE INDEX "order_customer_user_id_idx" ON "order"("customer_user_id");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "line_item_order_id_idx" ON "line_item"("order_id");

-- CreateIndex
CREATE INDEX "line_item_product_variant_id_idx" ON "line_item"("product_variant_id");

-- CreateIndex
CREATE INDEX "order_claim_item_order_id_idx" ON "order_claim_item"("order_id");

-- CreateIndex
CREATE INDEX "order_claim_item_item_id_idx" ON "order_claim_item"("item_id");

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "customer_user"("customer_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("product_variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_claim_item" ADD CONSTRAINT "order_claim_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_claim_item" ADD CONSTRAINT "order_claim_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "line_item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
