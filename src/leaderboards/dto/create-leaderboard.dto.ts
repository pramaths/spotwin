import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateLeaderboardDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  contestId: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsNumber()
  @Min(1)
  rank: number;
}
