import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Leaderboard } from './entities/leaderboard.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { LeaderboardResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy';
@ApiTags('leaderboards')
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new leaderboard entry' })
  @ApiBody({ type: CreateLeaderboardDto })
  @ApiResponse({
    status: 201,
    description: 'The leaderboard entry has been successfully created.',
    type: Leaderboard,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    try {
      const leaderboard = await this.leaderboardsService.create(createLeaderboardDto);
      return leaderboard;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create leaderboard entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all leaderboard entries grouped by contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all leaderboard entries grouped by contest ID',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { $ref: '#/components/schemas/Leaderboard' },
      },
    },
  })
  async findAll() {
    try {
      return await this.leaderboardsService.findAllGroupedByContest();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve leaderboard entries',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contest/:contestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get leaderboard entries for a specific contest' })
  @ApiParam({ name: 'contestId', description: 'Contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return leaderboard entries for the specified contest',
    type: [LeaderboardResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Contest not found or no entries.' })
  async findByContest(@Param('contestId') contestId: string) {
    try {
      return await this.leaderboardsService.findByContest(contestId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve leaderboard entries for contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get leaderboard entries for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return leaderboard entries for the specified user',
    type: [Leaderboard],
  })
  @ApiResponse({ status: 404, description: 'User not found or no entries.' })
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.leaderboardsService.findByUser(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve leaderboard entries for user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leaderboard entry by ID' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the leaderboard entry with the specified ID',
    type: Leaderboard,
  })
  @ApiResponse({ status: 404, description: 'Leaderboard entry not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.leaderboardsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve leaderboard entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a leaderboard entry' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  @ApiBody({ type: UpdateLeaderboardDto })
  @ApiResponse({
    status: 200,
    description: 'The leaderboard entry has been successfully updated.',
    type: Leaderboard,
  })
  @ApiResponse({ status: 404, description: 'Leaderboard entry not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateLeaderboardDto: UpdateLeaderboardDto,
  ) {
    try {
      return await this.leaderboardsService.update(id, updateLeaderboardDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update leaderboard entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a leaderboard entry' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  @ApiResponse({
    status: 200,
    description: 'The leaderboard entry has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Leaderboard entry not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.leaderboardsService.remove(id);
      return { message: 'Leaderboard entry successfully deleted' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete leaderboard entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
