import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { ContestStatus } from '../common/enums/common.enum';
import { QuestionsService } from '../questions/questions.service';
import { ContestsService } from '../contests/contests.service';
import { SpotwinClient } from 'src/solana/sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { Wallet } from '@coral-xyz/anchor';
import { User } from 'src/users/entities/users.entity';
import { OutcomeType } from 'src/common/enums/outcome-type.enum';
import { BN } from 'bn.js';

@Injectable()
export class PredictionsService {

  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private questionsService: QuestionsService,
    @Inject(forwardRef(() => ContestsService))
    private contestsService: ContestsService,
    private readonly spotwinClient: SpotwinClient,
  ) { }

  async create(createPredictionDto: CreatePredictionDto): Promise<Prediction> {
    const existingPredictions = await this.predictionRepository.find({
      where: {
        userId: createPredictionDto.userId,
        contestId: createPredictionDto.contestId,
      },
      relations: ['contest'],
    });

    if (existingPredictions.length >= 9) {
      throw new BadRequestException(
        'User already has the maximum number of predictions (9) for this contest',
      );
    }
    const contest = existingPredictions[0]?.contest;
    if (contest && contest.status !== ContestStatus.OPEN) {
      if (contest.match.startTime < new Date()) {
        await this.contestsService.update(contest.id, {
          status: ContestStatus.COMPLETED,
        });
      }
      throw new BadRequestException(
        'Predictions can only be made while the contest is open',
      );
    }

    const questionAlreadyPredicted = existingPredictions.some(
      (p) => p.questionId === createPredictionDto.questionId,
    );
    if (questionAlreadyPredicted) {
      throw new BadRequestException(
        'This question has already been predicted on for this contest',
      );
    }

    const prediction = this.predictionRepository.create(createPredictionDto);
    await this.questionsService.updateNumberOfPredictions(
      createPredictionDto.questionId,
      1,
    );
    return await this.predictionRepository.save(prediction);
  }

  async findAll(): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      relations: ['user', 'contest', 'question'],
    });
  }

  async findOne(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: ['user', 'contest', 'question'],
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }

    return prediction;
  }

  async findByContest(contestId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { contestId },
      relations: ['user', 'contest', 'question'],
    });
  }

  async findByUser(userId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { userId },
      relations: ['user', 'contest', 'question'],
    });
  }

  async findByContestAndUser(
    contestId: string,
    userId: string,
  ): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { contestId, userId },
      relations: ['question'],
    });
  }

  async update(
    id: string,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.findOne(id);
    if (prediction.contest.status !== ContestStatus.OPEN) {
      if(prediction.contest.match.startTime < new Date()){
        await this.contestsService.update(prediction.contestId, {
          status: ContestStatus.COMPLETED,
        });
      }
      throw new BadRequestException('Contest is not open');
    }
    if (updatePredictionDto.questionId) {
      const existingPredictions = await this.findByContestAndUser(
        prediction.contestId,
        prediction.userId,
      );
      const questionTaken = existingPredictions.some(
        (p) => p.questionId === updatePredictionDto.questionId && p.id !== id,
      );
      if (questionTaken) {
        throw new BadRequestException(
          'This question is already predicted on for this contest',
        );
      }
    }

    Object.assign(prediction, updatePredictionDto);
    return await this.predictionRepository.save(prediction);
  }

  async remove(id: string): Promise<void> {
    const prediction = await this.findOne(id);
    await this.predictionRepository.remove(prediction);
  }

  async updatePredictionResult(
    id: string,
    isCorrect: boolean,
  ): Promise<Prediction> {
    const prediction = await this.findOne(id);
    prediction.isCorrect = isCorrect;
    return await this.predictionRepository.save(prediction);
  }

  async removeByQuestionAndUser(
    questionId: string,
    userId: string,
  ): Promise<void> {

    const prediction = await this.predictionRepository.findOne({
      where: { questionId, userId },
    });

    if (!prediction) {
      throw new NotFoundException(
        `Prediction with question ID ${questionId} not found for user ${userId}`,
      );
    }

    await this.predictionRepository.remove(prediction);
    await this.questionsService.updateNumberOfPredictions(questionId, -1);
  }

  async submitPredictiontoOnchain(user: any, contestId: string): Promise<void> {
    const contest = await this.contestsService.findOne(contestId);
    const dbUser = await this.userRepository.findOne({ where: { privyId: user.userId } });
    const predictions = await this.findByContestAndUser(contestId, dbUser.id);
    const questions = await this.questionsService.getQuestionsByContestId(contestId);
    questions.sort((a, b) => a.contestOrder - b.contestOrder);

    const predMap = new Map<string, Prediction>();
    predictions.forEach(p => predMap.set(p.questionId.toString(), p));

    const numQuestions = questions.length; 
    const REQUIRED_ATTEMPTS = 9;
    let attemptMask = 0;
    let answerMask  = 0;
    questions.forEach((q, idx) => {
      const p = predMap.get(q.id.toString());
      if (p) {
        // mark this question as attempted
        attemptMask |= (1 << idx);
        // if their answer is “yes” (1), set the answer bit
        if (p.prediction === OutcomeType.YES) {
          answerMask |= (1 << idx);
        }
      }
    });
    console.log("attemptMask", attemptMask);
    console.log("answerMask", answerMask);

    const attemptedCount = attemptMask
      .toString(2)
      .split('')
      .filter(bit => bit === '1').length;

    if (attemptedCount !== REQUIRED_ATTEMPTS) {
      throw new BadRequestException(
        `You must attempt exactly ${REQUIRED_ATTEMPTS} questions, but attempted ${attemptedCount}.`
      );
    }

    // 5. Log padded 15-bit binary masks for debugging
    console.log(
      'attemptMask (binary):',
      attemptMask.toString(2).padStart(numQuestions, '0')
    );
    console.log(
      'answerMask  (binary):',
      answerMask.toString(2).padStart(numQuestions, '0')
    );

    const updateAnswers = this.spotwinClient.updateAnswers(
      new BN(contest.contestId),
      attemptMask,
      answerMask,
      new PublicKey(dbUser.walletAddress),
    );
    console.log("updateAnswers",updateAnswers)
   return; 
  }
    
}
