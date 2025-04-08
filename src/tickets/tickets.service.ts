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
    
    const updatedTicket = { ...ticket };
    
    if (updateTicketDto.teamAId !== undefined) {
      const teamA = await this.teamsService.findOne(updateTicketDto.teamAId);
      if (!teamA) {
        throw new NotFoundException(`Team A with ID ${updateTicketDto.teamAId} not found`);
      }
      updatedTicket.teamAId = updateTicketDto.teamAId;
      updatedTicket.teamA = teamA as any;
    }
    
    if (updateTicketDto.teamBId !== undefined) {
      const teamB = await this.teamsService.findOne(updateTicketDto.teamBId);
      if (!teamB) {
        throw new NotFoundException(`Team B with ID ${updateTicketDto.teamBId} not found`);
      }
      updatedTicket.teamBId = updateTicketDto.teamBId;
      updatedTicket.teamB = teamB as any;
    }
    
    // Update other fields if they're present in the DTO
    if (updateTicketDto.costPoints !== undefined) {
      updatedTicket.costPoints = updateTicketDto.costPoints;
    }
    
    if (updateTicketDto.stadium !== undefined) {
      updatedTicket.stadium = updateTicketDto.stadium;
    }
    
    if (updateTicketDto.matchDateTime !== undefined) {
      updatedTicket.matchDateTime = new Date(updateTicketDto.matchDateTime);
    }
    
    return this.ticketsRepository.save(updatedTicket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }
} 