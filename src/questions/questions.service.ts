import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/questions.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { OutcomeType } from '../common/enums/outcome-type.enum';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    try {
      const existingCount = await this.questionRepository.count({
        where: { contestId: createQuestionDto.contestId }
      });
      const payload = {
        ...createQuestionDto,
        contestOrder: existingCount,
      };
    const question = this.questionRepository.create(payload);
    return this.questionRepository.save(question);
  } catch (error) {
    console.log(error);
    return null;
  }
}

  async findOne(id: string): Promise<Question> {
    return this.questionRepository.findOne({ where: { id } });
  }
  
  async findByContestId(contestId: string): Promise<Question[]> {
    return this.questionRepository.find({ where: { contestId } });
  }

  async getFeaturedByContest(contestId: string): Promise<Question[]> {
    return this.questionRepository.find({ where: { contestId } });
  }

  async setOutcome(questionId: string, outcome: OutcomeType): Promise<Question> {
    const question = await this.findOne(questionId);
    question.outcome = outcome;
    return this.questionRepository.save(question);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);
    Object.assign(question, updateQuestionDto);
    return this.questionRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    await this.questionRepository.delete(id);
  }

  async getQuestionsByContestId(contestId: string): Promise<Question[]> {
    try {
    const questions = await this.questionRepository.find({ where: { contestId } });
    return questions;
  } catch (error) {
    console.log(error);
    return [];
  }
}

  async updateNumberOfPredictions(questionId: string, value: number): Promise<Question> {
    const question = await this.findOne(questionId);
    question.numberOfBets+= value;
    return this.questionRepository.save(question);
  }
}
