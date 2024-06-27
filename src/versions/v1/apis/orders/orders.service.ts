import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrderSheetDto } from './dto/find-order-sheet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Order, OrderPaymentStatus, OrderStatus } from '../../entities/order.entity';
import { ItemStatus, LineItem } from '../../entities/line-item.entity';
import { Payment } from '../../entities/payment.entity';
import { CustomException } from '../../../../utils/execption';
import { OrderProductVariants } from './dto/order-product-variants.dto';
import { CustomerUser } from '../../entities/customer.entity';
import { Transactional } from 'typeorm-transactional';
import { EntityUtil } from '../../../../utils/entity';
import { CreateOrderV1Response, OrderSheetV1Response } from 'src/types/v1/responses/order';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(CustomerUser)
    private readonly customerUserRepository: Repository<CustomerUser>,
  ) {}

  async findOrderSheet(
    //
    findOrderSheetDto: FindOrderSheetDto,
  ): Promise<OrderSheetV1Response> {
    if (!findOrderSheetDto?.productVariants?.length) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            { language: 'en', message: 'Order request is invalid.' },
            { language: 'ko', message: `주문 요청이 잘못되었습니다.` },
          ],
        },
      });
    }

    const { totalAmount, findProductVariants } = await this.findOrderAmount(
      findOrderSheetDto.productVariants,
    );

    const buyProductVariants = findProductVariants.map((productVariant) => {
      const requestProductVariant = findOrderSheetDto.productVariants.find(
        (v) => v.productVariantId === productVariant.productVariantId,
      );
      return {
        ...productVariant,
        quantity: requestProductVariant.quantity,
      };
    });

    for (const productVariant of buyProductVariants) {
      if (productVariant.inventoryQuantity < productVariant.quantity) {
        throw new CustomException({
          code: 'invalid_request',
          statusCode: 400,
          messageParams: {
            entity: `product_variant`,
            message: [
              { language: 'en', message: 'Inventory quantity is not enough.' },
              { language: 'ko', message: '재고 수량이 부족합니다.' },
            ],
          },
        });
      }
    }

    return {
      status: 'success',
      httpStatus: 200,
      message: 'Order sheet found successfully.',
      data: {
        totalAmount,
        productVariants: findOrderSheetDto.productVariants,
      },
    };
  }

  @Transactional()
  async create(
    //
    customerUserId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderV1Response> {
    const customerUser = await this.customerUserRepository.findOne({
      where: { customerUserId, deletedAt: null },
    });
    if (!customerUser) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            { language: 'en', message: 'Customer user not found.' },
            { language: 'ko', message: '고객 정보를 찾을 수 없습니다.' },
          ],
        },
      });
    }

    const { totalAmount, findProductVariants } = await this.findOrderAmount(createOrderDto.productVariants);

    const buyProductVariants = findProductVariants.map((productVariant) => {
      const requestProductVariant = createOrderDto.productVariants.find(
        (v) => v.productVariantId === productVariant.productVariantId,
      );
      return {
        ...productVariant,
        quantity: requestProductVariant.quantity,
      };
    });

    for (const productVariant of buyProductVariants) {
      if (productVariant.inventoryQuantity < productVariant.quantity) {
        throw new CustomException({
          code: 'invalid_request',
          statusCode: 400,
          messageParams: {
            entity: `product_variant`,
            message: [
              { language: 'en', message: 'Inventory quantity is not enough.' },
              { language: 'ko', message: '재고 수량이 부족합니다.' },
            ],
          },
        });
      }
    }

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        amount: totalAmount,
        currentAmount: totalAmount,
        refundedAmount: 0,
        capturedAt: new Date(),
      }),
    );

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        customerUserId: customerUserId,
        status: OrderStatus.PAYMENT_COMPLETED, // 결제완료
        paymentStatus: OrderPaymentStatus.CAPTURED, // 결제완료
        paymentAmount: totalAmount,
        paymentId: payment.paymentId,
      }),
    );

    const createLineItems = buyProductVariants.map((productVariant) => {
      return this.lineItemRepository.create({
        productVariantId: productVariant.productVariantId,
        orderId: order.orderId,
        status: ItemStatus.ORDER, // 주문됨
        title: productVariant.title,
        quantity: productVariant.quantity,
        fulfilledQuantity: 0,
        returnedQuantity: 0,
        shippedQuantity: 0,
        originalAmount: Number(productVariant.productVariantPrice),
        paymentAmount: Number(productVariant.productVariantPrice) * productVariant.quantity,
      });
    });
    await this.lineItemRepository.save(createLineItems);

    const updateProductVariants = buyProductVariants.map((productVariant) => {
      return EntityUtil.update<ProductVariant>(productVariant, {
        inventoryQuantity: productVariant.inventoryQuantity - productVariant.quantity,
        soldQuantity: productVariant.soldQuantity + productVariant.quantity,
      });
    });
    await this.productVariantRepository.save(updateProductVariants);

    return {
      status: 'success',
      httpStatus: 201,
      message: 'Order created successfully.',
      data: {
        orderId: order.orderId,
      },
    };
  }

  async findOrderAmount(productVariants: OrderProductVariants[]) {
    const productVariantIds = productVariants.map((product_variant) => product_variant.productVariantId);
    const findProductVariants = await this.productVariantRepository
      .createQueryBuilder('product_variant')
      .andWhere('product_variant.product_variant_id IN (:...productVariantIds)', {
        productVariantIds,
      })
      .andWhere('product_variant.deleted_at IS NULL')
      .leftJoinAndSelect('product_variant.product', 'product')
      .andWhere('product.deleted_at IS NULL')
      .getMany();

    const totalAmount = findProductVariants.reduce((acc, productVariant) => {
      const requestProductVariant = productVariants.find(
        (v) => v.productVariantId === productVariant.productVariantId,
      );
      return acc + Number(productVariant.productVariantPrice) * requestProductVariant.quantity;
    }, 0);

    return {
      totalAmount: totalAmount,
      findProductVariants: findProductVariants,
    };
  }
}
