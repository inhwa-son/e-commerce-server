/**
 * @method POST
 * @endpoint /v1/order/claim/:order_id/cancel-order
 * @description 주문 취소 생성
 */
export type OrderClaimCancelV1Request = {
  productId: number;
  reason: string;
};

/**
 * @method POST
 * @endpoint /v1/order/claim/:order_id/return-order
 * @description 주문 반품 생성
 */

export type OrderClaimReturnV1Request = {
  lineItems: LineItems[];
  reason: string;
};

type LineItems = {
  itemId: number;
  quantity: number;
};
