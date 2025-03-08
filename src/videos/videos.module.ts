import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { FeaturedController } from './featured.controller';
import { FeaturedService } from './featured.service';
import { VideoSubmission } from './entities/video-submission.entity';
import { FeaturedVideo } from './entities/featured-video.entity';
import { S3Module } from '../aws/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoSubmission, FeaturedVideo]),
    ConfigModule,
    S3Module,
  ],
  controllers: [SubmissionController, FeaturedController],
  providers: [SubmissionService, FeaturedService],
  exports: [FeaturedService],
})
export class VideosModule {}
