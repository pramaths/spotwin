import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SportsModule } from '../common/sports/sports.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), SportsModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
