import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Order } from './order.entity';

@Entity('customer_user')
export class CustomerUser {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'customer_user_id',
    unsigned: true,
  })
  customerUserId: number;

  @Column('varchar', { name: 'email', nullable: false })
  email: string;

  @Column('varchar', { name: 'first_name', nullable: false })
  firstName: string;

  @Column('varchar', { name: 'last_name', nullable: false })
  lastName: string;

  @Column('varchar', { name: 'password_hash', nullable: false })
  passwordHash: string;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Order, (order) => order.customerUser)
  order: Order[];
}
