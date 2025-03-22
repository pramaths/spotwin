import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizedCreator } from './entities/authorized-creator.entity';
import { CreateAuthorizedCreatorDto } from './dtos/create-authorized-creator.dto';

@Injectable()
export class AuthorizedCreatorsService {
  constructor(
    @InjectRepository(AuthorizedCreator)
    private authorizedCreatorRepository: Repository<AuthorizedCreator>,
  ) {}

  async getAuthorizedCreators(): Promise<AuthorizedCreator[]> {
    return await this.authorizedCreatorRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async addAuthorizedCreator(
    createDto: CreateAuthorizedCreatorDto,
  ): Promise<AuthorizedCreator> {
    const creator = new AuthorizedCreator();
    creator.userId = createDto.userId;

    try {
      return await this.authorizedCreatorRepository.save(creator);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Creator already exists');
      }
      throw error;
    }
  }

  async removeAuthorizedCreator(userId: string): Promise<void> {
    const result = await this.authorizedCreatorRepository.delete({ userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Creator with address ${userId} not found`);
    }
  }
}
