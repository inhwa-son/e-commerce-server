import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { OrderProductVariants } from './order-product-variants.dto';
import { OrderSheetV1Request } from '../../../../../types/v1/requests/order';

export class FindOrderSheetDto implements OrderSheetV1Request {
  @ApiProperty({ description: '주문 상품 옵션', required: true })
  @Transform(({ value }) => JSON.parse(decodeURI(value)))
  @IsOptional()
  productVariants: OrderProductVariants[];
}
