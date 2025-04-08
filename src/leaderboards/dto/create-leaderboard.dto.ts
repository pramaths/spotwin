import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaderboardDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  contestId: string;

  @ApiProperty({
    description: 'The score of the user in the contest',
    example: 100,
    required: true,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({
    description: 'The rank of the user in the contest',
    example: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  rank: number;

  @ApiProperty({
    description: 'Points awarded to the user based on rank',
    example: 4000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  points?: number;
}
