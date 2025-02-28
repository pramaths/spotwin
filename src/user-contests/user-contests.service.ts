import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContest } from './entities/user-contest.entity';
import { CreateUserContestDto } from './dto/create-user-contest.dto';
import { User } from '../users/entities/users.entity';
import { Contest } from '../contests/entities/contest.entity';

@Injectable()
export class UserContestsService {
  constructor(
    @InjectRepository(UserContest)
    private userContestRepository: Repository<UserContest>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
  ) {}

  async create(
    createUserContestDto: CreateUserContestDto,
    user: User,
  ): Promise<UserContest> {
    const contest = await this.contestRepository.findOne({
      where: { id: createUserContestDto.contestId },
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const existingUserContest = await this.userContestRepository.findOne({
      where: {
        user: { id: user.id },
        contest: { id: contest.id },
      },
    });

    if (existingUserContest) {
      throw new BadRequestException('User already joined this contest');
    }

    const userContest = this.userContestRepository.create({
      user,
      contest,
      entryFee: createUserContestDto.entryFee,
    });

    return this.userContestRepository.save(userContest);
  }

  async findAll(): Promise<UserContest[]> {
    return this.userContestRepository.find({
      relations: ['user', 'contest', 'bets'],
    });
  }

  async findOne(id: string): Promise<UserContest> {
    const userContest = await this.userContestRepository.findOne({
      where: { id },
      relations: ['user', 'contest', 'bets'],
    });

    if (!userContest) {
      throw new NotFoundException('User contest not found');
    }

    return userContest;
  }

  async findByUser(userId: string): Promise<UserContest[]> {
    return this.userContestRepository.find({
      where: { user: { id: userId } },
      relations: ['contest', 'bets'],
    });
  }
}
