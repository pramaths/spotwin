import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserContestsService } from './user-contests.service';
import { CreateUserContestDto } from './dto/create-user-contest.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/users.entity';
import { UserContest } from './entities/user-contest.entity';

@ApiTags('user-contests')
@Controller('user-contests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserContestsController {
  constructor(private readonly userContestsService: UserContestsService) {}

  @Post()
  @ApiOperation({ summary: 'Join a contest' })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined the contest',
    type: UserContest,
  })
  create(
    @Body() createUserContestDto: CreateUserContestDto,
    @GetUser() user: User,
  ) {
    return this.userContestsService.create(createUserContestDto, user);
  }

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
}
