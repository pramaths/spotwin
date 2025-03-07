import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
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
    manager?: any, // Optional manager for transactions
  ): Promise<UserContest> {
    const contest = await (manager
      ? manager.findOne(Contest, {
          where: { id: createUserContestDto.contestId },
        })
      : this.contestRepository.findOne({
          where: { id: createUserContestDto.contestId },
        }));

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    if (contest.status === 'CANCELLED' || contest.status === 'COMPLETED') {
      throw new BadRequestException('Contest is cancelled or completed');
    }

    const existingUserContest = await (manager
      ? manager.findOne(UserContest, {
          where: {
            user: { id: user.id },
            contest: { id: contest.id },
          },
        })
      : this.userContestRepository.findOne({
          where: {
            user: { id: user.id },
            contest: { id: contest.id },
          },
        }));

    if (existingUserContest) {
      throw new BadRequestException('User already joined this contest');
    }

    // Create user contest entry
    const userContest = manager
      ? manager.create(UserContest, {
          user,
          contest,
          entryFee: createUserContestDto.entryFee,
        })
      : this.userContestRepository.create({
          user,
          contest,
          entryFee: createUserContestDto.entryFee,
        });
    return manager
      ? manager.save(userContest)
      : this.userContestRepository.save(userContest);
  }

  async findAll(): Promise<UserContest[]> {
    return this.userContestRepository.find({
      relations: ['user', 'contest', 'bets', 'predictions'],
    });
  }

  async findOne(id: string): Promise<UserContest> {
    const userContest = await this.userContestRepository.findOne({
      where: { id },
      relations: ['user', 'contest', 'bets', 'predictions'],
    });

    if (!userContest) {
      throw new NotFoundException('User contest not found');
    }

    return userContest;
  }

  async findByUser(userId: string): Promise<UserContest[]> {
    return this.userContestRepository.find({
      where: { user: { id: userId } },
      relations: ['contest', 'bets', 'predictions'],
    });
  }
}
