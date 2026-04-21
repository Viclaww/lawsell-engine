import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsUUID()
  vendorId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  basePrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  platformCutPercent?: number;
}
