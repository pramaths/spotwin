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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { EventsService } from './events.service';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

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
  @ApiBody({ type: CreateEventDto })
  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    try {
      this.logger.log(
        `Creating event with data: ${JSON.stringify(createEventDto)}`,
      );
      return await this.eventsService.create(createEventDto);
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
    description: 'Invalid update data',
  })
  @Patch(':id')
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
