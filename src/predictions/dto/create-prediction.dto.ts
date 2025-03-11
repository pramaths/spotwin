import { IsEnum, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredictionDto {

  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES,
  })
  @IsEnum(OutcomeType)
  prediction: OutcomeType;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  contestId: string;
}
