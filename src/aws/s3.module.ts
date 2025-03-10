import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { VideoService } from './video.service';

// @Global() // Available globally
@Module({
  providers: [S3Service, VideoService],
  exports: [S3Service, VideoService],
})
export class S3Module {}
