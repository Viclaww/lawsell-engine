import { IsUUID, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAffiliateProductDto {
  @IsUUID()
  affiliateId: string;

  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  markupPercent?: number;
}
