import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { LineItem } from './line-item.entity';

export enum ClaimStatus {
  REQUESTED = 'REQUESTED', // 요청됨
  CONFIRMED = 'CONFIRMED', // 확인됨
  REJECTED = 'REJECTED', // 거부됨
  CANCELED = 'CANCELED', // 취소됨
}

export enum ClaimType {
  RETURN = 'RETURN', // 반품
  REPLACE = 'REPLACE', // 교환
  CANCELED = 'CANCELED', // 취소
}

export enum ClaimResponsibility {
  CUSTOMER = 'CUSTOMER',
  STORE = 'STORE',
}

@Entity('order_claim_item')
export class OrderClaimItem {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'order_claim_item_id',
    unsigned: true,
  })
  orderClaimItemId: number;

  @Column('int', { name: 'claim_quantity', nullable: false })
  claimQuantity: number;

  @Column('enum', {
    name: 'status',
    nullable: false,
    enum: [ClaimStatus],
  })
  status: ClaimStatus;

  @Column('enum', {
    name: 'type',
    nullable: false,
    enum: [ClaimType],
  })
  type: ClaimType;

  @Column('enum', {
    name: 'claim_responsibility',
    nullable: false,
    enum: [ClaimResponsibility],
  })
  claimResponsibility: ClaimResponsibility;

  @Column('varchar', { name: 'note', nullable: false })
  note: string;

  @Column('decimal', { name: 'refund_amount', nullable: false })
  refundAmount: number;

  @Column('timestamp', { name: 'canceled_at', nullable: true })
  canceledAt: Date;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('int', { name: 'order_id', nullable: false })
  orderId: number;
  @ManyToOne(() => Order, (order) => order.orderClaimItem, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'order_id', referencedColumnName: 'orderId' }])
  order: Order;

  @Column('int', { name: 'item_id', nullable: false })
  itemId: number;
  @ManyToOne(() => LineItem, (lineItem) => lineItem.orderClaimItem, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'item_id', referencedColumnName: 'itemId' }])
  lineItem: LineItem;
}
