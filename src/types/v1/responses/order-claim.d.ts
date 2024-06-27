/**
 * @method POST
 * @endpoint /v1/order/claim/:order_id/cancel-order
 * @description 주문 취소 생성
 */
export type OrderClaimCancelV1Response = {
  status: string;
  httpStatus: number;
  message: string;
  data: {
    orderId: number;
  };
};

/**
 * @method POST
 * @endpoint /v1/order/claim/:order_id/return-order
 * @description 주문 반품 생성
 */
type OrderClaimReturnV1Response = {
  status: string;
  httpStatus: number;
  message: string;
  data: {
    orderId: number;
  };
};
