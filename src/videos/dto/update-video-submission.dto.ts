import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoSubmissionDto } from './create-video-submission.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class UpdateVideoSubmissionDto extends PartialType(
  CreateVideoSubmissionDto,
) {
  @ApiProperty({
    description: 'The title of the video submission',
    example: 'Updated Basketball Shot',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The description of the video submission',
    example: 'This is an updated description for the basketball shot video',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The ID of the contest this video is submitted for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  contestId?: string;

  @ApiProperty({
    description: 'The question associated with this video submission',
    example: 'Will this amazing shot go in?',
    required: false
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    description: 'Whether the video is approved',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}
