import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContest } from './entities/user-contest.entity';
import { UserStreak } from './entities/user-streak.entity';
import { CreateUserContestDto } from './dto/create-user-contest.dto';
import { User } from '../users/entities/users.entity';
import { Contest } from '../contests/entities/contest.entity';
import { startOfDay, differenceInDays, addDays } from 'date-fns';
import { ContestStatus } from '../common/enums/common.enum';

@Injectable()
export class UserContestsService {
  constructor(
    @InjectRepository(UserContest)
    private userContestRepository: Repository<UserContest>,
    @InjectRepository(UserStreak)
    private userStreakRepository: Repository<UserStreak>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createUserContestDto: CreateUserContestDto,
    userId: string,
  ): Promise<UserContest> {
    if(userId !== createUserContestDto.userId){
      throw new ForbiddenException('You are not authorized to access this resource');
    }
    const [contest, user] = await Promise.all([
      this.contestRepository.findOne({
        where: { id: createUserContestDto.contestId },
        relations: ["match", "match.event"]
      }),
      this.userRepository.findOne({
        where: { id: createUserContestDto.userId },
      }),
    ]);

    if (!contest || !user) {
      throw new NotFoundException('Contest or user not found');
    }

    if (contest.status === 'CANCELLED' || contest.status === 'COMPLETED') {
      throw new BadRequestException('Contest is cancelled or completed');
    }

    if(contest.match.startTime < new Date()){
      await this.contestRepository.update(contest.id, { status: ContestStatus.COMPLETED });
      throw new BadRequestException('Contest has already started');
    }

    const existingUserContest = await this.userContestRepository.findOne({
      where: {
        user: { id: createUserContestDto.userId },
        contest: { id: contest.id },
      },
    });

    if (existingUserContest) {
      throw new BadRequestException('User already joined this contest');
    }

    const userContest = this.userContestRepository.create({
      user: user,
      contest: contest,
      entryFee: contest.entryFee,
    });
    user.points -= contest.entryFee;
    user.totalContests += 1;
    await this.userRepository.save(user);

    const savedUserContest = await this.userContestRepository.save(userContest);

    await this.updateStreak(user, savedUserContest.joinedAt);

    return savedUserContest;
  }

  async updateStreak(user: User, joinDate: Date): Promise<void> {
    const userStreak = await this.userStreakRepository.findOne({ where: { userId: user.id } });

    const joinDay = startOfDay(joinDate); // Normalize to start of the day

    if (!userStreak) {
      // First streak entry for the user
      const newStreak = this.userStreakRepository.create({
        user,
        userId: user.id,
        currentStreak: 1,
        highestStreak: 1,
        lastJoinedDate: joinDay,
      });
      await this.userStreakRepository.save(newStreak);
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

    await this.userStreakRepository.save(userStreak);
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
      relations: ['user', 'contest'],
    });

    if (!userContest) {
      throw new NotFoundException('User contest not found');
    }

    return userContest;
  }

  async findByUser(userId: string): Promise<any[]> {
    const userContests = await this.userContestRepository.find({
      where: { user: { id: userId } },
      relations: ['contest', 'contest.match', 'contest.match.teamA', 'contest.match.teamB', 'contest.match.event'],
    });

    return userContests.map(data => {
      const contest = { ...data.contest };
      
      if (contest.status === ContestStatus.RESOLVED) {
        contest.status = ContestStatus.COMPLETED;
      }
      
      return contest;
    });
  }

  async findByContest(contestId: string): Promise<any[]> {
    const userContests = await this.userContestRepository.find({
      where: { contest: { id: contestId } },
      relations: ['user', 'contest'],
    });
    return userContests;
  }

  async userParticipationAnalytics(): Promise<any[]> {
    const result = await this.userContestRepository
      .createQueryBuilder('uc')
      .leftJoin('uc.user', 'user')
      .select('"user"."id"', 'userId')
      .addSelect('"user"."username"', 'userName')
      .addSelect('COUNT("uc"."contestId")', 'contestCount')
      .groupBy('"user"."id"')
      .addGroupBy('"user"."username"')
      .getRawMany();
  
    return result;
  }
  
}
