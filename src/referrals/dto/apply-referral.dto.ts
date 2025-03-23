import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyReferralDto {
  @ApiProperty({
    description: 'Referral code to apply',
    example: 'Ax7@3b',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  referralCode: string;
} 