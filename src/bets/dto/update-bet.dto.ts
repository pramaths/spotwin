import { PartialType } from '@nestjs/mapped-types';
import { CreateBetDto } from './create-bet.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBetDto extends PartialType(CreateBetDto) {
  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  contestId?: string;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'The ID of the transaction',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  transactionId?: string;
}
