import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { QuestionLevel } from '../../common/enums/common.enum';

export class UpdateQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'Will the stock price of Tesla increase in the next 30 days?',
    required: false,
  })
  @IsOptional()
  @IsString()
  question?: string;
  
  @ApiProperty({
    description: 'The difficultyLevel of the question',
    example: QuestionLevel.EASY,
    required: false,
  })
  @IsOptional()
  @IsString()
  difficultyLevel?: QuestionLevel;

  @ApiProperty({
    description: 'The answer to the question',
    example: 'Yes',
    required: false,
  })
  @IsOptional()
  @IsString()
  outcome?: OutcomeType;

  @ApiProperty({
    description: 'Special question',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  specialQuestion?: boolean;
}

