import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private teamsService: TeamsService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const teamA = await this.teamsService.findOne(createTicketDto.teamAId);
    const teamB = await this.teamsService.findOne(createTicketDto.teamBId);

    if (!teamA || !teamB) {
      throw new NotFoundException('One or both teams not found');
    }

    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      matchDateTime: new Date(createTicketDto.matchDateTime),
    });

    return this.ticketsRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // Check if teams exist if they are being updated
    if (updateTicketDto.teamAId) {
      await this.teamsService.findOne(updateTicketDto.teamAId);
    }
    
    if (updateTicketDto.teamBId) {
      await this.teamsService.findOne(updateTicketDto.teamBId);
    }

    // Convert matchDateTime string to Date if it's provided
    let matchDateTime = undefined;
    if (updateTicketDto.matchDateTime) {
      matchDateTime = new Date(updateTicketDto.matchDateTime);
    }

    // Remove matchDateTime from the DTO to handle it separately
    const { matchDateTime: dateTimeString, ...rest } = updateTicketDto;
    
    // Merge and save
    Object.assign(ticket, {
      ...rest,
      ...(matchDateTime && { matchDateTime }),
    });
    
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }
} 