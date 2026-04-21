import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateVariantDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsOptional()
  attributes?: Record<string, any>;
}
