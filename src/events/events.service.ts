import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { SportsService } from '../common/sports/sports.service';
import { UpdateEventDto } from './dtos/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private sportsService: SportsService,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const sport = await this.sportsService.findOne(createEventDto.sportId);
    if (!sport) {
      throw new NotFoundException(
        `Sport with ID ${createEventDto.sportId} not found`,
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      sport,
    });

    await this.eventRepository.save(event);
    return event;
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['contests'],
    });
    return event;
  }

  async findAll() {
    return await this.eventRepository.find();
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }
}
