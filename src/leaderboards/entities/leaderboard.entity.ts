import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Contest } from '../../contests/entities/contest.entity';
import { User } from '../../users/entities/users.entity';

@Entity('leaderboards')
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contest, (contest) => contest.leaderboards)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ManyToOne(() => User, (user) => user.leaderboards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 0 })
  score: number;

  @Column()
  rank: number;

  @CreateDateColumn()
  createdAt: Date;
}
