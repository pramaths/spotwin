import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './entities/leaderboard.entity';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { LeaderboardResponseDto } from './dto/response.dto';
@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
  ) {}

  async create(
    createLeaderboardDto: CreateLeaderboardDto,
  ): Promise<Leaderboard> {
    const leaderboard = this.leaderboardRepository.create(createLeaderboardDto);
    return await this.leaderboardRepository.save(leaderboard);
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
    const mockLeaderboardData: LeaderboardResponseDto[] = [
      { id: '1', rank: 1, username: 'pramath',  score: 1250, prize: '0.5 SOL' },
      { id: '2', rank: 2, username: 'sportsfan',  score: 1100, prize: '0.3 SOL' },
      { id: '3', rank: 3, username: 'gamemaster',  score: 950, prize: '0.2 SOL' },
      { id: '4', rank: 4, username: 'player4',  score: 820 },
      { id: '5', rank: 5, username: 'player5',  score: 780 },
      { id: '6', rank: 6, username: 'player6',  score: 750 },
      { id: '7', rank: 7, username: 'player7',  score: 720 },
      { id: '8', rank: 8, username: 'player8',  score: 690 },
      { id: '9', rank: 9, username: 'player9',  score: 650 },
      { id: '10', rank: 10, username: 'player10',  score: 600 },
    ];

    if (leaderboards.length === 0) {
      // throw new NotFoundException(
      //   `No leaderboard entries found for contest ID ${contestId}`,
      // );
      
      return mockLeaderboardData;
    }

    // return leaderboards.map((data)=>{
    //   return {
    //     id: data.id,
    //     rank: data.rank,
    //     username: data.user.username,
    //     score: data.score,
    //     prize: "IPL Ticket",
    //   };
    // });
    return mockLeaderboardData;
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
