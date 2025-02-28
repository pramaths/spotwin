import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  create(
    @Body() createVideoSubmissionDto: CreateVideoSubmissionDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const dto = {
      ...createVideoSubmissionDto,
      videoFile: files.video[0],
      thumbnailFile: files.thumbnail[0],
    };
    return this.submissionService.create(dto);
  }

  @Get()
  findAll() {
    return this.submissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVideoSubmissionDto: UpdateVideoSubmissionDto,
  ) {
    return this.submissionService.update(id, updateVideoSubmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.submissionService.remove(id);
  }
}
