import { IsUUID } from 'class-validator';

export class CreateAffiliateDto {
  @IsUUID()
  userId: string;
}
