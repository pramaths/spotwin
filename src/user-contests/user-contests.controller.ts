import { Controller, Get, Post, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserContestsService } from './user-contests.service';
import { CreateUserContestDto } from './dto/create-user-contest.dto';
import { User } from '../users/entities/users.entity';
import { UserContest } from './entities/user-contest.entity';
import { UserStreak } from './entities/user-streak.entity';

@ApiTags('user-contests')
@Controller('user-contests')
export class UserContestsController {
  constructor(private readonly userContestsService: UserContestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user contests' })
  @ApiResponse({
    status: 200,
    description: 'Returns all user contests',
    type: [UserContest],
  })
  findAll() {
    return this.userContestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user contest' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user contest',
    type: UserContest,
  })
  findOne(@Param('id') id: string) {
    return this.userContestsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all contests for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user contests',
    type: [UserContest],
  })
  findByUser(@Param('userId') userId: string) {
    return this.userContestsService.findByUser(userId);
  }

  @Get('user/:userId/streak')
  @ApiOperation({ summary: 'Get the streak for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: "Returns the user's streak information",
    type: UserStreak,
  })
  @ApiResponse({ status: 404, description: 'Streak not found for user.' })
  async getStreak(@Param('userId') userId: string) {
    try {
      return await this.userContestsService.getStreak(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve user streak',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('join')
  @ApiOperation({ summary: 'Create a new user contest' })
  @ApiResponse({
    status: 201,
    description: 'Returns the created user contest',
    type: UserContest,
  })
  async create(@Body() createUserContestDto: CreateUserContestDto) {
    return this.userContestsService.create(createUserContestDto);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: 'Get all contests for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user contests',
    type: [UserContest],
  })
  findByContest(@Param('contestId') contestId: string) {
    return this.userContestsService.findByContest(contestId);
  }
  
}
