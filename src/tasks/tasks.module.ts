import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { MatchesService } from 'src/matches/matches.service';

@Module({
  providers: [TasksService, MatchesService],
})

export class TasksModule {}
