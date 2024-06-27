import { Module } from '@nestjs/common';
import { OrderClaimService } from './order-claim.service';
import { OrderClaimController } from './order-claim.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../../entities/order.entity';
import { Payment } from '../../../entities/payment.entity';
import { OrderClaimItem } from '../../../entities/order-claim-item.entity';

@Module({
  controllers: [OrderClaimController],
  providers: [OrderClaimService],
  imports: [
    OrderClaimModule,
    TypeOrmModule.forFeature([
      //
      Order,
      Payment,
      OrderClaimItem,
    ]),
  ],
})
export class OrderClaimModule {}
