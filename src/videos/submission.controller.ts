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
  Headers,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { VideoSubmission } from './entities/video-submission.entity';
import { memoryStorage } from 'multer';

const ALLOWED_PUBLIC_KEYS = [
  '6qRaQeLuacCxqJE6WMZTmcGkLWbSVf5wLLozKMfMNc6v',
  '7xCK2GhPkAnnBGVctJxQSz8vockVCWNCTrAHZRrwMqKH',
  '6Zyp56o3udAz4aoZwEDonwmqXW9mVU5x1gnnYXySN9dW'
];

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
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        contestId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        question: { type: 'string', example: 'Will this shot go in?' },
        video: { type: 'string', format: 'binary' },
      },
      required: ['userId', 'contestId', 'question', 'video'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The video submission has been successfully created.',
    type: VideoSubmission,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ], {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
      storage: memoryStorage(), // Use memory storage for processing
    }),
  )
  async create(
    @Body() createVideoSubmissionDto: CreateVideoSubmissionDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
    },
    @Headers('x-public-key') xPublicKey: string,
  ) {
    try {
      if (!files.video) {
        throw new HttpException(
          'Video file is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Log file size for debugging
      console.log(`Received video file size: ${files.video[0].size} bytes`);
      
      const dto = {
        ...createVideoSubmissionDto,
        videoFile: files.video[0],
      };

      // Skip the one-video-per-user-per-contest check for allowed public keys
      if (!ALLOWED_PUBLIC_KEYS.includes(xPublicKey)) {
        const existingSubmission =
          await this.submissionService.findOneByUserAndContest(
            dto.userId,
            dto.contestId,
          );
        if (existingSubmission) {
          throw new HttpException(
            `User ${dto.userId} has already submitted a video for contest ${dto.contestId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await this.submissionService.create(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create video submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all video submissions' })
  @ApiQuery({
    name: 'contestId',
    required: false,
    description: 'Filter by contest ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all video submissions',
    type: [VideoSubmission],
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video submission by id' })
  @ApiParam({ name: 'id', description: 'Video Submission ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the video submission with the specified id',
    type: VideoSubmission,
  })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const submission = await this.submissionService.findOne(id);
      if (!submission) {
        throw new HttpException(
          'Video submission not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve video submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
    type: VideoSubmission,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateVideoSubmissionDto: UpdateVideoSubmissionDto,
  ) {
    try {
      const submission = await this.submissionService.update(
        id,
        updateVideoSubmissionDto,
      );
      if (!submission) {
        throw new HttpException(
          'Video submission not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update video submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video submission' })
  @ApiParam({ name: 'id', description: 'Video Submission ID' })
  @ApiResponse({
    status: 200,
    description: 'The video submission has been successfully deleted.',
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all video submissions by a user' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: 200,
    description:
      'Returns all video submissions submitted by the user across contests',
    type: [VideoSubmission],
  })
  @ApiResponse({
    status: 404,
    description: 'No video submissions found for this user.',
  })
  async findByUser(@Param('userId') userId: string) {
    try {
      const submissions = await this.submissionService.findByUser(userId);
      if (!submissions.length) {
        throw new HttpException(
          `No video submissions found for user with ID ${userId}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return submissions;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve user video submissions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
