import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateUserContestDto {
  @ApiProperty({
    description: 'The contest ID to join',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  contestId: string;

  @ApiProperty({
    description: 'Entry fee for the contest',
    example: 10.0,
  })
  @IsNumber()
  @IsPositive()
  entryFee: number;
}
