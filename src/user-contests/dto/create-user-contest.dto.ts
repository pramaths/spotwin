import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserContestDto {
  @ApiProperty({
    description: 'The contest ID to join',
    example: 1,
  })
  @IsString()
  @IsNotEmpty()
  contestId: string;

  @ApiProperty({
    description: 'The userId',
    example: 10,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
