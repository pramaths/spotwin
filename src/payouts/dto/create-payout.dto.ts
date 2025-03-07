import { IsNotEmpty, IsUUID, IsNumber, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayoutDto {
  @ApiProperty({
    description: 'The ID of the user receiving the payout',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the contest associated with the payout',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  contestId: string;

  @ApiProperty({
    description: 'The amount of the payout',
    example: 50.0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'The transaction hash of the on-chain payout transaction',
    example: '5x8y...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}
