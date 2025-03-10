import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Payout } from '../../payouts/entities/payout.entity';
import { Bet } from '../../bets/entities/bets.entity';
import { UserStreak } from '../../user-contests/entities/user-streak.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true, nullable: true})
  didToken: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  twitterUsername: string;

  @Column({ unique: true })
  publicAddress: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  totalContests: number;

  @Column({ nullable: true })
  totalContestsWon: number;

  @OneToMany(() => UserContest, (userContest) => userContest.user)
  userContests: UserContest[];

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.user)
  leaderboards: Leaderboard[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Payout, (payout) => payout.user)
  payouts: Payout[];

  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];

  @OneToMany(() => UserStreak, (streak) => streak.user)
  streaks: UserStreak[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
