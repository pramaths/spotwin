import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { OutcomeType } from '../../common/enums/outcome-type.enum';

export class CreateFeaturedVideoDto {
  @ApiProperty({
    description: 'The ID of the video submission to be featured',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  submissionId: string;

  @ApiProperty({
    description: 'The ID of the contest this video is featured for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  contestId: string;

  @ApiProperty({
    description:
      'The correct outcome of the question associated with this featured video',
    enum: OutcomeType,
    example: OutcomeType.YES,
    required: false,
  })
  @IsOptional()
  @IsEnum(OutcomeType)
  correctOutcome?: OutcomeType;
}
