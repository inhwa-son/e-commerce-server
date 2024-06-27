import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderClaimModule } from './order-claim/order-claim.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Order } from '../../entities/order.entity';
import { LineItem } from '../../entities/line-item.entity';
import { Payment } from '../../entities/payment.entity';
import { CustomerUser } from '../../entities/customer.entity';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    OrderClaimModule,
    TypeOrmModule.forFeature([Order, ProductVariant, LineItem, Payment, CustomerUser]),
  ],
})
export class OrdersModule {}
