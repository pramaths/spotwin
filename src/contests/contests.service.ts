import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest } from './entities/contest.entity';
import { CreateContestDto } from './dtos/create-contest.dto';
import { UpdateContestDto } from './dtos/update-contest.dto';
import { EventsService } from '../events/events.service';
import { ContestStatus } from '../common/enums/common.enum';
import { PredictionsService } from '../predictions/predictions.service';
import { FeaturedService } from '../videos/featured.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { UserContestsService } from '../user-contests/user-contests.service';
import { Connection, PublicKey } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { Wallet } from '@coral-xyz/anchor';
import { getKeypairFromFile } from '@solana-developers/helpers';
import Shoot9SDK, { Winner } from '../solana/program/contract_sdk';

@Injectable()
export class ContestsService implements OnModuleInit {
  private sdk: Shoot9SDK;

  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    private eventsService: EventsService,
    private predictionsService: PredictionsService,
    private featuredService: FeaturedService,
    private leaderboardsService: LeaderboardsService,
    private userContestsService: UserContestsService,
    private configService: ConfigService,
  ) {
    // Initialize without async operations
    this.sdk = null;
  }

  // Use onModuleInit lifecycle hook from NestJS
  async onModuleInit() {
    const connection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') ||
        'https://api.devnet.solana.com',
      'confirmed',
    );
    const keypair = await getKeypairFromFile(
      '/home/ritikbhatt020/.config/solana/id.json',
    );
    const wallet = new Wallet(keypair);
    this.sdk = new Shoot9SDK(connection, wallet);
  }

  async createContest(
    eventId: string,
    createContestDto: CreateContestDto,
  ): Promise<Contest> {
    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const contest = this.contestRepository.create({
      ...createContestDto,
      event,
    });

    return await this.contestRepository.save(contest);
  }

  async resolveContest(
    contestId: string,
    selectedVideoId: string,
  ): Promise<void> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
      relations: ['userContests', 'userContests.user'],
    });
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.status !== ContestStatus.OPEN) {
      throw new BadRequestException(
        'Contest is not open and cannot be resolved',
      );
    }

    // Step 1: Validate that all 30 featured videos have a correctOutcome
    const featuredVideos =
      await this.featuredService.getFeaturedByContest(contestId);
    if (featuredVideos.length !== 30) {
      throw new BadRequestException(
        'Contest must have exactly 30 featured videos to resolve',
      );
    }

    const allOutcomesSet = featuredVideos.every(
      (video) => video.correctOutcome !== null,
    );
    if (!allOutcomesSet) {
      throw new BadRequestException(
        'All featured videos must have a correct outcome set before resolving',
      );
    }

    // Step 2: Retrieve all users who joined the contest
    const userContests = contest.userContests;
    const users = userContests.map((uc) => uc.user);

    // Step 3: Calculate scores based on predictions (limited to 9 per user)
    const userScores: {
      userId: string;
      correctAnswers: number;
      tiebreakerScore: number;
      predictedSelectedVideo: boolean;
    }[] = [];
    for (const user of users) {
      const userContest = userContests.find((uc) => uc.user.id === user.id);
      if (!userContest) continue;

      const predictions = await this.predictionsService.findByUserContest(
        userContest.id,
      );
      if (predictions.length !== 9) {
        throw new BadRequestException(
          `User ${user.id} must have exactly 9 predictions for contest ${contestId}`,
        );
      }

      let correctAnswers = 0;
      let tiebreakerScore = 0;
      let predictedSelectedVideo = false;

      for (const prediction of predictions) {
        const featuredVideo = featuredVideos.find(
          (v) => v.id === prediction.videoId,
        );
        if (!featuredVideo) {
          throw new NotFoundException(
            `Featured video ${prediction.videoId} not found`,
          );
        }

        const isCorrect =
          prediction.prediction === featuredVideo.correctOutcome;
        prediction.isCorrect = isCorrect;
        await this.predictionsService.updatePredictionResult(
          prediction.id,
          isCorrect,
        );

        if (isCorrect) {
          correctAnswers++;
          tiebreakerScore +=
            featuredVideo.numberOfBets > 0 ? 1 / featuredVideo.numberOfBets : 1;
        }

        if (prediction.videoId === selectedVideoId) {
          predictedSelectedVideo = true;
        }
      }

      userScores.push({
        userId: user.id,
        correctAnswers,
        tiebreakerScore,
        predictedSelectedVideo,
      });
    }

    // Step 4: Rank users
    userScores.sort((a, b) => {
      if (a.correctAnswers !== b.correctAnswers) {
        return b.correctAnswers - a.correctAnswers; // Sort by correct answers (descending)
      }
      return b.tiebreakerScore - a.tiebreakerScore; // Tiebreaker (descending)
    });

    // Step 5: Assign ranks and create leaderboard entries
    const leaderboardEntries = [];
    let currentRank = 1;
    for (let i = 0; i < userScores.length; i++) {
      const userScore = userScores[i];
      if (
        i > 0 &&
        userScore.correctAnswers === userScores[i - 1].correctAnswers &&
        userScore.tiebreakerScore === userScores[i - 1].tiebreakerScore
      ) {
        leaderboardEntries.push({
          userId: userScore.userId,
          contestId,
          score: userScore.correctAnswers,
          rank: currentRank,
        });
      } else {
        currentRank = i + 1;
        leaderboardEntries.push({
          userId: userScore.userId,
          contestId,
          score: userScore.correctAnswers,
          rank: currentRank,
        });
      }
    }

    // Update leaderboard
    for (const entry of leaderboardEntries) {
      await this.leaderboardsService.create(entry);
    }

    // Step 6: Assign batches
    const batchSlots = [
      { min: 1, max: 1, slot: '1' },
      { min: 2, max: 2, slot: '2' },
      { min: 3, max: 3, slot: '3' },
      { min: 4, max: 8, slot: '4-8' },
      { min: 9, max: 12, slot: '9-12' },
      { min: 13, max: 20, slot: '13-20' },
      { min: 21, max: 50, slot: '20-50' },
      { min: 51, max: 200, slot: '50-200' },
      { min: 201, max: 550, slot: '200-550' },
    ];

    const batchAssignments: { userId: string; batch: string }[] = [];
    for (let i = 0; i < leaderboardEntries.length; i++) {
      const rank = leaderboardEntries[i].rank;
      const userScore = userScores.find(
        (us) => us.userId === leaderboardEntries[i].userId,
      )!;

      let batch = 'unassigned';
      for (const slot of batchSlots) {
        if (rank >= slot.min && rank <= slot.max) {
          batch = slot.slot;
          break;
        }
      }

      const isTop8 = rank <= 8;
      const isLastRanked = rank === leaderboardEntries.length;
      if (isTop8) {
        batchAssignments.push({ userId: userScore.userId, batch });
      } else if (isLastRanked) {
        const lowerBatch =
          batchSlots.find((slot) => slot.min > rank)?.slot || 'unassigned';
        batchAssignments.push({ userId: userScore.userId, batch: lowerBatch });
      } else {
        if (userScore.predictedSelectedVideo) {
          const currentSlotIndex = batchSlots.findIndex(
            (slot) => slot.slot === batch,
          );
          const higherBatch =
            currentSlotIndex > 0
              ? batchSlots[currentSlotIndex - 1].slot
              : batch;
          batchAssignments.push({
            userId: userScore.userId,
            batch: higherBatch,
          });
        } else {
          const currentSlotIndex = batchSlots.findIndex(
            (slot) => slot.slot === batch,
          );
          const lowerBatch =
            batchSlots[currentSlotIndex + 1]?.slot || 'unassigned';
          batchAssignments.push({
            userId: userScore.userId,
            batch: lowerBatch,
          });
        }
      }
    }

    // Step 7: Update contest status and selected video
    contest.status = ContestStatus.COMPLETED;
    contest.selectedVideoId = selectedVideoId;
    await this.contestRepository.save(contest);

    // Step 8: Trigger Solana payout
    const winners: Winner[] = leaderboardEntries.map((entry) => {
      const user = users.find((u) => u.id === entry.userId)!;
      const batch = batchAssignments.find(
        (ba) => ba.userId === entry.userId,
      )!.batch;
      const basePayout = entry.score * 10; // Example: 10 SOL per correct answer
      const batchMultiplier = batch === '1' ? 2 : batch === '2' ? 1.5 : 1; // Example multipliers
      const payoutInSol = basePayout * batchMultiplier; // Payout in SOL

      return {
        wallet: new PublicKey(user.publicAddress),
        payout: payoutInSol, // In SOL, not lamports (SDK converts internally)
      };
    });

    // Define feeReceiver (e.g., admin wallet or a configured address)
    const feeReceiver = new PublicKey(
      this.configService.get<string>('FEE_RECEIVER_ADDRESS') ||
        this.sdk.wallet.publicKey.toString(),
    );

    await this.sdk.resolveContest(
      Number(contest.solanaContestId),
      winners,
      feeReceiver,
    );
  }

  async findAll(): Promise<Contest[]> {
    return await this.contestRepository.find({
      relations: {
        event: {
          sport: true,
          teamA: true,
          teamB: true,
        },
        userContests: true,
        transactions: true,
        leaderboards: true,
        payouts: true,
      },
    });
  }

  async findOne(id: string): Promise<Contest> {
    const contest = await this.contestRepository.findOne({
      where: { id },
      relations: {
        event: {
          sport: true,
          teamA: true,
          teamB: true,
        },
        userContests: true,
        transactions: true,
        leaderboards: true,
        payouts: true,
      },
    });
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }
    return contest;
  }

  async findBySolanaContestId(solanaContestId: string): Promise<Contest> {
    const contest = await this.contestRepository.findOne({
      where: { solanaContestId },
      relations: {
        event: {
          sport: true,
          teamA: true,
          teamB: true,
        },
        userContests: true,
        transactions: true,
        leaderboards: true,
        payouts: true,
      },
    });
    if (!contest) {
      throw new NotFoundException(
        `Contest with solanaContestId ${solanaContestId} not found`,
      );
    }
    return contest;
  }

  async update(
    id: string,
    updateContestDto: UpdateContestDto,
  ): Promise<Contest> {
    const contest = await this.findOne(id);
    Object.assign(contest, updateContestDto);
    await this.contestRepository.save(contest);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }
  }
}
