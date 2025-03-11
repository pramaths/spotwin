import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoSubmission } from './entities/video-submission.entity';
import { CreateVideoSubmissionDto } from './dto/create-video-submission.dto';
import { UpdateVideoSubmissionDto } from './dto/update-video-submission.dto';
import { S3Service } from '../aws/s3.service';
import { VideoService } from '../aws/video.service';
import { VideoSubmissionStatus } from '../common/enums/common.enum';
import { User } from '../users/entities/users.entity';
import { Contest } from '../contests/entities/contest.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(VideoSubmission)
    private readonly videoSubmissionRepository: Repository<VideoSubmission>,
    private readonly s3Service: S3Service,
    private readonly videoService: VideoService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contest)
    private readonly contestRepository: Repository<Contest>,
  ) {}

  async create(dto: CreateVideoSubmissionDto): Promise<VideoSubmission> {
    try {
      const userExists = await this.userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!userExists) {
        this.logger.error(
          `User with ID ${dto.userId} not found when creating video submission`,
        );
        throw new Error(`User with ID ${dto.userId} not found`);
      }

      const contestExists = await this.contestRepository.findOne({
        where: { id: dto.contestId },
      });

      if (!contestExists) {
        this.logger.error(
          `Contest with ID ${dto.contestId} not found when creating video submission`,
        );
        throw new Error(`Contest with ID ${dto.contestId} not found`);
      }

      this.logger.log(
        `Creating video submission with userId: ${dto.userId}, contestId: ${dto.contestId}`,
      );

      this.logger.debug(`Full submission DTO: ${JSON.stringify(dto)}`);

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
      const thumbnailUrl = await this.videoService.extractThumbnail(
        dto.videoFile,
      );

      const submission = this.videoSubmissionRepository.create({
        videoUrl,
        thumbnailUrl,
        userId: dto.userId,
        contestId: dto.contestId,
        question: dto.question || '',
        status: VideoSubmissionStatus.PENDING, // Default status
      });

      return this.videoSubmissionRepository.save(submission);
    } catch (error) {
      this.logger.error(`Error creating video submission: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  async findOneByUserAndContest(
    userId: string,
    contestId: string,
  ): Promise<VideoSubmission | null> {
    return this.videoSubmissionRepository.findOne({
      where: { userId, contestId },
    });
  }

  async findAll(): Promise<VideoSubmission[]> {
    return this.videoSubmissionRepository.find({
      relations: ['user', 'contest'],
    });
  }

  async findByContestId(contestId: string): Promise<VideoSubmission[]> {
    return this.videoSubmissionRepository.find({
      where: { contestId },
      relations: ['user', 'contest'],
    });
  }

  async findOne(id: string): Promise<VideoSubmission> {
    const submission = await this.videoSubmissionRepository.findOne({
      where: { id },
      relations: ['user', 'contest'],
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
    // Optionally delete files from S3
    await Promise.all([
      this.s3Service.deleteFile(submission.videoUrl),
      this.s3Service.deleteFile(submission.thumbnailUrl),
    ]);
    await this.videoSubmissionRepository.remove(submission);
  }

  async findByUser(userId: string): Promise<any[]> {
    const submissions = await this.videoSubmissionRepository.find({
      where: { userId },
      relations: [
        'user',
        'contest',
        'contest.event',
        'contest.event.teamA',
        'contest.event.teamB',
      ],
    });
    const simplifiedDetails = submissions.map((submission) => ({
      id: submission.id,
      contestId: submission.contestId,
      question: submission.question,
      status: submission.status,
      teams: `${submission.contest.event.teamA.name} VS ${submission.contest.event.teamB.name}`,
      eventImage: submission.contest.event.eventImageUrl,
      eventName: submission.contest.event.title,
      contestName: submission.contest.name,
      username: submission.user.twitterUsername,
      userId: submission.user.id,
    }));
    return simplifiedDetails;
  }
}
