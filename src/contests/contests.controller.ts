import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  Put,
} from '@nestjs/common';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dtos/create-contest.dto';
import { UpdateContestDto } from './dtos/update-contest.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Contest } from './entities/contest.entity';
import { OutcomeType } from '../common/enums/outcome-type.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { Question } from '../questions/entities/questions.entity';

@ApiTags('contests')
@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  
  @Get('/active')
  @ApiOperation({ summary: 'Get all active contests (OPEN or LIVE) with limited details' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active contests with event, description, name, entry fee, and up to 3 featured videos',
    type: [Contest],
  })
  @ApiResponse({
    status: 404,
    description: 'No active contests found',
  })
  async findActiveContests() {
    try {
      const contests = await this.contestsService.findActiveContestsWithDetails();
      if (!contests.length) {
        throw new HttpException(
          'No active contests (OPEN or LIVE) found',
          HttpStatus.NOT_FOUND,
        );
      }
      return contests;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve active contests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new contest' })
  @ApiBody({ type: CreateContestDto })
  @ApiResponse({
    status: 201,
    description: 'Contest successfully created',
    type: Contest,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createContestDto: CreateContestDto) {
    try {
      return await this.contestsService.createContest(
        createContestDto.matchId,
        createContestDto,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create contest: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve a contest and calculate results' })
  @ApiParam({ name: 'id', description: 'Contest ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        selectedVideoId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174002',
        },
      },
      required: ['selectedVideoId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Contest resolved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Contest not found.' })
  async resolveContest(
    @Param('id') contestId: string,
  ) {
    try {
      await this.contestsService.resolveContest(contestId);
      return {
        message:
          'Contest resolved successfully. Payouts will be processed shortly.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to resolve contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/admin')
  @ApiOperation({ summary: 'Get all contests for admin' })
  @ApiResponse({
    status: 200,
    description: 'All contests retrieved',
  })
  async findAllAdmin() {
    try {
      return await this.contestsService.findAllAdmin();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve contests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contest by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Contest ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Contest retrieved', type: Contest })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.contestsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a contest by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Contest ID (UUID)' })
  @ApiBody({ type: UpdateContestDto })
  @ApiResponse({ status: 200, description: 'Contest updated', type: Contest })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async update(
    @Param('id') id: string,
    @Body() updateContestDto: UpdateContestDto,
  ) {
    try {
      return await this.contestsService.update(id, updateContestDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a contest by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Contest ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Contest deleted' })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async remove(@Param('id') id: string) {
    try {
      await this.contestsService.remove(id);
      return { message: 'Contest deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // New Contest Video Endpoints
  @Get(':contestId/videos')
  @ApiOperation({ summary: 'Get all video submissions for a contest' })
  @ApiParam({ name: 'contestId', description: 'Contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all video submissions for the contest',
    type: [Question],
  })
  async getContestVideos(@Param('contestId') contestId: string) {
    try {
      return await this.contestsService.getContestVideos(contestId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve contest videos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('questions/:questionId/answer')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set the answer for a featured video in a contest' })
  @ApiParam({ name: 'videoId', description: 'Featured Video ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contestId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        answer: { type: 'string', enum: ['yes', 'no'], example: 'yes' },
        question: { type: 'string', example: 'Will this shot go in?' },
      },
      required: ['contestId', 'answer', 'question'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video answered successfully',
    type: Question,
  })
  async answerVideo(
    @Param('questionId') questionId: string,
    @Body('contestId') contestId: string,
    @Body('answer') answer: 'yes' | 'no',
  ) {
    try {
      return await this.contestsService.answerVideo(
        questionId,
        contestId,
        answer,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to answer video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all contests' })
  @ApiResponse({
    status: 200,
    description: 'All contests retrieved',
    type: [Contest],
  })
  async findAll() {
    try {
      return await this.contestsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve contests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

