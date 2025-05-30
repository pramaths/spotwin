import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './entities/leaderboard.entity';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { LeaderboardResponseDto } from './dto/response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    createLeaderboardDto: CreateLeaderboardDto,
  ): Promise<Leaderboard> {
    const leaderboard = this.leaderboardRepository.create(createLeaderboardDto);
    const savedLeaderboard = await this.leaderboardRepository.save(leaderboard);
    
    return savedLeaderboard;
  }

  async findAllGroupedByContest(): Promise<{
    [contestId: string]: Leaderboard[];
  }> {
    const leaderboards = await this.leaderboardRepository.find({
      relations: ['user', 'contest'],
      order: {
        contestId: 'ASC',
        rank: 'ASC',
      },
    });

    // Group by contestId
    const groupedByContest: { [contestId: string]: Leaderboard[] } = {};
    leaderboards.forEach((leaderboard) => {
      if (!groupedByContest[leaderboard.contestId]) {
        groupedByContest[leaderboard.contestId] = [];
      }
      groupedByContest[leaderboard.contestId].push(leaderboard);
    });

    return groupedByContest;
  }

  async findOne(id: string): Promise<Leaderboard> {
    const leaderboard = await this.leaderboardRepository.findOne({
      where: { id },
      relations: ['user', 'contest'],
    });

    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }

    return leaderboard;
  }

  async findByContest(contestId: string): Promise<LeaderboardResponseDto[]> {
    const leaderboards = await this.leaderboardRepository.find({
      where: { contestId },
      relations: ['user', 'contest'],
      order: {
        rank: 'ASC',
      },
    });

    if (leaderboards.length === 0) {
      throw new NotFoundException(
        `No leaderboard entries found for contest ID ${contestId}`,
      );
    }

    return leaderboards.map((data)=>{
      return {
        id: data.id,
        rank: data.rank,
        username: data.user.username,
        score: data.score,
        prize: data.points.toString(),
        userId: data.userId,
      };
    });
  }

  async findByUser(userId: string): Promise<Leaderboard[]> {
    const leaderboards = await this.leaderboardRepository.find({
      where: { userId },
      relations: ['user', 'contest'],
      order: {
        contestId: 'ASC',
        rank: 'ASC',
      },
    });

    if (leaderboards.length === 0) {
      throw new NotFoundException(
        `No leaderboard entries found for user ID ${userId}`,
      );
    }

    return leaderboards;
  }

  async update(
    id: string,
    updateLeaderboardDto: UpdateLeaderboardDto,
  ): Promise<Leaderboard> {
    const leaderboard = await this.findOne(id);
    Object.assign(leaderboard, updateLeaderboardDto);
    return await this.leaderboardRepository.save(leaderboard);
  }

  async remove(id: string): Promise<void> {
    const leaderboard = await this.findOne(id);
    await this.leaderboardRepository.remove(leaderboard);
  }
}
