import { OrdersService } from './orders.service';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOrderSheetDto } from './dto/find-order-sheet.dto';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Order } from '../../entities/order.entity';
import { LineItem } from '../../entities/line-item.entity';
import { Payment } from '../../entities/payment.entity';
import { CustomerUser } from '../../entities/customer.entity';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderProductVariants } from './dto/order-product-variants.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

const findProductVariants = [
  {
    productVariantId: 1,
    title: '아이폰/red',
    inventoryQuantity: 493,
    soldQuantity: 7,
    claimQuantity: 0,
    productVariantPrice: '120000',
    isDefault: false,
    createdAt: new Date('2024-06-25T23:34:47.787Z'),
    updatedAt: new Date('2024-06-27T05:37:12.193Z'),
    deletedAt: null,
    productId: 1,
    product: {
      productId: 1,
      title: 'product-1',
      subtitle: null,
      description: null,
      createdAt: new Date('2024-06-25T23:34:47.787Z'),
      updatedAt: new Date('2024-06-27T05:37:12.193Z'),
      deletedAt: null,
    },
  },
];

const totalAmount = 120000;

const requestProductVariants = [
  {
    productVariantId: 1,
    quantity: 1,
  },
];

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderRepository: MockRepository<Order>;
  let mockProductVariantRepository: MockRepository<ProductVariant>;
  let mockLineItemRepository: MockRepository<LineItem>;
  let mockPaymentRepository: MockRepository<Payment>;
  let mockCustomerRepository: MockRepository<CustomerUser>;

  const customerUserId = 2;
  const orderId = 1;

  const mockRepository = () => ({
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
    })),
    findOne: jest.fn(),
    findOrderSheet: jest.fn(),
    create: jest.fn(),
    findOrderAmount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(LineItem),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(CustomerUser),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    mockOrderRepository = module.get<MockRepository<Order>>(getRepositoryToken(Order));
    mockProductVariantRepository = module.get<MockRepository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    mockLineItemRepository = module.get<MockRepository<LineItem>>(getRepositoryToken(LineItem));
    mockPaymentRepository = module.get<MockRepository<Payment>>(getRepositoryToken(Payment));
    mockCustomerRepository = module.get<MockRepository<CustomerUser>>(getRepositoryToken(CustomerUser));

    mockProductVariantRepository.createQueryBuilder = jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(Promise.resolve(findProductVariants)),
    }));

    service = module.get<OrdersService>(OrdersService);
  });

  it('findOrderSheet', async () => {
    jest.fn().mockResolvedValue([]);

    const findOrderSheetDto = new FindOrderSheetDto();
    findOrderSheetDto.productVariants = requestProductVariants;
    const result = await service.findOrderSheet(findOrderSheetDto);

    expect(result).toEqual({
      status: 'success',
      httpStatus: 200,
      message: 'Order sheet found successfully.',
      data: {
        totalAmount: totalAmount,
        productVariants: requestProductVariants,
      },
    });
  });

  it('findOrderAmount', async () => {
    const orderProductVariants: OrderProductVariants[] = requestProductVariants;

    const result = await service.findOrderAmount(orderProductVariants);

    expect(result).toEqual({
      totalAmount: totalAmount,
      findProductVariants: findProductVariants,
    });
  });

  it('create order', async () => {
    const createOrderDto = new CreateOrderDto();
    createOrderDto.productVariants = requestProductVariants;

    mockCustomerRepository.findOne = jest.fn().mockReturnValue(
      Promise.resolve({
        customerUserId: 2,
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        passwordHash: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );

    mockPaymentRepository.save = jest.fn().mockResolvedValue(
      Promise.resolve({
        paymentId: 1,
        paymentAmount: 100,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );

    mockOrderRepository.save = jest.fn().mockResolvedValue(
      Promise.resolve({
        orderId: orderId,
        customerUserId: customerUserId,
        status: 'pending',
        paymentStatus: 'pending',
        canceledAt: null,
        paymentAmount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    mockLineItemRepository.save = jest.fn().mockResolvedValue(
      Promise.resolve({
        lineItemId: 1,
        orderId: orderId,
        productVariantId: 1,
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    mockProductVariantRepository.save = jest.fn().mockResolvedValue(
      Promise.resolve({
        productVariantId: 1,
        productId: 1,
        inventoryQuantity: 100,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );

    const result = await service.create(customerUserId, createOrderDto);

    expect(result).toEqual({
      status: 'success',
      httpStatus: 201,
      message: 'Order created successfully.',
      data: {
        orderId: orderId,
      },
    });
  });
});
