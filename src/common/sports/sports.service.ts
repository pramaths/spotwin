import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from './entities/sport.entity';
import { CreateSportDto } from './dtos/create-sport.dto';
import { UpdateSportDto } from './dtos/update-sport.dto';
import { S3Service } from '../../aws/s3.service';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createSportDto: CreateSportDto,
    imageFile: Express.Multer.File,
  ): Promise<Sport> {
    if (!imageFile) {
      throw new BadRequestException('Image file is required');
    }
    const imageUrl = await this.s3Service.uploadFile(imageFile);
    const sport = this.sportRepository.create({
      ...createSportDto,
      imageUrl,
    });
    return this.sportRepository.save(sport);
  }

  async findAll(): Promise<Sport[]> {
    return this.sportRepository.find();
  }

  async findOne(id: string): Promise<Sport | undefined> {
    return this.sportRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateSportDto: UpdateSportDto,
    imageFile: Express.Multer.File,
  ): Promise<Sport> {
    const sport = await this.findOne(id);
    if (!sport) {
      throw new NotFoundException('Sport not found');
    }
    if (imageFile) {
      const imageUrl = await this.s3Service.uploadFile(imageFile);
      return this.sportRepository.save({
        ...sport,
        ...updateSportDto,
        imageUrl,
      });
    }
    this.sportRepository.merge(sport, updateSportDto);
    return this.sportRepository.save(sport);
  }

  async remove(id: string): Promise<string> {
    await this.sportRepository.delete(id);
    return 'Sport deleted successfully';
  }
}
