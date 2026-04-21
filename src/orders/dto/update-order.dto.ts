import { IsUUID, IsOptional, IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['PENDING', 'RESERVED', 'ASSIGNED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  vendorId?: string;
}
