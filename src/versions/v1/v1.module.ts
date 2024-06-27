import { Module } from '@nestjs/common';

import { OrdersModule } from './apis/orders/orders.module';

@Module({
  imports: [
    //
    OrdersModule,
  ],
})
export class V1Module {}
