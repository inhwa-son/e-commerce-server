import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { LineItem } from './line-item.entity';

@Entity('product_variant')
export class ProductVariant {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'product_variant_id',
    unsigned: true,
  })
  productVariantId: number;

  @Column('varchar', { name: 'title', nullable: false })
  title: string;

  @Column('int', { name: 'inventory_quantity', nullable: false })
  inventoryQuantity: number;

  @Column('int', { name: 'sold_quantity', nullable: false })
  soldQuantity: number;

  @Column('int', { name: 'claim_quantity', nullable: false })
  claimQuantity: number;

  @Column('decimal', { name: 'product_variant_price', nullable: false })
  productVariantPrice: number;

  @Column('boolean', { name: 'is_default' })
  isDefault: boolean;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('int', { name: 'product_id', unsigned: true })
  productId: number;

  @ManyToOne(() => Product, (product) => product.productVariant, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'productId' }])
  product: Product;

  @OneToMany(() => LineItem, (lineItem) => lineItem.productVariant)
  lineItem: LineItem[];
}
