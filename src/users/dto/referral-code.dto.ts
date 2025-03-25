import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReferralCodeDto {
  @ApiProperty({
    description: 'Referral code to use',
    example: 'ABC123',
    required: false
  })
  @IsOptional()
  @IsString()
  referralCode?: string;
} 