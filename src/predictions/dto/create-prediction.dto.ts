import { IsEnum, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredictionDto {
  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  userContestId: string;

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
    description: 'The position of the prediction (1-9)',
    minimum: 1,
    maximum: 9,
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(9)
  position: number;
}
