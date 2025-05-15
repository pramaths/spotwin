import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionLevel } from '../../common/enums/common.enum';

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

  @ApiProperty({
    description: 'The difficulty level of the question',
    example: QuestionLevel.EASY,
  })
  @IsNotEmpty()
  @IsString()
  difficultyLevel: QuestionLevel;

  @ApiProperty({
    description: 'Special question',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  specialQuestion?: boolean;
}
