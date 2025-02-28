import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoSubmissionDto } from './create-video-submission.dto';

export class UpdateVideoSubmissionDto extends PartialType(
  CreateVideoSubmissionDto,
) {}
