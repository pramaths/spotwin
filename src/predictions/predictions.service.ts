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

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
  ) {}

  async create(createPredictionDto: CreatePredictionDto): Promise<Prediction> {
    // Check if user already has 9 predictions for this user contest
    const existingPredictions = await this.predictionRepository.count({
      where: {
        userContestId: createPredictionDto.userContestId,
      },
    });

    if (existingPredictions >= 9) {
      throw new BadRequestException(
        'User already has maximum number of predictions for this contest',
      );
    }

    // Check if position is already taken
    const existingPosition = await this.predictionRepository.findOne({
      where: {
        userContestId: createPredictionDto.userContestId,
        position: createPredictionDto.position,
      },
    });

    if (existingPosition) {
      throw new BadRequestException('Position already taken for this contest');
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
      where: {
        userContestId,
      },
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
      order: {
        position: 'ASC',
      },
    });
  }

  async update(
    id: string,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.findOne(id);
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
