import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoSubmission } from './entities/video-submission.entity';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';
import { S3Service } from '../aws/s3.service';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(VideoSubmission)
    private readonly videoSubmissionRepository: Repository<VideoSubmission>,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateVideoSubmissionDto): Promise<VideoSubmission> {
    // Upload video and thumbnail to S3
    const videoUrl = await this.s3Service.uploadFile(dto.videoFile);
    const thumbnailUrl = await this.s3Service.uploadFile(dto.thumbnailFile);

    const submission = this.videoSubmissionRepository.create({
      title: dto.title,
      description: dto.description,
      videoUrl,
      thumbnailUrl,
      userId: dto.userId,
    });

    return this.videoSubmissionRepository.save(submission);
  }

  async findAll(): Promise<VideoSubmission[]> {
    return this.videoSubmissionRepository.find();
  }

  async findOne(id: string): Promise<VideoSubmission> {
    const submission = await this.videoSubmissionRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException(`Video submission with ID ${id} not found`);
    }
    return submission;
  }

  async update(
    id: string,
    dto: UpdateVideoSubmissionDto,
  ): Promise<VideoSubmission> {
    const submission = await this.findOne(id);
    Object.assign(submission, dto);
    return this.videoSubmissionRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.videoSubmissionRepository.remove(submission);
  }
}
