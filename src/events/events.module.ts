import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SportsModule } from '../common/sports/sports.module';
import { TeamsModule } from '../teams/teams.module';
import { S3Module } from 'src/aws/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), SportsModule, TeamsModule, S3Module],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
