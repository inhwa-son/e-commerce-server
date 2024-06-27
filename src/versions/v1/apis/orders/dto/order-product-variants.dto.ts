import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class OrderProductVariants {
  @ApiProperty({ description: '주문 옵션 Id', required: true })
  @IsInt()
  productVariantId: number;

  @ApiProperty({ description: '주문 개수', required: true })
  @IsInt()
  quantity: number;
}
