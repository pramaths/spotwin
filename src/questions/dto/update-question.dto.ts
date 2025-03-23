import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
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
    description: 'The answer to the question',
    example: 'Yes',
    required: false,
  })
  @IsOptional()
  @IsString()
  outcome?: OutcomeType;
}

