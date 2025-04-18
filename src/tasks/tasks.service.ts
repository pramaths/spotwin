import { Injectable, Logger } from '@nestjs/common';
import { MatchesService } from 'src/matches/matches.service';
import { Cron } from '@nestjs/schedule';
import { MatchStatus } from '../common/enums/common.enum';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly matchService: MatchesService) 
    {}

    @Cron('0 15 15 * * *')
    async handleCron315pm() {
        this.logger.debug('Running scheduled task at 3:15 PM');
        const matches = await this.matchService.getAllMatchesByStatus(MatchStatus.OPEN);
        await Promise.all(matches.map(async (match) => {
            await this.matchService.updateMatchStatus(match.id, MatchStatus.COMPLETED);
        }));
    }

    @Cron('0 15 19 * * *')
    async handleCron715pm() {
        this.logger.debug('Running scheduled task at 7:15 PM');
        const matches = await this.matchService.getAllMatchesByStatus(MatchStatus.OPEN);
        await Promise.all(matches.map(async (match) => {
            await this.matchService.updateMatchStatus(match.id, MatchStatus.COMPLETED);
        }));
    }
}

