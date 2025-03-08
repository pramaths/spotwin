import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contest } from './entities/contest.entity';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { EventsModule } from '../events/events.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { VideosModule } from '../videos/videos.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { UserContestsModule } from '../user-contests/user-contests.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest]),
    EventsModule,
    PredictionsModule,
    VideosModule,
    LeaderboardsModule,
    UserContestsModule,
    ConfigModule,
  ],
  providers: [ContestsService],
  controllers: [ContestsController],
  exports: [ContestsService],
})
export class ContestsModule {}
