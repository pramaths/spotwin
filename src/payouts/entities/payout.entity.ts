import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.payouts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Contest, (contest) => contest.payouts)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.payouts)
  @JoinColumn({
    name: 'transactionHash',
    referencedColumnName: 'transactionHash',
  })
  transaction: Transaction;

  @Column({ unique: true })
  transactionHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
