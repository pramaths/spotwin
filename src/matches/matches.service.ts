import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { Event } from 'src/events/entities/events.entity';
import { TeamsService } from 'src/teams/teams.service';
import { EventStatus } from '../common/enums/common.enum';

export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private teamsService: TeamsService,
  ) {}

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    const {eventId, teamAId, teamBId} = createMatchDto;
    const [event, teamA, teamB] = await Promise.all([
      this.eventRepository.findOne({ where: { id: eventId } }),
      this.teamsService.findOne(teamAId),
      this.teamsService.findOne(teamBId),
    ]);
    if(!event || !teamA || !teamB) {
      throw new NotFoundException(`Event, Team A or Team B not found`);
    }
    const match = this.matchRepository.create({
        ...createMatchDto,
        event,
        teamA,
        teamB
    });
    return this.matchRepository.save(match);
  }

  async findOne(id: string): Promise<Match> {
    return this.matchRepository.findOne({ 
      where: { id },
      relations: ['teamA', 'teamB', 'contests']
    });
  }

  async getAllLiveMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      where:[ {
        status: EventStatus.LIVE
      },
      {
        status: EventStatus.OPEN
      }
    ],
    relations: ['teamA', 'teamB', 'contests','event','event.sport']
    });
  }
  
  async getAllMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['teamA', 'teamB', 'contests', 'event','event.sport']
    });
  }

  async deleteMatch(id: string): Promise<void> {
    // if (updateEventDto.teamAId) {
    //     const teamA = await this.teamsService.findOne(updateEventDto.teamAId);
    //     if (!teamA) {
    //       throw new NotFoundException(
    //         `Team A with ID ${updateEventDto.teamAId} not found`,
    //       );
    //     }
    //     event.teamA = { id: teamA.id } as any;
    //     delete updateEventDto.teamAId;
    //   }
  
    //   // Handle teamBId update if provided
    // //   if (updateEventDto.teamBId) {
    // //     const teamB = await this.teamsService.findOne(updateEventDto.teamBId);
    // //     if (!teamB) {
    // //       throw new NotFoundException(
    // //         `Team B with ID ${updateEventDto.teamBId} not found`,
    // //       );
    // //     }
    // //     event.teamB = { id: teamB.id } as any;
    // //     delete updateEventDto.teamBId;
    // //   }
    await this.matchRepository.delete(id);
  }
}

