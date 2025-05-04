import { Controller, Get, Post, Body, Param, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
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
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy';
@ApiTags('user-contests')
@Controller('user-contests')
export class UserContestsController {
  constructor(private readonly userContestsService: UserContestsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all user contests' })
  @ApiResponse({
    status: 200,
    description: 'Returns all user contests',
    type: [UserContest],
  })
  findAll() {
    return this.userContestsService.findAll();
  }

  @Get('user-contest-analytics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user contest analytics' })
  @ApiResponse({
    status: 200,
    description: 'Returns user contest analytics',
    type: [UserContest],
  })
  async usercontestanalytics(){
    return this.userContestsService.userParticipationAnalytics();
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
  @Roles(UserRole.USER)
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new user contest' })
  @ApiResponse({
    status: 201,
    description: 'Returns the created user contest',
    type: UserContest,
  })
  async create(@Body() createUserContestDto: CreateUserContestDto, @Req() req: Request & { user: any }) {
    return this.userContestsService.create(createUserContestDto, req.user.id);
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
