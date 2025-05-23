import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { Event } from 'src/events/entities/events.entity';
import { TeamsService } from 'src/teams/teams.service';
import { MatchStatus, ContestStatus } from '../common/enums/common.enum';
import { Contest } from 'src/contests/entities/contest.entity';
import { UpdateMatchDto } from './dto/update-match.dto';
import { ContestsService } from 'src/contests/contests.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    private teamsService: TeamsService,
    @Inject(forwardRef(() => ContestsService))
    private contestsService: ContestsService,
  ) {}

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    const { eventId, teamAId, teamBId } = createMatchDto;
    const [event, teamA, teamB] = await Promise.all([
      this.eventRepository.findOne({ where: { id: eventId } }),
      this.teamsService.findOne(teamAId),
      this.teamsService.findOne(teamBId),
    ]);
    if (!event || !teamA || !teamB) {
      throw new NotFoundException(`Event, Team A or Team B not found`);
    }
    const match = this.matchRepository.create({
      ...createMatchDto,
      event,
      teamA,
      teamB,
    });
    const savedMatch = await this.matchRepository.save(match);

    return savedMatch;
  }

  async findOne(id: string): Promise<Match> {
    return this.matchRepository.findOne({
      where: { id },
      relations: ['teamA', 'teamB', 'contests'],
    });
  }

  async getAllLiveMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        {
          status: MatchStatus.OPEN,
        },
      ],
      relations: ['teamA', 'teamB', 'contests', 'event', 'event.sport'],
    });
  }

  async getAllMatchesByStatus(status: MatchStatus): Promise<Match[]> {
    return this.matchRepository.find({
      where: { status },
      relations: ['teamA', 'teamB', 'contests', 'event', 'event.sport'],
    });
  }

  async getAllMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['teamA', 'teamB', 'contests', 'event', 'event.sport'],
    });
  }

  async getMatchesByEventId(eventId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { event: { id: eventId } },
      relations: ['teamA', 'teamB', 'contests', 'event', 'event.sport'],
    });
  }

  async getContestsByMatchId(matchId: string): Promise<Contest[]> {
    return this.contestRepository.find({
      where: { match: { id: matchId } },
      relations: [
        'match',
        'match.teamA',
        'match.teamB',
        'match.event',
        'match.event.sport',
      ],
    });
  }

  async updateMatch(
    id: string,
    updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    const match = await this.findOne(id);
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    return this.matchRepository.save({ ...match, ...updateMatchDto });
  }

  async updateMatchStatus(id: string, status: MatchStatus): Promise<Match> {
    const match = await this.findOne(id);
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    const now = Date.now();
    const start = match.startTime.getTime();
    const THIRTY_MINUTES = 1000 * 60 * 30;

    match.status = status;
    if (
      status === MatchStatus.COMPLETED &&
      (now >= start || start - now <= THIRTY_MINUTES)
    ) {
      const contests = await this.contestRepository.find({
        where: { match: { id } },
      });
      await Promise.all(
        contests.map(async (contest) => {
          await this.contestsService.update(contest.id, {
            status: ContestStatus.COMPLETED,
          });
        }),
      );
    }
    return this.matchRepository.save(match);
  }

  async deleteMatch(id: string): Promise<void> {
    const match = await this.findOne(id);
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a completed match');
    }
    await this.matchRepository.delete(id);
  }
}
