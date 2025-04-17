import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardResponseDto {
  @ApiProperty({ description: 'Unique identifier for the leaderboard entry' })
  id: string;

  @ApiProperty({ description: 'Rank of the user in the leaderboard' })
  rank: number;

  @ApiProperty({ description: 'Username of the user' })
  username: string;

  @ApiProperty({ description: 'Score of the user' })    
  score: number;

  @ApiProperty({ description: 'Prize of the user' })
  prize?: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;  
  
}

