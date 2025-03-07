import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Event } from '../../events/entities/events.entity';
import { UserContest } from '../../user-contests/entities/user-contest.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Payout } from '../../payouts/entities/payout.entity';
import { ContestStatus } from '../../common/enums/common.enum';

@Entity('contests')
export class Contest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  entryFee: number;

  @Column({
    default: 'SOL',
  })
  currency: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ContestStatus, default: ContestStatus.OPEN })
  status: ContestStatus;

  @Column({ nullable: true })
  solanaContestId: string;

  @ManyToOne(() => Event, (event) => event.contests, { nullable: false })
  event: Event;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => UserContest, (userContest) => userContest.contest)
  userContests: UserContest[];

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.contest)
  leaderboards: Leaderboard[];

  @OneToMany(() => Transaction, (transaction) => transaction.contest)
  transactions: Transaction[];

  @OneToMany(() => Payout, (payout) => payout.contest)
  payouts: Payout[];
}
