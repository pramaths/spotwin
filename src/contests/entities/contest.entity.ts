import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/entities/events.entity';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Payout } from '../../payouts/entities/payout.entity';
import { FeaturedVideo } from '../../videos/entities/featured-video.entity';
import { ContestStatus } from '../../common/enums/common.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contests')
export class Contest {
  @ApiProperty({
    description: 'Unique identifier for the contest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The name of the contest',
    example: 'Basketball Shootout 2025',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'The entry fee for the contest (in SOL)',
    example: 0.1,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  entryFee: number;

  @ApiProperty({
    description: 'The currency used for the entry fee',
    example: 'SOL',
  })
  @Column({ default: 'SOL' })
  currency: string;

  @ApiProperty({
    description: 'The description of the contest',
    example: 'A contest to predict basketball shot outcomes.',
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'The status of the contest',
    enum: ContestStatus,
    example: ContestStatus.OPEN,
  })
  @Column({ type: 'enum', enum: ContestStatus, default: ContestStatus.OPEN })
  status: ContestStatus;

  @ApiProperty({
    description: 'The Solana contest ID (on-chain identifier)',
    example: '1',
    nullable: true,
  })
  @Column({ nullable: true })
  solanaContestId: string;

  @ApiProperty({
    description: 'The ID of the selected video for batching (if applicable)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    nullable: true,
  })
  @Column({ nullable: true })
  selectedVideoId: string;

  @ApiProperty({
    description: 'The event associated with the contest',
    type: () => Event,
  })
  @ManyToOne(() => Event, (event) => event.contests, { nullable: false })
  event: Event;

  @ApiProperty({ description: 'The featured videos associated with this contest', type: () => [FeaturedVideo] })
  @OneToMany(() => FeaturedVideo, (featuredVideo) => featuredVideo.contest)
  featuredVideos: FeaturedVideo[];

  @ApiProperty({
    description: 'When the contest was created',
    example: '2025-03-01T00:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'When the contest was last updated',
    example: '2025-03-08T00:00:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'The user contests associated with this contest',
    type: () => [UserContest],
  })
  @OneToMany(() => UserContest, (userContest) => userContest.contest)
  userContests: UserContest[];

  @ApiProperty({
    description: 'The leaderboard entries for this contest',
    type: () => [Leaderboard],
  })
  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.contest)
  leaderboards: Leaderboard[];

  @ApiProperty({
    description: 'The transactions associated with this contest',
    type: () => [Transaction],
  })
  @OneToMany(() => Transaction, (transaction) => transaction.contest)
  transactions: Transaction[];

  @ApiProperty({
    description: 'The payouts associated with this contest',
    type: () => [Payout],
  })
  @OneToMany(() => Payout, (payout) => payout.contest)
  payouts: Payout[];
}
