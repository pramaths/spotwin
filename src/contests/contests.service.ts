import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest } from './entities/contest.entity';
import { CreateContestDto } from './dtos/create-contest.dto';
import { EventsService } from '../events/events.service';
import { UpdateContestDto } from './dtos/update-contest.dto';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    private eventsService: EventsService,
  ) {}

  async createContest(
    eventId: string,
    createContestDto: CreateContestDto,
  ): Promise<Contest> {
    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const contest = this.contestRepository.create({
      ...createContestDto,
      event,
    });

    return this.contestRepository.save(contest);
  }

  async findAll() {
    return await this.contestRepository.find();
  }

  async findOne(id: string) {
    const contest = await this.contestRepository.findOne({ where: { id } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }
    return contest;
  }

  async update(id: string, updateContestDto: UpdateContestDto) {
    const contest = await this.contestRepository.findOne({ where: { id } });
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }
    return this.contestRepository.save({ ...contest, ...updateContestDto });
  }

  async remove(id: string) {
    const result = await this.contestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }
  }
}
