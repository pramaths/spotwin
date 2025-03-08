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
    // Fetch existing predictions for this user contest
    const existingPredictions = await this.predictionRepository.find({
      where: { userContestId: createPredictionDto.userContestId },
      relations: ['userContest', 'userContest.contest'],
    });

    // Check if contest is open
    const contest = existingPredictions[0]?.userContest.contest;
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

    // Check if position is already taken
    const existingPosition = existingPredictions.find(
      (p) => p.position === createPredictionDto.position,
    );
    if (existingPosition) {
      throw new BadRequestException('Position already taken for this contest');
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
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
    });
  }

  async findOne(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }

    return prediction;
  }

  async findByUserContest(userContestId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { userContestId },
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
      order: { position: 'ASC' },
    });
  }

  async update(
    id: string,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.findOne(id);

    // If updating position or videoId, validate uniqueness
    if (updatePredictionDto.position || updatePredictionDto.videoId) {
      const existingPredictions = await this.findByUserContest(
        prediction.userContestId,
      );
      if (updatePredictionDto.position) {
        const positionTaken = existingPredictions.some(
          (p) => p.position === updatePredictionDto.position && p.id !== id,
        );
        if (positionTaken) {
          throw new BadRequestException(
            'Position already taken for this contest',
          );
        }
      }
      if (updatePredictionDto.videoId) {
        const videoTaken = existingPredictions.some(
          (p) => p.videoId === updatePredictionDto.videoId && p.id !== id,
        );
        if (videoTaken) {
          throw new BadRequestException(
            'This video is already predicted on for this contest',
          );
        }
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
