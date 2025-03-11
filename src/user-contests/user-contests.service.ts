import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContest } from './entities/user-contest.entity';
import { UserStreak } from './entities/user-streak.entity';
import { CreateUserContestDto } from './dto/create-user-contest.dto';
import { User } from '../users/entities/users.entity';
import { Contest } from '../contests/entities/contest.entity';
import { startOfDay, differenceInDays, addDays } from 'date-fns';

@Injectable()
export class UserContestsService {
  constructor(
    @InjectRepository(UserContest)
    private userContestRepository: Repository<UserContest>,
    @InjectRepository(UserStreak)
    private userStreakRepository: Repository<UserStreak>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
  ) {}

  async create(
    createUserContestDto: CreateUserContestDto,
    user: User,
    manager?: any,
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
    const savedUserContest = await (manager
      ? manager.save(userContest)
      : this.userContestRepository.save(userContest));

    // Update streak
    await this.updateStreak(user, savedUserContest.joinedAt, manager);

    return savedUserContest;
  }

  async updateStreak(user: User, joinDate: Date, manager?: any): Promise<void> {
    const userStreak = await (manager
      ? manager.findOne(UserStreak, { where: { userId: user.id } })
      : this.userStreakRepository.findOne({ where: { userId: user.id } }));

    const joinDay = startOfDay(joinDate); // Normalize to start of the day

    if (!userStreak) {
      // First streak entry for the user
      const newStreak = manager
        ? manager.create(UserStreak, {
            user,
            userId: user.id,
            currentStreak: 1,
            highestStreak: 1,
            lastJoinedDate: joinDay,
          })
        : this.userStreakRepository.create({
            user,
            userId: user.id,
            currentStreak: 1,
            highestStreak: 1,
            lastJoinedDate: joinDay,
          });
      await (manager
        ? manager.save(newStreak)
        : this.userStreakRepository.save(newStreak));
      return;
    }

    const lastJoinedDay = userStreak.lastJoinedDate
      ? startOfDay(userStreak.lastJoinedDate)
      : null;
    const diffDays = lastJoinedDay
      ? differenceInDays(joinDay, lastJoinedDay)
      : Infinity;

    let newStreak: number;
    if (diffDays === 0) {
      // Same day, no change in streak
      newStreak = userStreak.currentStreak;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak = userStreak.currentStreak + 1;
    } else {
      // Missed a day or more, reset streak to 1
      newStreak = 1;
    }

    userStreak.currentStreak = newStreak;
    userStreak.lastJoinedDate = joinDay;
    userStreak.highestStreak = Math.max(userStreak.highestStreak, newStreak);

    await (manager
      ? manager.save(userStreak)
      : this.userStreakRepository.save(userStreak));
  }

  async getStreak(userId: string): Promise<UserStreak> {
    const userStreak = await this.userStreakRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!userStreak) {
      throw new NotFoundException(`Streak for user ID ${userId} not found`);
    }

    // Check if the streak should be reset due to missed days
    const lastJoinedDay = userStreak.lastJoinedDate
      ? startOfDay(userStreak.lastJoinedDate)
      : null;
    const today = startOfDay(new Date());
    const diffDays = lastJoinedDay
      ? differenceInDays(today, lastJoinedDay)
      : Infinity;

    if (diffDays > 1) {
      // Reset streak if more than one day has passed since the last join
      userStreak.currentStreak = 0;
      userStreak.lastJoinedDate = null;
      await this.userStreakRepository.save(userStreak);
    }

    return userStreak;
  }

  async findAll(): Promise<UserContest[]> {
    return this.userContestRepository.find({
      relations: ['user', 'contest', 'bets', 'predictions'],
    });
  }

  async findOne(id: string): Promise<UserContest> {
    const userContest = await this.userContestRepository.findOne({
      where: { id },
      relations: ['user', 'contest','contest.event', 'contest.event.teamA', 'contest.event.teamB'],
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
