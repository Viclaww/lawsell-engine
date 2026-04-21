import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['ADMIN', 'VENDOR', 'AFFILIATE'])
  @IsOptional()
  role?: string;
}
