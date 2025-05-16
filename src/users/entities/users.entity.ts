import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Payout } from '../../payouts/entities/payout.entity';
import { Bet } from '../../bets/entities/bets.entity';
import { UserStreak } from '../../user-contests/entities/user-streak.entity';
import { UserTicket } from './user-ticket.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({unique:true})
  privyId: string;

  @Column({ unique: true })
  email: string;

  @Column({unique:true})
  walletAddress: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  imageUrl: string;

  @Column({default: 0})
  stakedAmount: number;

  @Column({ nullable: true, default: 0 })
  totalContests: number;

  @Column({ nullable: true, default: 0 })
  totalContestsWon: number;

  @Column({ nullable: true })
  expoPushToken: string;

  @Column({ default: false })
  isReferralCodeUsed : boolean;

  @Column({ nullable: true, unique: true })
  referralCode: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @Column({ nullable: true })
  referrerId: string;

  @OneToMany(() => User, user => user.referrer)
  referrals: User[];

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

  @OneToMany(() => UserTicket, (ut) => ut.user)
  userTickets: UserTicket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
