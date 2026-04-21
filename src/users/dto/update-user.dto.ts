import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(['ADMIN', 'VENDOR', 'AFFILIATE'])
  @IsOptional()
  role?: string;
}
