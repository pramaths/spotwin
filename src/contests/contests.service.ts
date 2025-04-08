import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
  Inject,
  forwardRef,
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
import { QuestionLevel } from '../common/enums/common.enum';

@Injectable()
export class ContestsService {
  private readonly logger = new Logger(ContestsService.name);

  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    @Inject(forwardRef(() => PredictionsService))
    private predictionsService: PredictionsService,
    private leaderboardsService: LeaderboardsService,
    private userContestsService: UserContestsService,
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
    this.logger.log(`Starting to resolve contest with ID: ${contestId}`);
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

    this.logger.log(`Found contest: ${JSON.stringify(contest)}`);
    this.logger.log(`Contest has ${contest.userContests?.length || 0} user contests`);

    const questions =
      await this.questionsService.findByContestId(contestId);
    this.logger.log(`Found ${questions.length} questions for contest`);
    
    const answeredQuestions = questions.filter(question => question.outcome !== null);
    this.logger.log(`Found ${answeredQuestions.length} answered questions`);
    
    if (questions.length !== 12 && answeredQuestions.length !== 12)
      throw new BadRequestException(
        'Contest must have exactly 12 questions to resolve and 12 must be answered',
      );

    const questionMap = new Map<string, Question>();
    for (const question of questions) {
      questionMap.set(question.id, question);
    }
    this.logger.log(`Created question map with ${questionMap.size} entries`);
    this.logger.log(`Question map keys: ${Array.from(questionMap.keys())}`);

    const userContests = contest.userContests;
    this.logger.log(`Processing ${userContests.length} user contests`);
    
    const userMap = new Map<string, any>();
    for (const uc of userContests) {
      userMap.set(uc.user.id, uc.user);
    }
    this.logger.log(`Created user map with ${userMap.size} entries`);
    this.logger.log(`User map keys: ${Array.from(userMap.keys())}`);

    const allPredictions = [];
    
    const userPredictions = await this.predictionsService.findByContest(contestId);
    this.logger.log(`Found ${userPredictions.length} predictions for user contest ${contestId}`);
    allPredictions.push(...userPredictions);
  
    this.logger.log(`Total predictions collected: ${allPredictions.length}`);

    // Group predictions by user ID using a Map
    const predictionsByUser = new Map<string, any[]>();
    for (const prediction of allPredictions) {
      if (!predictionsByUser.has(prediction.userId)) {
        predictionsByUser.set(prediction.userId, []);
      }
      predictionsByUser.get(prediction.userId).push(prediction);
    }
    this.logger.log(`Grouped predictions by ${predictionsByUser.size} users`);
    
    for (const [userId, predictions] of predictionsByUser.entries()) {
      this.logger.log(`User ${userId} has ${predictions.length} predictions`);
    }

    const predictionUpdates = [];

    const userScores = [];
    for (const [userId, userPredictions] of predictionsByUser.entries()) {
      this.logger.log(`Processing predictions for user ${userId}`);
      
      if (userPredictions.length !== 9) {
        this.logger.warn(`User ${userId} has ${userPredictions.length} predictions instead of 9 for contest ${contestId}`);
        continue;
      }

      let correctAnswers = 0;
      let tiebreakerScorebySection = {
        [QuestionLevel.EASY]: 0,
        [QuestionLevel.MEDIUM]: 0,
        [QuestionLevel.HARD]: 0,
      };
      let tiebreakScoreBynumberOfBets = 0;
      for (const prediction of userPredictions) {
        this.logger.log(`Checking prediction ${prediction.id} for question ${prediction.questionId}`);
        
        const question = questionMap.get(prediction.questionId);
        if (!question) {
          this.logger.error(`question ${prediction.questionId} not found in question map`);
          throw new NotFoundException(
            `question ${prediction.questionId} not found`,
          );
        }

        const isCorrect = prediction.prediction === question.outcome;
        this.logger.log(`Prediction: ${prediction.prediction}, Outcome: ${question.outcome}, Correct: ${isCorrect}`);

        predictionUpdates.push({
          id: prediction.id,
          isCorrect
        });

        if (isCorrect) {
          correctAnswers++;
          tiebreakerScorebySection[question.difficultyLevel] += 1;
          tiebreakScoreBynumberOfBets +=
            question.numberOfBets > 0 ? 1 / question.numberOfBets : 1;
          this.logger.log(`Correct answer! Score now: ${correctAnswers}, Tiebreaker: ${tiebreakerScorebySection}, Tiebreaker: ${tiebreakScoreBynumberOfBets}`);
        }
      }

      userScores.push({
        userId,
        correctAnswers,
        tiebreakerScorebySection,
        tiebreakScoreBynumberOfBets,
      });
      this.logger.log(`Final score for user ${userId}: ${correctAnswers} correct, ${tiebreakerScorebySection} tiebreaker, ${tiebreakScoreBynumberOfBets} tiebreaker`);
    }
    this.logger.log(`Calculated scores for ${userScores.length} users`);
    this.logger.log(`User scores before sorting: ${JSON.stringify(userScores)}`);

    this.logger.log(`Updating ${predictionUpdates.length} predictions with results`);
    await Promise.all(
      predictionUpdates.map(update =>
        this.predictionsService.updatePredictionResult(update.id, update.isCorrect)
      )
    );
    this.logger.log(`Finished updating prediction results`);

    // Sort users by score and tiebreaker
    userScores.sort((a, b) => {
      if (a.correctAnswers !== b.correctAnswers)
        return b.correctAnswers - a.correctAnswers;
      
      // First tiebreaker: Compare by difficulty level
      if (a.tiebreakerScorebySection[QuestionLevel.HARD] !== b.tiebreakerScorebySection[QuestionLevel.HARD]) {
        return b.tiebreakerScorebySection[QuestionLevel.HARD] - a.tiebreakerScorebySection[QuestionLevel.HARD];
      }
      
      if (a.tiebreakerScorebySection[QuestionLevel.MEDIUM] !== b.tiebreakerScorebySection[QuestionLevel.MEDIUM]) {
        return b.tiebreakerScorebySection[QuestionLevel.MEDIUM] - a.tiebreakerScorebySection[QuestionLevel.MEDIUM];
      }
      
      if (a.tiebreakerScorebySection[QuestionLevel.EASY] !== b.tiebreakerScorebySection[QuestionLevel.EASY]) {
        return b.tiebreakerScorebySection[QuestionLevel.EASY] - a.tiebreakerScorebySection[QuestionLevel.EASY];
      }
      
      return b.tiebreakScoreBynumberOfBets - a.tiebreakScoreBynumberOfBets;
    });
    this.logger.log(`User scores after sorting: ${JSON.stringify(userScores)}`);

    const leaderboardEntries = [];
    let currentRank = 1;
    let prevScore = null;
    let prevTiebreakerHard = null;
    let prevTiebreakerMedium = null;
    let prevTiebreakerEasy = null;
    let prevTiebreakerBets = null;

    for (let i = 0; i < userScores.length; i++) {
      const userScore = userScores[i];

      // Only increment rank if score or any tiebreaker is different
      if (i > 0 &&
        (userScore.correctAnswers !== prevScore ||
         userScore.tiebreakerScorebySection[QuestionLevel.HARD] !== prevTiebreakerHard ||
         userScore.tiebreakerScorebySection[QuestionLevel.MEDIUM] !== prevTiebreakerMedium ||
         userScore.tiebreakerScorebySection[QuestionLevel.EASY] !== prevTiebreakerEasy ||
         userScore.tiebreakScoreBynumberOfBets !== prevTiebreakerBets)) {
        currentRank = i + 1;
        this.logger.log(`Rank changed to ${currentRank} for user ${userScore.userId}`);
      }

      leaderboardEntries.push({
        userId: userScore.userId,
        contestId,
        score: userScore.correctAnswers,
        rank: currentRank,
      });
      this.logger.log(`Created leaderboard entry for user ${userScore.userId}: rank ${currentRank}, score ${userScore.correctAnswers}`);

      prevScore = userScore.correctAnswers;
      prevTiebreakerHard = userScore.tiebreakerScorebySection[QuestionLevel.HARD];
      prevTiebreakerMedium = userScore.tiebreakerScorebySection[QuestionLevel.MEDIUM];
      prevTiebreakerEasy = userScore.tiebreakerScorebySection[QuestionLevel.EASY];
      prevTiebreakerBets = userScore.tiebreakScoreBynumberOfBets;
    }
    this.logger.log(`Created ${leaderboardEntries.length} leaderboard entries`);

    this.logger.log(`Saving leaderboard entries to database`);
    await Promise.all(
      leaderboardEntries.map(entry => this.leaderboardsService.create(entry))
    );
    this.logger.log(`Finished saving leaderboard entries`);

    // Update contest status
    this.logger.log(`Updating contest status to COMPLETED`);
    contest.status = ContestStatus.COMPLETED;
    await this.contestRepository.save(contest);
    this.logger.log(`Contest status updated successfully`);

    this.logger.log(`Contest resolution completed successfully`);
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

  async answerVideo(
    questionId: string,
    contestId: string,
    answer: 'YES' | 'NO',
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
      answer === 'YES' ? OutcomeType.YES : OutcomeType.NO,
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
