import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest } from './entities/contest.entity';
import { CreateContestDto } from './dtos/create-contest.dto';
import { UpdateContestDto } from './dtos/update-contest.dto';
import { EventsService } from '../events/events.service';
import {
  ContestStatus,
  VideoSubmissionStatus,
} from '../common/enums/common.enum';
import { PredictionsService } from '../predictions/predictions.service';
import { FeaturedService } from '../videos/featured.service';
import { SubmissionService } from '../videos/submission.service'; // Add this
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { UserContestsService } from '../user-contests/user-contests.service';
import { Connection, PublicKey } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { Wallet } from '@coral-xyz/anchor';
import { getKeypairFromFile } from '@solana-developers/helpers';
import Shoot9SDK, { Winner } from '../solana/program/contract-sdk';
import { VideoSubmission } from '../videos/entities/video-submission.entity';
import { FeaturedVideo } from '../videos/entities/featured-video.entity';
import { OutcomeType } from '../common/enums/outcome-type.enum';
import { EventStatus } from '../common/enums/common.enum';

@Injectable()
export class ContestsService implements OnModuleInit {
  private sdk: Shoot9SDK;
  private readonly logger = new Logger(ContestsService.name);

  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    private eventsService: EventsService,
    private predictionsService: PredictionsService,
    private featuredService: FeaturedService,
    private submissionService: SubmissionService, // Add this
    private leaderboardsService: LeaderboardsService,
    private userContestsService: UserContestsService,
    private configService: ConfigService,
  ) {
    this.sdk = null;
  }

  async onModuleInit() {
    const connection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') ||
        'https://rpc.mainnet-alpha.sonic.game',
      'confirmed',
    );
    const keypairPath = this.configService.get<string>('SOLANA_KEYPAIR_PATH');
    if (!keypairPath) {
      throw new Error(
        'SOLANA_KEYPAIR_PATH is not defined in the environment variables',
      );
    }
    const keypair = await getKeypairFromFile(keypairPath); // Use env variable
    const wallet = new Wallet(keypair);
    this.sdk = new Shoot9SDK(connection, wallet);
    this.logger.log('ContestsService initialized');
  }

  async createContest(
    eventId: string,
    createContestDto: CreateContestDto,
  ): Promise<Contest> {
    this.logger.log(`Creating contest for event ${eventId}`);
    const event = await this.eventsService.findOne(eventId);
    if (!event)
      throw new NotFoundException(`Event with ID ${eventId} not found`);

    const contest = this.contestRepository.create({
      ...createContestDto,
      event,
      contestPublicKey: createContestDto.contestPublicKey,
    });

    return await this.contestRepository.save(contest);
  }

  async resolveContest(
    contestId: string,
    selectedVideoId: string,
  ): Promise<void> {
    this.logger.log(`Resolving contest ${contestId} with selected video ${selectedVideoId}`);
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
      relations: ['userContests', 'userContests.user'],
    });
    if (!contest)
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    if (contest.status !== ContestStatus.OPEN)
      throw new BadRequestException(
        'Contest is not open and cannot be resolved',
      );

    const featuredVideos =
      await this.featuredService.getFeaturedByContest(contestId);
    if (featuredVideos.length !== 30)
      throw new BadRequestException(
        'Contest must have exactly 30 featured videos to resolve',
      );
    const allOutcomesSet = featuredVideos.every(
      (video) => video.correctOutcome !== null,
    );
    if (!allOutcomesSet)
      throw new BadRequestException(
        'All featured videos must have a correct outcome set before resolving',
      );

    const userContests = contest.userContests;
    const users = userContests.map((uc) => uc.user);

    const userScores: {
      userId: string;
      correctAnswers: number;
      tiebreakerScore: number;
      predictedSelectedVideo: boolean;
    }[] = [];
    for (const user of users) {
      const userContest = userContests.find((uc) => uc.user.id === user.id);
      if (!userContest) continue;

      const predictions = await this.predictionsService.findByContest(
        userContest.id,
      );
      if (predictions.length !== 9)
        throw new BadRequestException(
          `User ${user.id} must have exactly 9 predictions for contest ${contestId}`,
        );

      let correctAnswers = 0;
      let tiebreakerScore = 0;
      let predictedSelectedVideo = false;

      for (const prediction of predictions) {
        const featuredVideo = featuredVideos.find(
          (v) => v.id === prediction.videoId,
        );
        if (!featuredVideo)
          throw new NotFoundException(
            `Featured video ${prediction.videoId} not found`,
          );

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
        if (prediction.videoId === selectedVideoId)
          predictedSelectedVideo = true;
      }

      userScores.push({
        userId: user.id,
        correctAnswers,
        tiebreakerScore,
        predictedSelectedVideo,
      });
    }

    userScores.sort((a, b) => {
      if (a.correctAnswers !== b.correctAnswers)
        return b.correctAnswers - a.correctAnswers;
      return b.tiebreakerScore - a.tiebreakerScore;
    });

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

    for (const entry of leaderboardEntries)
      await this.leaderboardsService.create(entry);

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

    contest.status = ContestStatus.COMPLETED;
    await this.contestRepository.save(contest);

    const winners: Winner[] = leaderboardEntries.map((entry) => {
      const user = users.find((u) => u.id === entry.userId)!;
      const batch = batchAssignments.find(
        (ba) => ba.userId === entry.userId,
      )!.batch;
      const basePayout = entry.score * 10;
      const batchMultiplier = batch === '1' ? 2 : batch === '2' ? 1.5 : 1;
      const payoutInSol = basePayout * batchMultiplier;

      return { wallet: new PublicKey(user.publicAddress), payout: payoutInSol };
    });

    const feeReceiver = new PublicKey(
      this.configService.get<string>('FEE_RECEIVER_ADDRESS') ||
        this.sdk.wallet.publicKey.toString(),
    );

    // await this.sdk.resolveContest(
    //   Number(contest.solanaContestId),
    //   winners,
    //   feeReceiver,
    // );
  }

  async findOne(id: string): Promise<Contest> {
    this.logger.debug(`Finding contest with ID ${id}`);
    const contest = await this.contestRepository.findOne({
      where: { id },
      relations: {
        event: { sport: true, teamA: true, teamB: true },
      },
    });
    if (!contest)
      throw new NotFoundException(`Contest with ID ${id} not found`);
    return contest;
  }

  async findBySolanaContestId(solanaContestId: string): Promise<Contest> {
    this.logger.debug(`Finding contest with Solana contest ID ${solanaContestId}`);
    const contest = await this.contestRepository.findOne({
      where: { solanaContestId },
      relations: {
        event: { sport: true, teamA: true, teamB: true },
        userContests: true,
        transactions: true,
        leaderboards: true,
        payouts: true,
      },
    });
    if (!contest)
      throw new NotFoundException(
        `Contest with solanaContestId ${solanaContestId} not found`,
      );
    return contest;
  }

  async update(
    id: string,
    updateContestDto: UpdateContestDto,
  ): Promise<Contest> {
    this.logger.log(`Updating contest ${id}`);
    const contest = await this.findOne(id);
    Object.assign(contest, updateContestDto);
    await this.contestRepository.save(contest);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing contest ${id}`);
    const result = await this.contestRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Contest with ID ${id} not found`);
  }

  // New Contest Video Methods
  async getContestVideos(contestId: string): Promise<VideoSubmission[]> {
    this.logger.debug(`Getting videos for contest ${contestId}`);
    const contest = await this.findOne(contestId);
    return this.submissionService.findByContestId(contestId);
  }

  async approveVideo(
    videoId: string,
    contestId: string,
  ): Promise<VideoSubmission> {
    this.logger.log(`Approving video ${videoId} for contest ${contestId}`);
    const submission = await this.submissionService.findOne(videoId);
    if (submission.contestId !== contestId) {
      throw new BadRequestException(
        `Video ${videoId} does not belong to contest ${contestId}`,
      );
    }

    const updatedSubmission = await this.submissionService.update(videoId, {
      status: VideoSubmissionStatus.APPROVED, // Updated
    });

    const existingFeatured =
      await this.featuredService.getFeaturedByContest(contestId);
    if (!existingFeatured.some((v) => v.submissionId === videoId)) {
      const featuredCount = existingFeatured.length;
      if (featuredCount >= 30) {
        throw new BadRequestException(
          'Maximum limit of 30 featured videos reached for this contest',
        );
      }
      await this.featuredService.featureVideo({
        submissionId: videoId,
        contestId,
      });
    }

    return updatedSubmission;
  }

  async rejectVideo(
    videoId: string,
    contestId: string,
  ): Promise<VideoSubmission> {
    this.logger.log(`Rejecting video ${videoId} for contest ${contestId}`);
    const submission = await this.submissionService.findOne(videoId);
    if (submission.contestId !== contestId) {
      throw new BadRequestException(
        `Video ${videoId} does not belong to contest ${contestId}`,
      );
    }

    const updatedSubmission = await this.submissionService.update(videoId, {
      status: VideoSubmissionStatus.REJECTED, // Updated
    });

    const featuredVideos =
      await this.featuredService.getFeaturedByContest(contestId);
    const featuredVideo = featuredVideos.find(
      (v) => v.submissionId === videoId,
    );
    if (featuredVideo) {
      await this.featuredService.unfeaturedVideo(featuredVideo.id);
    }

    return updatedSubmission;
  }

  async selectVideos(
    contestId: string,
    videoIds: string[],
  ): Promise<FeaturedVideo[]> {
    this.logger.log(`Selecting ${videoIds.length} videos for contest ${contestId}`);
    const contest = await this.findOne(contestId);
    if (videoIds.length > 30) {
      throw new BadRequestException(
        'Cannot select more than 30 videos for a contest',
      );
    }

    const existingFeatured =
      await this.featuredService.getFeaturedByContest(contestId);
    if (existingFeatured.length + videoIds.length > 30) {
      throw new BadRequestException(
        `Cannot exceed 30 featured videos. Currently ${existingFeatured.length} videos are featured.`,
      );
    }

    const featuredVideos: FeaturedVideo[] = [];
    for (const videoId of videoIds) {
      const submission = await this.submissionService.findOne(videoId);
      if (submission.status !== VideoSubmissionStatus.APPROVED) {
        // Updated check
        throw new BadRequestException(
          `Video ${videoId} must be approved before selection`,
        );
      }
      if (submission.contestId !== contestId) {
        throw new BadRequestException(
          `Video ${videoId} does not belong to contest ${contestId}`,
        );
      }

      const existing = existingFeatured.find((v) => v.submissionId === videoId);
      if (!existing) {
        const featuredVideo = await this.featuredService.featureVideo({
          submissionId: videoId,
          contestId,
        });
        featuredVideos.push(featuredVideo);
      }
    }
    return featuredVideos;
  }

  async answerVideo(
    videoId: string,
    contestId: string,
    answer: 'yes' | 'no',
    question: string,
  ): Promise<FeaturedVideo> {
    this.logger.log(`Answering video ${videoId} for contest ${contestId} with ${answer}`);
    const submission = await this.submissionService.findOne(videoId);
    if (!submission || submission.contestId !== contestId) {
      throw new BadRequestException(
        `Video ${videoId} does not belong to contest ${contestId}`,
      );
    }

    if (submission.status !== VideoSubmissionStatus.APPROVED) {
      // Updated check
      throw new BadRequestException(
        `Video ${videoId} must be approved before answering`,
      );
    }

    let featuredVideo = (
      await this.featuredService.getFeaturedByContest(contestId)
    ).find((v) => v.submissionId === videoId);

    if (!featuredVideo) {
      const existingFeatured =
        await this.featuredService.getFeaturedByContest(contestId);
      if (existingFeatured.length >= 30) {
        throw new BadRequestException(
          'Maximum limit of 30 featured videos reached for this contest',
        );
      }
      featuredVideo = await this.featuredService.featureVideo({
        submissionId: videoId,
        contestId,
      });
    }

    await this.submissionService.update(videoId, { question });
    return this.featuredService.setOutcome(
      featuredVideo.id,
      answer === 'yes' ? OutcomeType.YES : OutcomeType.NO,
    );
  }

  async findAll(): Promise<Contest[]> {
    this.logger.debug('Finding all active contests');
    console.log('findAll');
    return await this.contestRepository.find({
      where: [
        { status: ContestStatus.OPEN ,
          event: { status: EventStatus.LIVE || EventStatus.OPEN },
        },
        { status: ContestStatus.LIVE,
          event: { status: EventStatus.LIVE || EventStatus.OPEN },
         },
      ],
      relations: {
        event: { sport: true, teamA: true, teamB: true },
      },
    });
  }

  async findActiveContestsWithDetails(): Promise<Partial<Contest>[]> {
    this.logger.debug('Finding active contests with details');
    const contests = await this.contestRepository.find({
      where: [{ status: ContestStatus.OPEN }, { status: ContestStatus.LIVE }],
      relations: ['event', 'event.teamA', 'event.teamB', 'featuredVideos'],
    });
    if (!contests.length) {
      return [];
    }

    return contests.map((contest) => ({
      id: contest.id,
      name: contest.name,
      description: contest.description,
      entryFee: contest.entryFee,
      event: contest.event, // Includes full event details (sport, teams, etc.)
      featuredVideos: contest.featuredVideos.slice(0, 3), // Limit to 3 featured videos
      status: contest.status,
      contestPublicKey: contest.contestPublicKey,
      contestCreator: contest.contestCreator,
      solanaContestId: contest.solanaContestId,
    }));
  }
}
