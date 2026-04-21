import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  stock?: number;
}

export class ReserveStockDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
