import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedVideo } from './entities/featured-video.entity';
import { VideoSubmission } from './entities/video-submission.entity';
import { CreateFeaturedVideoDto } from './dto/create-featured-video.dto';
import { OutcomeType } from '../common/enums/outcome-type.enum';

@Injectable()
export class FeaturedService {
  constructor(
    @InjectRepository(FeaturedVideo)
    private readonly featuredVideoRepository: Repository<FeaturedVideo>,
    @InjectRepository(VideoSubmission)
    private readonly videoSubmissionRepository: Repository<VideoSubmission>,
  ) {}

  async featureVideo(
    createFeaturedVideoDto: CreateFeaturedVideoDto,
  ): Promise<FeaturedVideo> {
    const { submissionId, contestId, correctOutcome } = createFeaturedVideoDto;

    const featuredCount = await this.featuredVideoRepository.count({
      where: { contestId },
    });

    if (featuredCount >= 30) {
      throw new Error(
        'Maximum limit of 30 featured videos reached for this contest',
      );
    }

    const submission = await this.videoSubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(
        `Video submission with ID ${submissionId} not found`,
      );
    }

    const featuredVideo = this.featuredVideoRepository.create({
      submissionId: submission.id,
      videoUrl: submission.videoUrl,
      thumbnailUrl: submission.thumbnailUrl,
      userId: submission.userId,
      question: submission.question,
      contestId,
      correctOutcome,
    });

    return this.featuredVideoRepository.save(featuredVideo);
  }

  async setOutcome(
    id: string,
    correctOutcome: OutcomeType,
  ): Promise<FeaturedVideo> {
    const featuredVideo = await this.featuredVideoRepository.findOne({
      where: { id },
    });

    if (!featuredVideo) {
      throw new NotFoundException(`Featured video with ID ${id} not found`);
    }

    featuredVideo.correctOutcome = correctOutcome;
    return this.featuredVideoRepository.save(featuredVideo);
  }

  async unfeaturedVideo(id: string): Promise<void> {
    const featuredVideo = await this.featuredVideoRepository.findOne({
      where: { id },
    });

    if (!featuredVideo) {
      throw new NotFoundException(`Featured video with ID ${id} not found`);
    }

    await this.featuredVideoRepository.remove(featuredVideo);
  }

  async getAllFeatured(): Promise<FeaturedVideo[]> {
    return this.featuredVideoRepository.find({
      relations: ['submission', 'user', 'contest'],
    });
  }

  async getFeaturedByContest(contestId: string): Promise<FeaturedVideo[]> {
    return this.featuredVideoRepository.find({
      where: { contestId },
      relations: ['submission', 'user', 'contest'],
    });
  }
}
