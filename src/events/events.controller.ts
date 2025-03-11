import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { UpdateEventStatusDto } from './dtos/update-event-status.dto';
import { EventsService } from './events.service';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';
import { EventStatus } from '../common/enums/common.enum';
import { Contest } from '../contests/entities/contest.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('Events')
@Controller('events')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<PaginatedResultDto<Event>> {
    try {
      this.logger.log(`Retrieving events - page: ${page}, limit: ${limit}`);

      // Cap the limit to prevent performance issues
      if (limit > 100) {
        limit = 100;
      }

      return await this.eventsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve events: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to retrieve events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event found successfully',
    type: Event,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    try {
      this.logger.log(`Retrieving event with id: ${id}`);
      const event = await this.eventsService.findOne(id);
      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return event;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve event ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Create new event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event created successfully',
    type: Event,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid event data',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Event image file',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        sportId: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        teamAId: { type: 'string' },
        teamBId: { type: 'string' },
      },
      required: ['file', 'title', 'sportId', 'startDate', 'endDate', 'teamAId', 'teamBId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Event> {
    try {
      this.logger.log(
        `Creating event with data: ${JSON.stringify(createEventDto)}`,
      );
      return await this.eventsService.create(createEventDto, file);
    } catch (error) {
      this.logger.error(
        `Failed to create event: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data or status transition',
  })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Event update data',
    examples: {
      updateTitle: {
        summary: 'Update event title',
        value: {
          title: 'Updated Event Title',
        },
      },
      updateStatus: {
        summary: 'Update event status',
        description: 'Status flow must follow: UPCOMING → OPEN → LIVE → COMPLETED',
        value: {
          status: EventStatus.OPEN,
        },
      },
      updateDates: {
        summary: 'Update event dates',
        value: {
          startDate: '2024-07-01T15:00:00Z',
          endDate: '2024-07-01T18:00:00Z',
        },
      },
    },
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    try {
      this.logger.log(
        `Updating event #${id} with data: ${JSON.stringify(updateEventDto)}`,
      );
      const updatedEvent = await this.eventsService.update(id, updateEventDto);
      if (!updatedEvent) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return updatedEvent;
    } catch (error) {
      this.logger.error(
        `Failed to update event ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ 
    summary: 'Update event status by ID',
    description: `Updates the status of an event. Status transitions must follow the sequence:
    UPCOMING → OPEN → LIVE → COMPLETED.
    Special statuses like CANCELLED and SUSPENDED can be set from any status.
    SUSPENDED status can transition back to UPCOMING, OPEN, or LIVE.
    Once an event is COMPLETED or CANCELLED, it cannot transition to any other status.`
  })
  @ApiParam({ name: 'id', description: 'Event ID (UUID)', type: 'string', example: '077e38f3-6275-4c68-920f-3a7de8ba9bbf' })
  @ApiBody({ 
    type: UpdateEventStatusDto,
    description: 'Status update information',
    examples: {
      live: {
        summary: 'Set event to LIVE',
        value: { status: EventStatus.LIVE }
      },
      completed: {
        summary: 'Set event to COMPLETED',
        value: { status: EventStatus.COMPLETED }
      },
      cancelled: {
        summary: 'Cancel an event',
        value: { status: EventStatus.CANCELLED }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Event status updated successfully',
    type: Event,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or bad request',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ): Promise<Event> {
    try {
      this.logger.log(`Updating status for event with ID: ${id}`);
      return await this.eventsService.updateStatus(id, updateEventStatusDto);
    } catch (error) {
      this.logger.error(`Error updating event status: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update event status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all contests for a specific event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contests retrieved successfully',
    type: [Contest],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @Get(':id/contests')
  async getEventContests(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Retrieving contests for event with id: ${id}`);
      return await this.eventsService.getEventContests(id);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve contests for event ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve contests for event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting event with id: ${id}`);
      const result = await this.eventsService.remove(id);
      if (!result) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Event deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete event ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
