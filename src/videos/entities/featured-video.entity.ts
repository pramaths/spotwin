import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VideoSubmission } from './video-submission.entity';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OutcomeType } from '../../common/enums/outcome-type.enum';

@Entity('featured_videos')
export class FeaturedVideo {
  @ApiProperty({
    description: 'Unique identifier for the featured video',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The ID of the video submission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  submissionId: string;

  @ApiProperty({
    description: 'The video submission entity',
    type: () => VideoSubmission,
  })
  @ManyToOne(() => VideoSubmission)
  @JoinColumn({ name: 'submissionId' })
  submission: VideoSubmission;

  @ApiProperty({
    description: 'The URL of the video file',
    example:
      'https://9shoot-videos.s3.amazonaws.com/videos/123e4567-e89b-12d3-a456-426614174000.mp4',
  })
  @Column()
  videoUrl: string;

  @ApiProperty({
    description: 'The URL of the thumbnail image',
    example:
      'https://9shoot-videos.s3.amazonaws.com/thumbnails/123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  @Column()
  thumbnailUrl: string;

  @ApiProperty({
    description: 'The ID of the user who submitted the video',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The user entity',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the contest this video is featured for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The contest entity',
    type: () => Contest,
  })
  @ManyToOne(() => Contest)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description:
      'The correct outcome of the question associated with this featured video',
    enum: OutcomeType,
    example: OutcomeType.YES,
    nullable: true,
  })
  @Column({ type: 'enum', enum: OutcomeType, nullable: true })
  correctOutcome: OutcomeType;

  @ApiProperty({
    description: 'When the featured video was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the featured video was last updated',
    example: '2023-01-01T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
