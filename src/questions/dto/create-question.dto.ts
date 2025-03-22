import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'Will the stock price of Tesla increase in the next 30 days?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;


  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsNotEmpty()
  @IsString()
  contestId: string;
}
