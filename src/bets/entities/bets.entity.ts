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

@Entity('bets')
export class Bet {
  @ApiProperty({
    description: 'The unique identifier of the bet',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user contest associated with this bet',
    type: () => UserContest
  })
  @ManyToOne(() => UserContest, (userContest) => userContest.bets)
  @JoinColumn({ name: 'userContestId' })
  userContest: UserContest;

  @ApiProperty({
    description: 'The ID of the user contest',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @Column()
  userContestId: string;

  @ApiProperty({
    description: 'The video associated with this bet',
    type: () => FeaturedVideo
  })
  @ManyToOne(() => FeaturedVideo)
  @JoinColumn({ name: 'videoId' })
  video: FeaturedVideo;

  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @Column()
  videoId: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES
  })
  @Column({ type: 'enum', enum: OutcomeType })
  prediction: OutcomeType;

  @ApiProperty({
    description: 'Whether the prediction was correct',
    example: true,
    nullable: true
  })
  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean;

  @ApiProperty({
    description: 'The position of the bet (1-9)',
    example: 5,
    minimum: 1,
    maximum: 9
  })
  @Column({ type: 'int', default: 0 })
  position: number; // Position 1-9 in the bet slip

  @ApiProperty({
    description: 'The date when the bet was created',
    example: '2023-01-01T00:00:00Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the bet was last updated',
    example: '2023-01-02T00:00:00Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
