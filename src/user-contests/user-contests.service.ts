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
import { BetsService } from '../bets/bets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from 'src/common/enums/transaction-type.enum';

@Injectable()
export class UserContestsService {
  constructor(
    @InjectRepository(UserContest)
    private userContestRepository: Repository<UserContest>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    @Inject(BetsService) private betsService: BetsService,
    @Inject(TransactionsService)
    private transactionsService: TransactionsService,
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

    if (contest.status === 'CANCELLED' || contest.status === 'COMPLETED') {
      throw new BadRequestException('Contest is cancelled or completed');
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

    // Create transaction (simulating on-chain payment)
    const transaction = await this.transactionsService.create({
      userId: user.id,
      contestId: contest.id,
      type: TransactionType.ENTRY_FEE,
      amount: createUserContestDto.entryFee,
      transactionHash: `tx_${Date.now()}`, // Placeholder for actual transaction hash
    });

    // Create user contest entry
    const userContest = this.userContestRepository.create({
      user,
      contest,
      entryFee: createUserContestDto.entryFee,
    });
    const savedUserContest = await this.userContestRepository.save(userContest);

    // Create bet entry (contest entry)
    const createBetDto = {
      contestId: contest.id,
      userId: user.id,
      transactionId: transaction.id,
    };
    await this.betsService.create(createBetDto);

    return savedUserContest;
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
