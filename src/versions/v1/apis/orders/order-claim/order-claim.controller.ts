import { Body, Controller, Param, Post } from '@nestjs/common';
import { OrderClaimService } from './order-claim.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderClaimCancelDto } from './dto/create-order-claim-cancel.dto';
import { CreateOrderClaimReturnDto } from './dto/create-order-claim-return.dto';
import {
  OrderClaimCancelV1Response,
  OrderClaimReturnV1Response,
} from '../../../../../types/v1/responses/order-claim';

@ApiTags('주문 클레임')
@Controller({
  path: 'order/claim',
  version: '1',
})
export class OrderClaimController {
  constructor(private readonly orderClaimService: OrderClaimService) {}

  @ApiOperation({ summary: 'Create OrderClaim Cancel' })
  @Post(':order_id/cancel-order')
  createOrderClaimCancel(
    @Param('order_id') orderId: number,
    @Body() createOrderClaimCancelDto: CreateOrderClaimCancelDto,
  ): Promise<OrderClaimCancelV1Response> {
    return this.orderClaimService.createOrderClaimCancel(2, orderId, createOrderClaimCancelDto);
  }

  @ApiOperation({ summary: 'Create OrderClaim Return' })
  @Post(':order_id/return-order')
  createOrderClaimReturn(
    @Param('order_id') orderId: number,
    @Body() createOrderClaimReturnDto: CreateOrderClaimReturnDto,
  ): Promise<OrderClaimReturnV1Response> {
    return this.orderClaimService.createOrderClaimReturn(2, orderId, createOrderClaimReturnDto);
  }
}
