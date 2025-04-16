import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { SportsModule } from '../common/sports/sports.module';
import { TeamsModule } from '../teams/teams.module';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Event } from 'src/events/entities/events.entity';
import { Team } from 'src/teams/entities/team.entity';  
import { EventsModule } from 'src/events/events.module';
import { Contest } from 'src/contests/entities/contest.entity';
import { ContestsModule } from 'src/contests/contests.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Event, Team, Contest]), 
    SportsModule, 
    TeamsModule, 
    EventsModule,
    forwardRef(() => ContestsModule),
    NotificationsModule,
  ],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
