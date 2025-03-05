import { PartialType } from '@nestjs/mapped-types';
import { CreateBetDto } from './create-bet.dto';
import { ApiProperty } from '@nestjs/swagger';
import { OutcomeType } from '../../common/enums/outcome-type.enum';

export class UpdateBetDto extends PartialType(CreateBetDto) {
  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  userContestId?: string;

  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false
  })
  videoId?: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES,
    required: false
  })
  prediction?: OutcomeType;

  @ApiProperty({
    description: 'The position of the bet (1-9)',
    minimum: 1,
    maximum: 9,
    example: 5,
    required: false
  })
  position?: number;
}
