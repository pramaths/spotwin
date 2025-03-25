import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The unique request ID received from OTP initiation',
    example: 'fd0a08e2-1d8f-4a5c-a6b7-c8d9e0f1a2b3',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'The OTP code received by the user',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+919999999999',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
} 