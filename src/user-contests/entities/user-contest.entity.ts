import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { Bet } from '../../bets/entities/bets.entity';

@Entity('user_contests')
export class UserContest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userContests)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Contest, (contest) => contest.userContests)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @OneToMany(() => Bet, (bet) => bet.userContest)
  bets: Bet[];

  @Column('decimal', { precision: 10, scale: 2 })
  entryFee: number;

  @CreateDateColumn()
  joinedAt: Date;
}
