import { PartialType } from '@nestjs/mapped-types';
import { CreatePayoutDto } from './create-payout.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class UpdatePayoutDto extends PartialType(CreatePayoutDto) {
  @ApiProperty({
    description: 'The amount of the payout',
    example: 75.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: 'The transaction hash of the on-chain payout transaction',
    example: '5x8y...',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionHash?: string;
}
