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
    // Check if user already has an entry for this contest
    const existingBet = await this.betRepository.findOne({
      where: {
        userId: createBetDto.userId,
        contestId: createBetDto.contestId,
      },
    });

    if (existingBet) {
      throw new BadRequestException('User already entered this contest');
    }

    const bet = this.betRepository.create(createBetDto);
    return await this.betRepository.save(bet);
  }

  async findAll(): Promise<Bet[]> {
    return await this.betRepository.find({
      relations: ['user', 'contest', 'transaction'],
    });
  }

  async findOne(id: string): Promise<Bet> {
    const bet = await this.betRepository.findOne({
      where: { id },
      relations: ['user', 'contest', 'transaction'],
    });

    if (!bet) {
      throw new NotFoundException(`Contest entry with ID ${id} not found`);
    }

    return bet;
  }

  async findByUser(userId: string): Promise<Bet[]> {
    return await this.betRepository.find({
      where: { userId },
      relations: ['contest', 'transaction'],
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
}
