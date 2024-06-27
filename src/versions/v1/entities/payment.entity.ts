import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'payment_id',
    unsigned: true,
  })
  paymentId: number;

  @Column('decimal', { name: 'amount', nullable: false })
  amount: number;

  @Column('decimal', { name: 'current_amount', nullable: false })
  currentAmount: number;

  @Column('decimal', { name: 'refunded_amount', nullable: false })
  refundedAmount: number;

  @Column('timestamp', { name: 'captured_at', nullable: true })
  capturedAt: Date | null;

  @Column('timestamp', { name: 'canceled_at', nullable: true })
  canceledAt: Date | null;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
