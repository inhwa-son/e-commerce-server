import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderClaimReturnV1Request } from '../../../../../../types/v1/requests/order-claim';

export class CreateOrderClaimReturnDto implements OrderClaimReturnV1Request {
  @ApiProperty({ description: '주문 취소할 items', required: true })
  @ArrayMaxSize(20) // 최대 20개까지만 주문 가능
  @ValidateNested({ each: true })
  @Type(() => LineItems)
  lineItems: LineItems[];

  @ApiProperty({ description: '주문 취소 사유', required: true })
  @IsString()
  reason: string;
}

class LineItems {
  @ApiProperty({ description: 'itemId', required: true })
  @IsInt()
  itemId: number;

  @ApiProperty({ description: 'quantity', required: true })
  @IsInt()
  quantity: number;
}
