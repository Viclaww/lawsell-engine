import {
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID()
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsUUID()
  @IsOptional()
  affiliateProductId?: string;
}
