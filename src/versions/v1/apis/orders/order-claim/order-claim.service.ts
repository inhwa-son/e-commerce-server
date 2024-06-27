import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderClaimCancelDto } from './dto/create-order-claim-cancel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../entities/order.entity';
import { ItemStatus } from '../../../entities/line-item.entity';
import { Payment } from '../../../entities/payment.entity';
import { CustomException } from '../../../../../utils/execption';
import {
  ClaimResponsibility,
  ClaimStatus,
  ClaimType,
  OrderClaimItem,
} from '../../../entities/order-claim-item.entity';
import { EntityUtil } from '../../../../../utils/entity';
import { Transactional } from 'typeorm-transactional';
import { CreateOrderClaimReturnDto } from './dto/create-order-claim-return.dto';
import {
  OrderClaimCancelV1Response,
  OrderClaimReturnV1Response,
} from '../../../../../types/v1/responses/order-claim';

@Injectable()
export class OrderClaimService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderClaimItem)
    private readonly orderClaimItemRepository: Repository<OrderClaimItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  @Transactional()
  async createOrderClaimCancel(
    customerUserId: number,
    orderId: number,
    createOrderClaimCancelDto: CreateOrderClaimCancelDto,
  ): Promise<OrderClaimCancelV1Response> {
    const findOrder = await this.orderRepository
      .createQueryBuilder('order')
      .andWhere('order.deleted_at IS NULL')
      .andWhere('order.order_id = :orderId', { orderId: orderId })
      .andWhere('order.customer_user_id = :customerUserId', {
        customerUserId: customerUserId,
      })
      .leftJoinAndSelect('order.lineItem', 'lineItem')
      .andWhere('lineItem.deleted_at IS NULL')
      .andWhere('lineItem.status IN (:...status)', {
        status: [
          ItemStatus.DRAFT_ORDER, // 주문 초안
          ItemStatus.ORDER, // 주문됨
        ],
      })
      .leftJoinAndSelect('lineItem.orderClaimItem', 'orderClaimItem')
      .andWhere('orderClaimItem.deleted_at IS NULL')
      .leftJoinAndSelect('lineItem.productVariant', 'productVariant')
      .leftJoinAndSelect('productVariant.product', 'product')
      .andWhere('product.product_id = :productId', {
        productId: createOrderClaimCancelDto.productId,
      })
      .leftJoinAndSelect('order.payment', 'payment')
      .andWhere('payment.deleted_at IS NULL')
      .getOne();

    if (!findOrder || !findOrder.lineItem?.length || !findOrder.payment) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            { language: 'en', message: `Order not found.` },
            { language: 'ko', message: `주문을 찾을 수 없습니다.` },
          ],
        },
      });
    }

    const items = findOrder.lineItem.map((lineItem) => {
      const claimedQuantity = lineItem.orderClaimItem.reduce(
        (acc, claimItem) => acc + claimItem.claimQuantity,
        0,
      );
      return {
        ...lineItem,
        claimableQuantity: lineItem.quantity - claimedQuantity,
      };
    });

    for (const item of items) {
      if (item.claimableQuantity <= 0) {
        throw new CustomException({
          code: 'invalid_request',
          statusCode: 400,
          messageParams: {
            entity: `order`,
            message: [
              { language: 'en', message: `Already canceled or returned item.` },
              { language: 'ko', message: `이미 취소 혹은 반품이 진행된 상품입니다.` },
            ],
          },
        });
      }
    }

    const createOrderClaimItem = items.map((lineItem) => {
      return this.orderClaimItemRepository.create({
        orderId: orderId,
        itemId: lineItem.itemId,
        claimQuantity: lineItem.quantity,
        claimResponsibility: ClaimResponsibility.CUSTOMER, // 고객 책임
        refundAmount: lineItem.paymentAmount, // 전체금액 환불
        status: ClaimStatus.CONFIRMED, // 확인됨
        type: ClaimType.CANCELED, // 주문 취소
        note: createOrderClaimCancelDto.reason,
      });
    });
    await this.orderClaimItemRepository.save(createOrderClaimItem);

    const refundAmount = createOrderClaimItem.reduce(
      (acc, claimItem) => acc + Number(claimItem.refundAmount),
      0,
    );
    const refundedAmount = Number(findOrder.payment.refundedAmount) + refundAmount;
    const currentAmount = Number(findOrder.payment.currentAmount) - refundAmount;

    if (currentAmount < 0) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            {
              language: 'en',
              message: `Refund amount is greater than the current amount.`,
            },
            {
              language: 'ko',
              message: `환불 금액이 환불 가능 금액보다 큽니다.`,
            },
          ],
        },
      });
    }

    await this.paymentRepository.save(
      EntityUtil.update<Payment>(findOrder.payment, {
        refundedAmount: refundedAmount,
        currentAmount: currentAmount,
      }),
    );

    return {
      status: `success`,
      httpStatus: 201,
      message: `Order claim cancel success.`,
      data: {
        orderId: orderId,
      },
    };
  }

  @Transactional()
  async createOrderClaimReturn(
    customerUserId: number,
    orderId: number,
    createOrderClaimReturnDto: CreateOrderClaimReturnDto,
  ): Promise<OrderClaimReturnV1Response> {
    const findOrder = await this.orderRepository
      .createQueryBuilder('order')
      .andWhere('order.deleted_at IS NULL')
      .andWhere('order.order_id = :orderId', { orderId: orderId })
      .andWhere('order.customer_user_id = :customerUserId', {
        customerUserId: customerUserId,
      })
      .leftJoinAndSelect('order.lineItem', 'lineItem')
      .andWhere('lineItem.deleted_at IS NULL')
      .andWhere('lineItem.itemId IN (:...itemIds)', {
        itemIds: createOrderClaimReturnDto.lineItems.map((lineItem) => lineItem.itemId),
      })
      .andWhere('lineItem.status IN (:...status)', {
        status: [
          ItemStatus.DRAFT_ORDER, // 주문 초안
          ItemStatus.ORDER, // 주문됨
        ],
      })
      .leftJoinAndSelect('lineItem.orderClaimItem', 'orderClaimItem')
      .andWhere('orderClaimItem.deleted_at IS NULL')
      .leftJoinAndSelect('lineItem.productVariant', 'productVariant')
      .leftJoinAndSelect('productVariant.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .andWhere('payment.deleted_at IS NULL')
      .getOne();

    if (!findOrder || !findOrder.lineItem?.length || !findOrder.payment) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            { language: 'en', message: `Order not found.` },
            { language: 'ko', message: `주문을 찾을 수 없습니다.` },
          ],
        },
      });
    }

    const items = findOrder.lineItem.map((lineItem) => {
      const claimedQuantity = lineItem.orderClaimItem.reduce(
        (acc, claimItem) => acc + claimItem.claimQuantity,
        0,
      );
      const claimQuantity =
        createOrderClaimReturnDto.lineItems.find((item) => item.itemId === lineItem.itemId)?.quantity ?? 0;
      return {
        ...lineItem,
        claimableQuantity: lineItem.quantity - claimedQuantity,
        claimQuantity: claimQuantity,
      };
    });

    for (const item of items) {
      if (item.claimableQuantity <= 0) {
        throw new CustomException({
          code: 'invalid_request',
          statusCode: 400,
          messageParams: {
            entity: `order`,
            message: [
              { language: 'en', message: `Already returned item.` },
              { language: 'ko', message: `반품 가능한 개수를 초과하였습니다.` },
            ],
          },
        });
      }
    }

    const createOrderClaimItem = items.map((lineItem) => {
      return this.orderClaimItemRepository.create({
        orderId: orderId,
        itemId: lineItem.itemId,
        claimQuantity: lineItem.claimQuantity, // 반품 수량
        claimResponsibility: ClaimResponsibility.CUSTOMER, // 고객 책임
        refundAmount: Number(lineItem.originalAmount) * lineItem.claimQuantity, // 환불 금액
        status: ClaimStatus.CONFIRMED, // 확인됨
        type: ClaimType.RETURN, // 반품
        note: createOrderClaimReturnDto.reason,
      });
    });
    await this.orderClaimItemRepository.save(createOrderClaimItem);

    const refundAmount = createOrderClaimItem.reduce((acc, claimItem) => acc + claimItem.refundAmount, 0);
    const refundedAmount = Number(findOrder.payment.refundedAmount) + refundAmount;
    const currentAmount = Number(findOrder.payment.currentAmount) - refundAmount;

    if (currentAmount < 0) {
      throw new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            {
              language: 'en',
              message: `Refund amount is greater than the current amount.`,
            },
            {
              language: 'ko',
              message: `환불 금액이 환불 가능 금액보다 큽니다.`,
            },
          ],
        },
      });
    }

    await this.paymentRepository.save(
      EntityUtil.update<Payment>(findOrder.payment, {
        refundedAmount: refundedAmount,
        currentAmount: currentAmount,
      }),
    );

    return {
      status: `success`,
      httpStatus: 201,
      message: `Order claim return success.`,
      data: {
        orderId: orderId,
      },
    };
  }
}
