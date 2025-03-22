import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contest } from './entities/contest.entity';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { EventsModule } from '../events/events.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { UserContestsModule } from '../user-contests/user-contests.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionsModule } from '../questions/questions.module';
import { MatchesModule } from '../matches/match.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest]),
    EventsModule,
    PredictionsModule,
    LeaderboardsModule,
    UserContestsModule,
    ConfigModule,
    QuestionsModule,
    MatchesModule,
  ],
  providers: [ContestsService],
  controllers: [ContestsController],
  exports: [ContestsService],
})
export class ContestsModule {}
