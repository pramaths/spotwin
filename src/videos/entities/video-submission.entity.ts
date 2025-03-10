import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contest } from '../../contests/entities/contest.entity';
import { User } from '../../users/entities/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { VideoSubmissionStatus } from '../../common/enums/common.enum'; // Adjust path as needed

@Entity('video_submissions')
export class VideoSubmission {
  @ApiProperty({
    description: 'Unique identifier for the video submission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user who submitted the video',
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
    description: 'The contest ID this video is submitted for',
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
    description: 'The question associated with this video submission',
    example: 'Will this shot go in?',
  })
  @Column()
  question: string;

  @ApiProperty({
    description: 'The status of the video submission',
    enum: VideoSubmissionStatus,
    example: VideoSubmissionStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: VideoSubmissionStatus,
    default: VideoSubmissionStatus.PENDING,
  })
  status: VideoSubmissionStatus;

  @ApiProperty({
    description: 'When the video submission was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the video submission was last updated',
    example: '2023-01-01T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
