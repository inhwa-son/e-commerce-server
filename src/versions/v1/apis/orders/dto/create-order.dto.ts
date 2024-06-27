import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderProductVariants } from './order-product-variants.dto';
import { CreateOrderV1Request } from '../../../../../types/v1/requests/order';

export class CreateOrderDto implements CreateOrderV1Request {
  @ApiProperty({ description: '상품 옵션', required: true })
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => OrderProductVariants)
  productVariants: OrderProductVariants[];
}
