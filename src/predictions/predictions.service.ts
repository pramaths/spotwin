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
    // Fetch existing predictions for this user and contest
    const existingPredictions = await this.predictionRepository.find({
      where: { 
        userId: createPredictionDto.userId,
        contestId: createPredictionDto.contestId 
      },
      relations: ['contest'],
    });

    // Check if contest is open
    const contest = existingPredictions[0]?.contest;
    if (contest && contest.status !== ContestStatus.OPEN) {
      throw new BadRequestException(
        'Predictions can only be made while the contest is open',
      );
    }

    // Check maximum predictions (9)
    if (existingPredictions.length >= 9) {
      throw new BadRequestException(
        'User already has the maximum number of predictions (9) for this contest',
      );
    }

    // Check if videoId is already used
    const videoAlreadyPredicted = existingPredictions.some(
      (p) => p.videoId === createPredictionDto.videoId,
    );
    if (videoAlreadyPredicted) {
      throw new BadRequestException(
        'This video has already been predicted on for this contest',
      );
    }

    const prediction = this.predictionRepository.create(createPredictionDto);
    return await this.predictionRepository.save(prediction);
  }

  async findAll(): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      relations: ['user', 'contest', 'video'],
    });
  }

  async findOne(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: ['user', 'contest', 'video'],
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }

    return prediction;
  }

  async findByContest(contestId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { contestId },
      relations: ['user', 'contest', 'video'],
    });
  }

  async findByUser(userId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { userId },
      relations: ['user', 'contest', 'video'],
    });
  }

  async findByContestAndUser(contestId: string, userId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { contestId, userId },
      relations: ['video'],
    });
  }

  async update(
    id: string,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.findOne(id);

    // If updating videoId, validate uniqueness
    if (updatePredictionDto.videoId) {
      const existingPredictions = await this.findByContestAndUser(
        prediction.contestId,
        prediction.userId
      );
      const videoTaken = existingPredictions.some(
        (p) => p.videoId === updatePredictionDto.videoId && p.id !== id,
      );
      if (videoTaken) {
        throw new BadRequestException(
          'This video is already predicted on for this contest',
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
}
