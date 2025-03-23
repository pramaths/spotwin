import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Payout } from '../../payouts/entities/payout.entity';
import { ContestStatus } from '../../common/enums/common.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../../questions/entities/questions.entity';
import { Bet } from '../../bets/entities/bets.entity';

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
    example: 'INR',
  })
  @Column({ default: 'INR' })
  currency: string;

  @ApiProperty({
    description: 'The status of the contest',
    enum: ContestStatus,
    example: ContestStatus.OPEN,
  })
  @Column({ type: 'enum', enum: ContestStatus, default: ContestStatus.OPEN })
  status: ContestStatus;
  
  @ApiProperty({
    description: 'The match associated with the contest',
    type: () => Match,
  })
  @ManyToOne(() => Match, (match) => match.contests, { nullable: true })
  match: Match;

  @ApiProperty({ description: 'The featured videos associated with this contest', type: () => [Question] })
  @OneToMany(() => Question, (Question) => Question.contest)
  Questions: Question[];

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

  @ApiProperty({
    description: 'The bets associated with this contest',
    type: () => [Bet],
  })
  @OneToMany(() => Bet, (bet) => bet.contest)
  bets: Bet[];
}
