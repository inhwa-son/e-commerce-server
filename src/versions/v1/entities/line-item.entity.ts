import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Order } from './order.entity';
import { OrderClaimItem } from './order-claim-item.entity';

export enum ItemStatus {
  DRAFT = 'DRAFT', // 임시
  DRAFT_ORDER = 'DRAFT_ORDER', // 주문 초안
  ORDER = 'ORDER', // 주문됨
  PREPARING_PRODUCT = 'PREPARING_PRODUCT', // 상품준비중
  PREPARING_FOR_SHIPMENT = 'PREPARING_FOR_SHIPMENT', // 배송준비중
  SHIPPING = 'SHIPPING', // 배송중
  SHIPPED = 'SHIPPED', // 배송완료
  PURCHASE_CONFIRMED = 'PURCHASE_CONFIRMED', // 구매확정

  ARCHIVED = 'ARCHIVED', // 보관됨
  REQUIRES_ACTION = 'REQUIRES_ACTION', // 조치 필요
}
@Entity('line_item')
export class LineItem {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'item_id',
    unsigned: true,
  })
  itemId: number;

  @Column('enum', {
    name: 'status',
    nullable: false,
    enum: [ItemStatus],
  })
  status: ItemStatus;

  @Column('varchar', { name: 'title', nullable: false })
  title: string;

  @Column('int', { name: 'quantity', nullable: false })
  quantity: number;

  @Column('int', { name: 'fulfilled_quantity', nullable: false })
  fulfilledQuantity: number;

  @Column('int', { name: 'returned_quantity', nullable: false })
  returnedQuantity: number;

  @Column('int', { name: 'shipped_quantity', nullable: false })
  shippedQuantity: number;

  @Column('int', { name: 'original_amount', nullable: false })
  originalAmount: number;

  @Column('int', { name: 'payment_amount', nullable: false })
  paymentAmount: number;

  @Column('timestamp', { name: 'purchase_confirmed_at', nullable: true })
  purchaseConfirmedAt: Date | null;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('int', { name: 'order_id', nullable: false })
  orderId: number;

  @Column('int', {
    name: 'product_variant_id',
    nullable: false,
    unsigned: true,
  })
  productVariantId: number;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.lineItem, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'product_variant_id', referencedColumnName: 'productVariantId' }])
  productVariant: ProductVariant;

  @ManyToOne(() => Order, (order) => order.lineItem, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'order_id', referencedColumnName: 'orderId' }])
  order: Order;

  @OneToMany(() => OrderClaimItem, (orderClaimItem) => orderClaimItem.lineItem)
  orderClaimItem: OrderClaimItem[];
}
