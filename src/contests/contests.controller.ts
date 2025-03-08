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

@ApiTags('contests')
@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
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
        createContestDto.eventId,
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
    @Body('selectedVideoId') selectedVideoId: string,
  ) {
    try {
      await this.contestsService.resolveContest(contestId, selectedVideoId);
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
}
