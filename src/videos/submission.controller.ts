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
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VideoSubmission } from './entities/video-submission.entity';

@ApiTags('video-submissions')
@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new video submission' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        contestId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        question: { type: 'string', example: 'Will this shot go in?' },
        video: { type: 'string', format: 'binary' },
      },
      required: ['userId', 'contestId', 'question', 'video']
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The video submission has been successfully created.',
    type: VideoSubmission
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createVideoSubmissionDto: CreateVideoSubmissionDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    try {
      if (!files.video || !files.thumbnail) {
        throw new HttpException('Video and thumbnail files are required', HttpStatus.BAD_REQUEST);
      }
      
      const dto = {
        ...createVideoSubmissionDto,
        videoFile: files.video[0],
        thumbnailFile: files.thumbnail[0],
      };
      return await this.submissionService.create(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create video submission',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all video submissions' })
  @ApiQuery({ name: 'contestId', required: false, description: 'Filter by contest ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all video submissions',
    type: [VideoSubmission]
  })
  async findAll(@Query('contestId') contestId?: string) {
    try {
      if (contestId) {
        return await this.submissionService.findByContestId(contestId);
      }
      return await this.submissionService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve video submissions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video submission by id' })
  @ApiParam({ name: 'id', description: 'Video Submission ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the video submission with the specified id',
    type: VideoSubmission
  })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const submission = await this.submissionService.findOne(id);
      if (!submission) {
        throw new HttpException('Video submission not found', HttpStatus.NOT_FOUND);
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve video submission',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a video submission' })
  @ApiParam({ name: 'id', description: 'Video Submission ID' })
  @ApiBody({ type: UpdateVideoSubmissionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The video submission has been successfully updated.',
    type: VideoSubmission
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateVideoSubmissionDto: UpdateVideoSubmissionDto,
  ) {
    try {
      const submission = await this.submissionService.update(id, updateVideoSubmissionDto);
      if (!submission) {
        throw new HttpException('Video submission not found', HttpStatus.NOT_FOUND);
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update video submission',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video submission' })
  @ApiParam({ name: 'id', description: 'Video Submission ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The video submission has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.submissionService.remove(id);
      return { message: 'Video submission successfully deleted' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete video submission',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
