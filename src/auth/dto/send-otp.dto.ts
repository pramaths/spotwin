import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'The phone number of the user (with country code)',
    example: '+919999999999',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[0-9]{1,3}[0-9]{10}$/, { message: 'Phone number must include country code (e.g., +919999999999)' })
  phoneNumber: string;
} 