import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBetDto {
  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  contestId: string;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the transaction',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID()
  @IsNotEmpty()
  userContestId: string;
}
