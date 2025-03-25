import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { SportsService } from '../common/sports/sports.service';
import { TeamsService } from '../teams/teams.service';
import { UpdateEventDto } from './dtos/update-event.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';
import { S3Service } from '../aws/s3.service';
import { EventStatus } from '../common/enums/common.enum';
import { UpdateEventStatusDto } from './dtos/update-event-status.dto';


@Injectable()
export class EventsService {
  private logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private sportsService: SportsService,
    private teamsService: TeamsService,
    private s3Service: S3Service,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    file: Express.Multer.File,
  ): Promise<Event> {
    if (!file) {
      throw new BadRequestException('Event image file is required');
    }

    let eventImageUrl;
    try {
      eventImageUrl = await this.s3Service.uploadFile(file);
      this.logger.log(`Successfully uploaded image to S3: ${eventImageUrl}`);
    } catch (error) {
      this.logger.error(`Failed to upload image to S3: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload event image');
    }

    try {
      const sport = await this.sportsService.findOne(createEventDto.sportId);
      if (!sport) {
        throw new NotFoundException(
          `Sport with ID ${createEventDto.sportId} not found`,
        );
      }

      const event = this.eventRepository.create({
        ...createEventDto,
        eventImageUrl,
        sport,
      });

      await this.eventRepository.save(event);
      return event;
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['contests',  'sport'],
    });
    return event;
  }

  async findAll(page = 1, limit = 10) {
    const [items, totalItems] = await this.eventRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: [ 'sport'],
    });

    return PaginatedResultDto.create(items, page, limit, totalItems);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findOne({ 
      where: { id },
      relations: [ 'sport'] 
    });
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Handle status update if provided
    if (updateEventDto.status && updateEventDto.status !== event.status) {
      this.validateStatusTransition(event.status, updateEventDto.status);
    }

    if (updateEventDto.sportId) {
      const sport = await this.sportsService.findOne(updateEventDto.sportId);
      if (!sport) {
        throw new NotFoundException(
          `Sport with ID ${updateEventDto.sportId} not found`,
        );
      }
      event.sport = sport;
      delete updateEventDto.sportId;
    }
    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async updateStatus(id: string, updateEventStatusDto: UpdateEventStatusDto): Promise<Event> {
    const event = await this.eventRepository.findOne({ 
      where: { id },
      relations: [ 'sport'] 
    });
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Validate the status transition
    this.validateStatusTransition(event.status, updateEventStatusDto.status);
    
    // Update the status
    event.status = updateEventStatusDto.status;
    event.updatedAt = new Date();
    
    this.logger.log(`Updating event ${id} status from ${event.status} to ${updateEventStatusDto.status}`);
    
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<Event> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return await this.eventRepository.remove(event);
  }

  private validateStatusTransition(currentStatus: EventStatus, newStatus: EventStatus): void {
    // Special statuses that can be set from any status
    if (newStatus === EventStatus.CANCELLED) {
      return;
    }

    // Define valid transitions
    const validTransitions = {
      [EventStatus.UPCOMING]: [EventStatus.LIVE],
      [EventStatus.LIVE]: [EventStatus.COMPLETED],
      [EventStatus.COMPLETED]: [], // Cannot transition from COMPLETED to any other status
      [EventStatus.CANCELLED]: [], // Cannot transition from CANCELLED to any other status
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions from ${currentStatus} are: ${validTransitions[currentStatus].join(', ') || 'none'}`
      );
    }
  }


  async getEventMatches(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['matches'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event.matches;
  }
}
