import { PartialType } from '@nestjs/mapped-types';
import { CreatePredictionDto } from './create-prediction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { OutcomeType } from '../../common/enums/outcome-type.enum';

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {

  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  videoId?: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES,
    required: false,
  })
  prediction?: OutcomeType;

}
