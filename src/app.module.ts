import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { typeOrmConfig } from './config/typeorm.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ContestsModule } from './contests/contests.module';
import { AuthModule } from './auth/auth.module';
import { SportsModule } from './common/sports/sports.module';
import { TeamsModule } from './teams/teams.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PredictionsModule } from './predictions/predictions.module';
import { AuthorizedCreatorsModule } from './authorized_creators/authorized-creators.module';
import { PrivyModule } from './privy/privy.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { PrivyAuthGuard } from './common/guards/privy-auth.guard';
import { AuthorizedCreator } from './authorized_creators/entities/authorized-creator.entity';
import { QuestionsModule } from './questions/questions.module';
import { MatchesModule } from './matches/matches.module';
import { ReferralsModule } from './referrals/referrals.module';
import { TicketsModule } from './tickets/tickets.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SolanaModule } from './solana/solana.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    TypeOrmModule.forFeature([AuthorizedCreator]),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    SportsModule,
    TeamsModule,
    EventsModule,
    ContestsModule,
    PredictionsModule,
    LeaderboardsModule,
    PayoutsModule,
    AuthorizedCreatorsModule,
    QuestionsModule,
    MatchesModule,
    ReferralsModule,
    TicketsModule,
    EmailModule,
    NotificationsModule,
    PrivyModule,
    SolanaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PrivyAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
