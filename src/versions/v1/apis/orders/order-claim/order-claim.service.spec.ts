import { OrderClaimService } from './order-claim.service';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Order } from '../../../entities/order.entity';
import { Payment } from '../../../entities/payment.entity';
import {
  ClaimResponsibility,
  ClaimStatus,
  ClaimType,
  OrderClaimItem,
} from '../../../entities/order-claim-item.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateOrderClaimReturnDto } from './dto/create-order-claim-return.dto';
import { CreateOrderClaimCancelDto } from './dto/create-order-claim-cancel.dto';
import { CustomException } from '../../../../../utils/execption';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('uuid'),
}));

describe('OrderClaimService', () => {
  let service: OrderClaimService;
  let mockOrderRepository: MockRepository<Order>;
  let mockOrderClaimItemRepository: MockRepository<OrderClaimItem>;
  let mockPaymentRepository: MockRepository<Payment>;

  const customerUserId = 2;
  const orderId = 1;

  const mockRepository = () => ({
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
      getOne: jest.fn().mockReturnValue({}),
      findOne: jest.fn().mockReturnValue({}),
    })),
    createOrderClaimCancel: jest.fn(),
    createOrderClaimReturn: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderClaimService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderClaimItem),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    mockOrderRepository = module.get<MockRepository<Order>>(getRepositoryToken(Order));
    mockOrderClaimItemRepository = module.get<MockRepository<OrderClaimItem>>(
      getRepositoryToken(OrderClaimItem),
    );
    mockPaymentRepository = module.get<MockRepository<Payment>>(getRepositoryToken(Payment));

    mockOrderRepository.createQueryBuilder = jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
      getOne: jest.fn().mockReturnValue(
        Promise.resolve({
          orderId: orderId,
          customerUserId: customerUserId,
          paymentAmount: '300000',
          canceledAt: null,
          status: 'PAYMENT_COMPLETED',
          paymentStatus: 'CAPTURED',
          lineItem: [
            {
              itemId: 1,
              status: 'ORDER',
              title: '갤럭시 / blue',
              quantity: 1,
              fulfilledQuantity: 0,
              returnedQuantity: 0,
              shippedQuantity: 0,
              originalAmount: '300000',
              paymentAmount: '300000',
              purchaseConfirmedAt: null,
              deletedAt: null,
              orderId: orderId,
              productVariantId: 1,
              productVariant: {
                productVariantId: 1,
                title: '갤럭시 / blue',
                product: {
                  productId: 1,
                  title: '갤럭시',
                },
              },
              orderClaimItem: [],
            },
          ],
          payment: {
            paymentId: 1,
            amount: '300000',
            currentAmount: '300000',
            refundedAmount: '0',
            capturedAt: new Date('2024-06-27T05:37:12.168Z'),
            deletedAt: null,
          },
        }),
      ),
    }));

    service = module.get<OrderClaimService>(OrderClaimService);
  });

  it('createOrderClaimCancel success', async () => {
    const createOrderClaimCancelDto = new CreateOrderClaimCancelDto();
    createOrderClaimCancelDto.productId = 1;
    createOrderClaimCancelDto.reason = '그냥 취소';

    mockOrderClaimItemRepository.create = jest.fn().mockReturnValue({
      orderId: orderId,
      itemId: 1,
      claimQuantity: 1,
      claimReason: ClaimResponsibility.CUSTOMER,
      refundAmount: 1000,
      status: 'CANCEL',
      type: 'CANCELED',
      note: '그냥 취소',
    });

    mockOrderClaimItemRepository.save = jest.fn().mockReturnValue(
      Promise.resolve({
        orderId: orderId,
        itemId: 1,
        claimQuantity: 1,
        claimReason: ClaimResponsibility.CUSTOMER,
        refundAmount: 1000,
        status: 'CANCEL',
        type: 'CANCELED',
        note: '그냥 취소',
      }),
    );

    mockPaymentRepository.save = jest.fn().mockReturnValue(
      Promise.resolve({
        paymentId: 1,
        amount: '840000',
        currentAmount: '839000',
        refundedAmount: '1000',
        capturedAt: new Date('2024-06-27T05:37:12.168Z'),
        deletedAt: null,
      }),
    );

    const result = await service.createOrderClaimCancel(customerUserId, orderId, createOrderClaimCancelDto);

    expect(result).toEqual({
      status: `success`,
      httpStatus: 201,
      message: `Order claim cancel success.`,
      data: {
        orderId: orderId,
      },
    });
  });

  it('createOrderClaimReturn success', async () => {
    const createOrderClaimReturnDto = new CreateOrderClaimReturnDto();
    createOrderClaimReturnDto.lineItems = [
      {
        itemId: 1,
        quantity: 1,
      },
    ];
    createOrderClaimReturnDto.reason = '그냥 반품';

    mockOrderClaimItemRepository.create = jest.fn().mockReturnValue(
      Promise.resolve({
        orderId: orderId,
        itemId: 1,
        claimQuantity: 1,
        claimResponsibility: ClaimResponsibility.CUSTOMER,
        refundAmount: 1000,
        status: ClaimStatus.CONFIRMED,
        type: ClaimType.RETURN,
        note: '그냥 반품',
      }),
    );
    mockOrderClaimItemRepository.save = jest.fn().mockReturnValue(
      Promise.resolve({
        orderId: orderId,
        itemId: 1,
        claimQuantity: 1,
        claimResponsibility: ClaimResponsibility.CUSTOMER,
        refundAmount: 1000,
        status: ClaimStatus.CONFIRMED,
        type: ClaimType.RETURN,
        note: '그냥 반품',
      }),
    );
    mockPaymentRepository.save = jest.fn().mockReturnValue(
      Promise.resolve({
        paymentId: 1,
        amount: '840000',
        currentAmount: '839000',
        refundedAmount: '1000',
        capturedAt: new Date('2024-06-27T05:37:12.168Z'),
        deletedAt: null,
      }),
    );

    const result = await service.createOrderClaimReturn(customerUserId, orderId, createOrderClaimReturnDto);

    expect(result).toEqual({
      status: `success`,
      httpStatus: 201,
      message: `Order claim return success.`,
      data: {
        orderId: orderId,
      },
    });
  });

  it('createOrderClaimReturn fail - Already canceled item', async () => {
    mockOrderRepository.createQueryBuilder = jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
      getOne: jest.fn().mockReturnValue(
        Promise.resolve({
          orderId: orderId,
          customerUserId: customerUserId,
          paymentAmount: '300000',
          canceledAt: null,
          status: 'PAYMENT_COMPLETED',
          paymentStatus: 'CAPTURED',
          lineItem: [
            {
              itemId: 1,
              status: 'ORDER',
              title: '갤럭시 / blue',
              quantity: 1,
              fulfilledQuantity: 0,
              returnedQuantity: 0,
              shippedQuantity: 0,
              originalAmount: '300000',
              paymentAmount: '300000',
              purchaseConfirmedAt: null,
              deletedAt: null,
              orderId: orderId,
              productVariantId: 1,
              productVariant: {
                productVariantId: 1,
                title: '갤럭시 / blue',
                product: {
                  productId: 1,
                  title: '갤럭시',
                },
              },
              orderClaimItem: [
                {
                  orderClaimItemId: 1,
                  claimQuantity: 1,
                  status: 'CONFIRMED',
                  type: 'RETURN',
                  claimResponsibility: 'CUSTOMER',
                  note: 'just',
                  refundAmount: '300000',
                  canceledAt: null,
                  deletedAt: null,
                  orderId: orderId,
                  itemId: 1,
                },
              ],
            },
          ],
          payment: {
            paymentId: 1,
            amount: '300000',
            currentAmount: '300000',
            refundedAmount: '0',
            capturedAt: new Date('2024-06-27T05:37:12.168Z'),
            deletedAt: null,
          },
        }),
      ),
    }));

    const createOrderClaimReturnDto = new CreateOrderClaimReturnDto();
    createOrderClaimReturnDto.lineItems = [
      {
        itemId: 1,
        quantity: 1,
      },
    ];
    createOrderClaimReturnDto.reason = '그냥 반품';

    const action = async () => {
      await service.createOrderClaimReturn(customerUserId, orderId, createOrderClaimReturnDto);
    };

    await expect(action()).rejects.toEqual(
      new CustomException({
        code: 'invalid_request',
        statusCode: 400,
        messageParams: {
          entity: `order`,
          message: [
            { language: 'en', message: `Already returned item.` },
            { language: 'ko', message: `반품 가능한 개수를 초과하였습니다.` },
          ],
        },
      }),
    );
    //
  });
});
