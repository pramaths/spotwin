import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateVideoSubmissionDto {
  @ApiProperty({
    description: 'The ID of the user submitting the video',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the contest this video is submitted for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  contestId: string;

  @ApiProperty({
    description: 'The question associated with this video submission',
    example: 'Will this shot go in?',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The video file for the submission',
    required: true
  })
  videoFile: Express.Multer.File;
}
