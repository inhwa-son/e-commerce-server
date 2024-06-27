import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerUser } from './customer.entity';
import { LineItem } from './line-item.entity';
import { OrderClaimItem } from './order-claim-item.entity';
import { Payment } from './payment.entity';

export enum OrderStatus {
  BEFORE_PAYMENT = 'BEFORE_PAYMENT', // 결제전
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT', // 결제대기
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED', // 결제완료
  PREPARING_PRODUCT = 'PREPARING_PRODUCT', // 상품준비중
  PREPARING_FOR_SHIPMENT = 'PREPARING_FOR_SHIPMENT', // 배송준비중
  SHIPPING = 'SHIPPING', // 배송중
  SHIPPED = 'SHIPPED', // 배송완료
  PURCHASE_CONFIRMED = 'PURCHASE_CONFIRMED', // 구매확정

  CANCEL_REQUEST = 'CANCEL_REQUEST', // 주문 취소 요청 TODO: 제거예정
  CANCELED = 'CANCELED', // 취소
  ARCHIVED = 'ARCHIVED', // 보관
  REQUIRES_ACTION = 'REQUIRES_ACTION', // 조치 필요
}

export enum OrderPaymentStatus {
  NOT_PAID = 'NOT_PAID', // 미지불
  AWAITING = 'AWAITING', // 대기중
  CAPTURED = 'CAPTURED', // 결제 완료
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', // 부분 환불됨
  REFUNDED = 'REFUNDED', // 환불됨
  CANCELED = 'CANCELED', // 취소됨
  REQUIRES_ACTION = 'REQUIRES_ACTION', // 조치 필요
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_id',
    unsigned: true,
  })
  orderId: number;

  @Column('int', { name: 'customer_user_id', nullable: false })
  customerUserId: number;

  @Column('enum', {
    name: 'status',
    nullable: false,
    enum: [OrderStatus],
  })
  status: OrderStatus;

  @Column('enum', {
    name: 'payment_status',
    nullable: false,
    enum: [OrderPaymentStatus],
  })
  paymentStatus: OrderPaymentStatus;

  @Column('timestamp', { name: 'canceled_at', nullable: true })
  canceledAt: string;

  @Column('int', { name: 'payment_amount', nullable: false })
  paymentAmount: number;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => CustomerUser, (customerUser) => customerUser.order, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'customer_user_id', referencedColumnName: 'customerUserId' }])
  customerUser: CustomerUser;

  @OneToMany(() => LineItem, (lineItem) => lineItem.order)
  lineItem: LineItem[];

  @OneToMany(() => OrderClaimItem, (orderClaimItem) => orderClaimItem.order)
  orderClaimItem: OrderClaimItem[];

  @Column('int', { name: 'payment_id', nullable: false })
  paymentId: number;
  @ManyToOne(() => Payment, (payment) => payment.order, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'payment_id', referencedColumnName: 'paymentId' }])
  payment: Payment;
}
