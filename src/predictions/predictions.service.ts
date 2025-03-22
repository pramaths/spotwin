import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { ContestStatus } from '../common/enums/common.enum';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
  ) {}

  async create(createPredictionDto: CreatePredictionDto): Promise<Prediction> {
    const existingPredictions = await this.predictionRepository.find({
      where: { 
        userId: createPredictionDto.userId,
        contestId: createPredictionDto.contestId 
      },
    });

    if (existingPredictions.length >= 9) {
      throw new BadRequestException(
        'User already has the maximum number of predictions (9) for this contest',
      );
    }  

    // Check if contest is open
    const contest = existingPredictions[0]?.contest;
    if (contest && contest.status !== ContestStatus.OPEN) {
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

  async findByContestAndUser(contestId: string, userId: string): Promise<Prediction[]> {
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

    if (updatePredictionDto.questionId) {
      const existingPredictions = await this.findByContestAndUser(
        prediction.contestId,
        prediction.userId
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

  async removeByQuestionAndUser(questionId: string, userId: string): Promise<void> {
    console.log('questionId', questionId);
    console.log('userId', userId);
    const prediction = await this.predictionRepository.findOne({
      where: { questionId, userId },
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with question ID ${questionId} not found for user ${userId}`);
    }

    await this.predictionRepository.remove(prediction);
  }
}
