import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeaturedVideo } from '../../videos/entities/featured-video.entity';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('predictions')
export class Prediction {
  @ApiProperty({
    description: 'The unique identifier of the prediction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user contest associated with this prediction',
    type: () => UserContest,
  })
  @ManyToOne(() => UserContest, (userContest) => userContest.predictions)
  @JoinColumn({ name: 'userContestId' })
  userContest: UserContest;

  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column()
  userContestId: string;

  @ApiProperty({
    description: 'The video associated with this prediction',
    type: () => FeaturedVideo,
  })
  @ManyToOne(() => FeaturedVideo)
  @JoinColumn({ name: 'videoId' })
  video: FeaturedVideo;

  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column()
  videoId: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES,
  })
  @Column({ type: 'enum', enum: OutcomeType })
  prediction: OutcomeType;

  @ApiProperty({
    description: 'Whether the prediction was correct',
    example: true,
    nullable: true,
  })
  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean;

  @ApiProperty({
    description: 'The position of the prediction (1-9)',
    example: 5,
    minimum: 1,
    maximum: 9,
  })
  @Column({ type: 'int', default: 0 })
  position: number;

  @ApiProperty({
    description: 'The date when the prediction was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the prediction was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
