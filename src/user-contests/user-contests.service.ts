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
import {Keypair, VersionedTransaction, Connection, clusterApiUrl, PublicKey} from '@solana/web3.js';
import * as bs58 from 'bs58'; 
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
    privyId: string,
  ): Promise<UserContest> {

    const feePayerAddress = process.env.FEE_PAYER_ADDRESS;
    const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY;
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed');
   
    const feePayerWallet = Keypair.fromSecretKey(bs58.decode(feePayerPrivateKey));
    console.log('Fee payer private key:', feePayerPrivateKey);
    console.log('Fee payer wallet:', feePayerWallet.publicKey.toBase58());

    const transactionBuffer = Buffer.from(createUserContestDto.instructions, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    const sim = await connection.simulateTransaction(transaction, { sigVerify: false });
    console.dir(sim.value.logs, { depth: null });

    const message = transaction.message;
    const accountKeys = message.getAccountKeys();
    const feePayerIndex = 0; // Fee payer is always the first account
    const feePayer = accountKeys.get(feePayerIndex);
    console.log('Fee payer:', feePayer.toBase58());
    if (!feePayer || feePayer.toBase58() !== feePayerAddress) {
      throw new BadRequestException('Invalid fee payer in transaction');
    }
    console.log("feepayer address matched")
    for (const instruction of message.compiledInstructions) {
      
      const programId = accountKeys.get(instruction.programIdIndex);

      // Check if instruction is for System Program (transfers)
      if (programId && programId.toBase58() === '11111111111111111111111111111111') {
        // Check if it's a transfer (command 2)
        if (instruction.data[0] === 2) {
          const senderIndex = instruction.accountKeyIndexes[0];
          const senderAddress = accountKeys.get(senderIndex);

          // Don't allow transactions that transfer tokens from fee payer
          if (senderAddress && senderAddress.toBase58() === feePayerAddress) {
            throw new BadRequestException('Transaction attempts to transfer funds from fee payer');
          }
        }
      }
    }
    console.log("transaction verified")
    transaction.sign([feePayerWallet]);

    // 4. Send transaction
    const signature = await connection.sendTransaction(transaction);
    console.log('Transaction signature:', signature);
    
    const user = await this.userRepository.findOne({
      where: { privyId: privyId },
    });
    console.log("user found",user.id)
    if(!user){
      throw new NotFoundException('User not found');
    }
    const contest = await this.contestRepository.findOne({
      where: { id: createUserContestDto.contestId },
      relations: ["match", "match.event"]
    });
    if(!contest){
      throw new NotFoundException('Contest not found');
    }
    const userContest = await this.userContestRepository.findOne({
        where: { contest: { id: contest.id }, user: { id: user.id } },
      });

    if (userContest) {
      throw new BadRequestException('User already joined this contest');
    }

    if(contest.status !== ContestStatus.OPEN){
      throw new BadRequestException('Contest is not open');
    }

    if(contest.match.startTime < new Date()){
      await this.contestRepository.update(contest.id, { status: ContestStatus.COMPLETED });
      throw new BadRequestException('Contest has already started');
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

    const newUserContest = this.userContestRepository.create({
      user: user,
      contest: contest,
      entryFee: contest.entryFee,
    });
    user.totalContests += 1;
    await this.userRepository.save(user);

    const savedUserContest = await this.userContestRepository.save(newUserContest);

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
    const user = await this.userRepository.findOne({
      where: { privyId: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userContests = await this.userContestRepository.find({
      where: { user: { id: user.id } },
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

  async findUserByPrivyId(privyId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { privyId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async userParticipationAnalytics(): Promise<any[]> {
    const result = await this.userContestRepository
      .createQueryBuilder('uc')
      .leftJoin('uc.user', 'user')
      .select('"user"."id"', 'userId')
      .addSelect('"user"."username"', 'username')
      .addSelect('"user"."phoneNumber"', 'phoneNumber')
      .addSelect('"user"."points"', 'points')
      .addSelect('"user"."totalContests"', 'totalContests')
      .addSelect('COUNT("uc"."contestId")', 'contestCount')
      .groupBy('"user"."id"')
      .addGroupBy('"user"."username"')
      .getRawMany();
  
    return result;
  }
  
}
