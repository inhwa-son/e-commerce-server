import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { OrderClaimCancelV1Request } from '../../../../../../types/v1/requests/order-claim';

export class CreateOrderClaimCancelDto implements OrderClaimCancelV1Request {
  @ApiProperty({ description: '상품 Id', required: true })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '주문 취소 사유', required: true })
  @IsString()
  reason: string;
}
