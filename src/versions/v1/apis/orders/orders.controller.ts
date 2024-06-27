import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindOrderSheetDto } from './dto/find-order-sheet.dto';
import { CreateOrderV1Response, OrderSheetV1Response } from 'src/types/v1/responses/order';

@ApiTags('주문')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Order Sheet' })
  @Get('sheet')
  async findOrderSheet(
    //
    @Query() findOrderSheetDto: FindOrderSheetDto,
  ): Promise<OrderSheetV1Response> {
    return this.ordersService.findOrderSheet(findOrderSheetDto);
  }

  // create/order +  payment/verify
  @ApiOperation({ summary: 'Create Order' })
  @Post()
  async create(
    //
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderV1Response> {
    return await this.ordersService.create(
      //
      2,
      createOrderDto,
    );
  }
}
