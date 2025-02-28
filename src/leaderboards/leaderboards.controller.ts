import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  findAll() {
    return this.leaderboardsService.findAll();
  }

  @Get('contest/:contestId')
  findByContest(@Param('contestId') contestId: string) {
    return this.leaderboardsService.findByContest(contestId);
  }
}
