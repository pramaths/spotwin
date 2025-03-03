import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { SportsService } from '../common/sports/sports.service';
import { UpdateEventDto } from './dtos/update-event.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private sportsService: SportsService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
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

  async findAll(page = 1, limit = 10) {
    const [items, totalItems] = await this.eventRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return PaginatedResultDto.create(items, page, limit, totalItems);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<Event> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return await this.eventRepository.remove(event);
  }
}
