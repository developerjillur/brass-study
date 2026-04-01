import { IsString, MinLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
