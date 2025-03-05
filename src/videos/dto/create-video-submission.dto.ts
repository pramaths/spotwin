import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateVideoSubmissionDto {
  @ApiProperty({
    description: 'The title of the video submission',
    example: 'Amazing Basketball Shot',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the video submission',
    example: 'This is an incredible basketball shot from half-court',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The video file to upload',
    type: 'string',
    format: 'binary',
    required: true
  })
  videoFile: Express.Multer.File;

  @ApiProperty({
    description: 'The thumbnail image for the video',
    type: 'string',
    format: 'binary',
    required: true
  })
  thumbnailFile: Express.Multer.File;

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
}
