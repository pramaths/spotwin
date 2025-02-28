import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './entities/bets.entity';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betRepository: Repository<Bet>,
  ) {}

  async create(createBetDto: CreateBetDto): Promise<Bet> {
    // Check if user already has 9 bets for this user contest
    const existingBets = await this.betRepository.count({
      where: {
        userContestId: createBetDto.userContestId,
      },
    });

    if (existingBets >= 9) {
      throw new BadRequestException(
        'User already has maximum number of bets for this contest',
      );
    }

    // Check if position is already taken
    const existingPosition = await this.betRepository.findOne({
      where: {
        userContestId: createBetDto.userContestId,
        position: createBetDto.position,
      },
    });

    if (existingPosition) {
      throw new BadRequestException('Position already taken for this contest');
    }

    const bet = this.betRepository.create(createBetDto);
    return await this.betRepository.save(bet);
  }

  async findAll(): Promise<Bet[]> {
    return await this.betRepository.find({
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
    });
  }

  async findOne(id: string): Promise<Bet> {
    const bet = await this.betRepository.findOne({
      where: { id },
      relations: [
        'userContest',
        'userContest.user',
        'userContest.contest',
        'video',
      ],
    });

    if (!bet) {
      throw new NotFoundException(`Bet with ID ${id} not found`);
    }

    return bet;
  }

  async findByUserContest(userContestId: string): Promise<Bet[]> {
    return await this.betRepository.find({
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

  async update(id: string, updateBetDto: UpdateBetDto): Promise<Bet> {
    const bet = await this.findOne(id);
    Object.assign(bet, updateBetDto);
    return await this.betRepository.save(bet);
  }

  async remove(id: string): Promise<void> {
    const bet = await this.findOne(id);
    await this.betRepository.remove(bet);
  }

  async updateBetResult(id: string, isCorrect: boolean): Promise<Bet> {
    const bet = await this.findOne(id);
    bet.isCorrect = isCorrect;
    return await this.betRepository.save(bet);
  }
}
