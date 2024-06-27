/**
 * @method GET
 * @endpoint /v1/orders/sheet
 * @description 주문 조회
 */
export type OrderSheetV1Request = {
  productVariants: {
    productVariantId: number;
    quantity: number;
  }[];
};

/**
 * @method POST
 * @endpoint /v1/orders
 * @description 주문 생성
 */
export type CreateOrderV1Request = {
  productVariants: {
    productVariantId: number;
    quantity: number;
  }[];
};
