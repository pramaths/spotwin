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
    MatchStatus
} from '../common/enums/common.enum';
import { PredictionsService } from '../predictions/predictions.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { UserContestsService } from '../user-contests/user-contests.service';
import { ConfigService } from '@nestjs/config';
import { OutcomeType } from '../common/enums/outcome-type.enum';
import { EventStatus } from '../common/enums/common.enum';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/entities/questions.entity';
import { Match } from '../matches/entities/match.entity';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class ContestsService {
  private readonly logger = new Logger(ContestsService.name);

  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    private predictionsService: PredictionsService,
    private leaderboardsService: LeaderboardsService,
    private userContestsService: UserContestsService,
    private configService: ConfigService,
    private questionsService: QuestionsService,
    private matchesService: MatchesService,
  ) { }


  async createContest(
    matchId: string,
    createContestDto: CreateContestDto,
  ): Promise<Contest> {
    this.logger.log(`Creating contest for match ${matchId}`);
    const match = await this.matchesService.findOne(matchId);
    if (!match)
      throw new NotFoundException(`Match with ID ${matchId} not found`);

    const contest = this.contestRepository.create({
      ...createContestDto,
      match,
    });

    return await this.contestRepository.save(contest);
  }

  async resolveContest(
    contestId: string,
  ): Promise<void> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
      relations: ['userContests', 'userContests.user'],
    });
    if (!contest)
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    if (contest.status !== ContestStatus.COMPLETED)
      throw new BadRequestException(
        'Contest is not completed and cannot be resolved',
      );

    const questions =
      await this.questionsService.findByContestId(contestId);
    if (questions.length !== 12)
      throw new BadRequestException(
        'Contest must have exactly 12 questions to resolve',
      );
    const allOutcomesSet = questions.every(
      (question) => question.outcome !== null,
    );
    if (!allOutcomesSet)
      throw new BadRequestException(
        'All questions must have a correct outcome set before resolving',
      );

    const questionMap = new Map<string, Question>();
    for (const question of questions) {
      questionMap.set(question.id, question);
    }

    const userContests = contest.userContests;
    const userMap = new Map<string, any>();
    for (const uc of userContests) {
      userMap.set(uc.user.id, uc.user);
    }

    const allPredictions = [];
    const userContestIds = userContests.map(uc => uc.id);
    for (const userContestId of userContestIds) {
      const userPredictions = await this.predictionsService.findByContest(userContestId);
      allPredictions.push(...userPredictions);
    }

    // Group predictions by user ID using a Map
    const predictionsByUser = new Map<string, any[]>();
    for (const prediction of allPredictions) {
      if (!predictionsByUser.has(prediction.userId)) {
        predictionsByUser.set(prediction.userId, []);
      }
      predictionsByUser.get(prediction.userId).push(prediction);
    }

    // Prepare batch updates for predictions
    const predictionUpdates = [];

    // Calculate scores for each user
    const userScores = [];
    for (const [userId, userPredictions] of predictionsByUser.entries()) {
      if (userPredictions.length !== 9) {
        this.logger.warn(`User ${userId} has ${userPredictions.length} predictions instead of 9 for contest ${contestId}`);
        continue;
      }

      let correctAnswers = 0;
      let tiebreakerScore = 0;
      let predictedSelectedVideo = false;

      // Check each prediction against questions
      for (const prediction of userPredictions) {
        const question = questionMap.get(prediction.videoId);
        if (!question) {
          throw new NotFoundException(
            `Featured video ${prediction.videoId} not found`,
          );
        }

        const isCorrect = prediction.prediction === question.outcome;

        predictionUpdates.push({
          id: prediction.id,
          isCorrect
        });

        // Update scores
        if (isCorrect) {
          correctAnswers++;
          tiebreakerScore +=
            question.numberOfBets > 0 ? 1 / question.numberOfBets : 1;
        }
      }

      userScores.push({
        userId,
        correctAnswers,
        tiebreakerScore,
        predictedSelectedVideo,
      });
    }

    // Batch update all predictions
    await Promise.all(
      predictionUpdates.map(update =>
        this.predictionsService.updatePredictionResult(update.id, update.isCorrect)
      )
    );

    // Sort users by score and tiebreaker
    userScores.sort((a, b) => {
      if (a.correctAnswers !== b.correctAnswers)
        return b.correctAnswers - a.correctAnswers;
      return b.tiebreakerScore - a.tiebreakerScore;
    });

    // Create leaderboard entries
    const leaderboardEntries = [];
    let currentRank = 1;
    let prevScore = null;
    let prevTiebreaker = null;

    for (let i = 0; i < userScores.length; i++) {
      const userScore = userScores[i];

      // Only increment rank if score or tiebreaker is different
      if (i > 0 &&
        (userScore.correctAnswers !== prevScore ||
          userScore.tiebreakerScore !== prevTiebreaker)) {
        currentRank = i + 1;
      }

      leaderboardEntries.push({
        userId: userScore.userId,
        contestId,
        score: userScore.correctAnswers,
        rank: currentRank,
      });

      prevScore = userScore.correctAnswers;
      prevTiebreaker = userScore.tiebreakerScore;
    }

    // Batch create leaderboard entries
    await Promise.all(
      leaderboardEntries.map(entry => this.leaderboardsService.create(entry))
    );

    // Batch slot assignments
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

    // Create a map for quick batch lookup
    const batchSlotMap = new Map();
    for (const slot of batchSlots) {
      for (let rank = slot.min; rank <= slot.max; rank++) {
        batchSlotMap.set(rank, slot.slot);
      }
    }

    const batchAssignments = [];
    for (let i = 0; i < leaderboardEntries.length; i++) {
      const entry = leaderboardEntries[i];
      const userScore = userScores.find(us => us.userId === entry.userId);
      const rank = entry.rank;

      let batch = batchSlotMap.get(rank) || 'unassigned';

      const isTop8 = rank <= 8;
      const isLastRanked = rank === leaderboardEntries.length;

      if (isTop8) {
        batchAssignments.push({ userId: userScore.userId, batch });
      } else if (isLastRanked) {
        // Find the next higher batch slot
        let nextBatch = 'unassigned';
        for (const slot of batchSlots) {
          if (slot.min > rank) {
            nextBatch = slot.slot;
            break;
          }
        }
        batchAssignments.push({ userId: userScore.userId, batch: nextBatch });
      } else {
        if (userScore.predictedSelectedVideo) {
          // Move up one batch if possible
          const currentIndex = batchSlots.findIndex(slot => slot.slot === batch);
          const higherBatch = currentIndex > 0 ? batchSlots[currentIndex - 1].slot : batch;
          batchAssignments.push({ userId: userScore.userId, batch: higherBatch });
        } else {
          // Move down one batch if possible
          const currentIndex = batchSlots.findIndex(slot => slot.slot === batch);
          const lowerBatch = batchSlots[currentIndex + 1]?.slot || 'unassigned';
          batchAssignments.push({ userId: userScore.userId, batch: lowerBatch });
        }
      }
    }

    // Update contest status
    contest.status = ContestStatus.COMPLETED;
    await this.contestRepository.save(contest);

    // Calculate winners and payouts
    const winners: any[] = leaderboardEntries.map((entry) => {
      const user = userMap.get(entry.userId);
      const batch = batchAssignments.find(ba => ba.userId === entry.userId)?.batch;
      const basePayout = entry.score * 10;
      const batchMultiplier = batch === '1' ? 2 : batch === '2' ? 1.5 : 1;
      const payoutInSol = basePayout * batchMultiplier;

      return { wallet: (user.publicAddress), payout: payoutInSol };
    });


  }

  async findOne(id: string): Promise<Contest> {
    this.logger.debug(`Finding contest with ID ${id}`);
    const contest = await this.contestRepository.findOne({
      where: { id },
      relations: {
        match: { event: { sport: true, }, teamA: true, teamB: true }
      },
    });
    if (!contest)
      throw new NotFoundException(`Contest with ID ${id} not found`);
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
  async getContestVideos(contestId: string): Promise<Question[]> {
    this.logger.debug(`Getting videos for contest ${contestId}`);
    const contest = await this.findOne(contestId);
    return this.questionsService.findByContestId(contestId);
  }

  async answerVideo(
    questionId: string,
    contestId: string,
    answer: 'yes' | 'no',
  ): Promise<Question> {
    this.logger.log(`Answering video ${questionId} for contest ${contestId} with ${answer}`);
    const question = await this.questionsService.findOne(questionId);
    if (!question || question.contestId !== contestId) {
      throw new BadRequestException(
        `Video ${questionId} does not belong to contest ${contestId}`,
      );
    }

    return this.questionsService.setOutcome(
      question.id,
      answer === 'yes' ? OutcomeType.YES : OutcomeType.NO,
    )
  }

  async findAll(): Promise<Contest[]> {
    return await this.contestRepository.find({
      where: [
        {
          status: ContestStatus.OPEN,
          match: {
            status: MatchStatus.OPEN 
          },
        },
      ],
      relations: {
        match: { event: { sport: true, }, teamA: true, teamB: true }
      },
    });
  }

  async findAllAdmin(): Promise<Contest[]> {
    return await this.contestRepository.find({
      relations: {
        match: { event: { sport: true, }, teamA: true, teamB: true }
      },
    });
  }

  async findActiveContestsWithDetails(): Promise<Partial<Contest>[]> {
    this.logger.debug('Finding active contests with details');
    const contests = await this.contestRepository.find({
      where: [{ status: ContestStatus.OPEN }],
      relations: ['match', 'match', 'match.teamA', 'match.teamB', 'Questions', 'match.event', 'match.event.sport'],
    });
    if (!contests.length) {
      return [];
    }

    return contests.map((contest) => ({
      id: contest.id,
      name: contest.name,
      entryFee: contest.entryFee,
      match: contest.match, 
      questions: contest.Questions.slice(0, 3), 
      status: contest.status,
      event: contest.match.event,
      sport: contest.match.event.sport,
    }));
  }
}
