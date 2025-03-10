import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoSubmission } from './entities/video-submission.entity';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';
import { S3Service } from '../aws/s3.service';
import { VideoService } from '../aws/video.service';
import { VideoSubmissionStatus } from 'src/common/enums/common.enum';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(VideoSubmission)
    private readonly videoSubmissionRepository: Repository<VideoSubmission>,
    private readonly s3Service: S3Service,
    private readonly videoService: VideoService,
  ) {}

  async create(dto: CreateVideoSubmissionDto): Promise<VideoSubmission> {
    if (!dto.contestId) {
      throw new BadRequestException('Contest ID is required');
    }

    if (!dto.userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!dto.question) {
      throw new BadRequestException('Question is required');
    }

    // Upload the video file to S3
    const videoUrl = await this.s3Service.uploadFile(dto.videoFile);
    
    // Extract thumbnail from the video and upload it to S3
    const thumbnailUrl = await this.videoService.extractThumbnail(dto.videoFile);

    const submission = this.videoSubmissionRepository.create({
      videoUrl,
      thumbnailUrl,
      userId: dto.userId,
      contestId: dto.contestId,
      question: dto.question,
      status: VideoSubmissionStatus.PENDING,
    });

    return this.videoSubmissionRepository.save(submission);
  }

  async findAll(): Promise<VideoSubmission[]> {
    return this.videoSubmissionRepository.find({
      relations: ['user', 'contest']
    });
  }

  async findByContestId(contestId: string): Promise<VideoSubmission[]> {
    return this.videoSubmissionRepository.find({
      where: { contestId },
      relations: ['user', 'contest']
    });
  }

  async findOne(id: string): Promise<VideoSubmission> {
    const submission = await this.videoSubmissionRepository.findOne({
      where: { id },
      relations: ['user', 'contest']
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
    
    if (dto.contestId) submission.contestId = dto.contestId;
    if (dto.question) submission.question = dto.question;
    if (dto.status !== undefined) submission.status = dto.status;
    
    return this.videoSubmissionRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    
    // TODO: Consider removing files from S3 as well
    
    await this.videoSubmissionRepository.remove(submission);
  }
}
