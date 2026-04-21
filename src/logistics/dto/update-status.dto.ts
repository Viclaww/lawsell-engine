import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['PENDING', 'RESERVED', 'ASSIGNED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status: string;
}
