import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from './entities/sport.entity';
import { CreateSportDto } from './dtos/create-sport.dto';
import { UpdateSportDto } from './dtos/update-sport.dto';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
  ) {}

  async create(createSportDto: CreateSportDto): Promise<Sport> {
    const sport = this.sportRepository.create(createSportDto);
    return this.sportRepository.save(sport);
  }

  async findAll(): Promise<Sport[]> {
    return this.sportRepository.find();
  }

  async findOne(id: string): Promise<Sport | undefined> {
    return this.sportRepository.findOne({ where: { id } });
  }

  async update(id: string, updateSportDto: UpdateSportDto): Promise<Sport> {
    const sport = await this.findOne(id);
    if (!sport) {
      throw new NotFoundException('Sport not found');
    }
    this.sportRepository.merge(sport, updateSportDto);
    return this.sportRepository.save(sport);
  }

  async remove(id: string): Promise<string> {
    await this.sportRepository.delete(id);
    return 'Sport deleted successfully';
  }
}
