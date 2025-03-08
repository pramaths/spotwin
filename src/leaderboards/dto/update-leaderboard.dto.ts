import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaderboardDto } from './create-leaderboard.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateLeaderboardDto extends PartialType(CreateLeaderboardDto) {
  @ApiProperty({
    description: 'The score of the user in the contest',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiProperty({
    description: 'The rank of the user in the contest',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;
}
