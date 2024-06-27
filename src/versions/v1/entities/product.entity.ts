import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'product_id',
    unsigned: true,
  })
  productId: number;

  @Column('varchar', { name: 'title', nullable: false })
  title: string;

  @Column('varchar', { name: 'subtitle', nullable: false })
  subtitle: string;

  @Column('varchar', { name: 'description', nullable: false })
  description: string;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
  productVariant: ProductVariant[];
}
