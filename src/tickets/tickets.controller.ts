import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Ticket } from './entities/ticket.entity';
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ 
    status: 201, 
    description: 'The ticket has been successfully created.',
    type: Ticket
  })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all tickets',
    type: [Ticket]
  })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the ticket with the specified id',
    type: Ticket
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ticket not found' 
  })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({ 
    status: 200, 
    description: 'The ticket has been successfully updated.',
    type: Ticket
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ticket not found' 
  })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ 
    status: 200, 
    description: 'The ticket has been successfully deleted.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ticket not found' 
  })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
} 