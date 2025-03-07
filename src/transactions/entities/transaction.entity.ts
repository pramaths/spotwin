import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { Payout } from '../../payouts/entities/payout.entity';
import { Bet } from '../../bets/entities/bets.entity';

@Entity('transactions')
export class Transaction {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Transaction amount', example: 100.5 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Contest entry fee',
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Transaction date',
    example: '2023-04-15T10:30:00Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ApiProperty({ description: 'Transaction status', example: 'completed' })
  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => Contest, (contest) => contest.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @Column({ nullable: true })
  @Index()
  contestId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-04-15T10:30:00Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-04-15T10:30:00Z',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ unique: true })
  transactionHash: string;

  @OneToMany(() => Payout, (payout) => payout.transaction)
  payouts: Payout[];

  @OneToMany(() => Bet, (bet) => bet.transaction) // Add this line
  bets: Bet[];
}
