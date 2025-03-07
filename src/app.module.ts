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
import { VideosModule } from './videos/videos.module';
import { PrivyModule } from './privy/privy.module';
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
    AuthModule,
    UserModule,
    SportsModule,
    TeamsModule,
    EventsModule,
    ContestsModule,
    VideosModule,
    PrivyModule,
    SolanaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
