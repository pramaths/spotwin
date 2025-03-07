import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('payouts')
@Index(['userId', 'contestId']) // Index for efficient querying
export class Payout {
  @ApiProperty({
    description: 'Unique identifier for the payout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user receiving the payout',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.payouts, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The contest associated with the payout',
    type: () => Contest,
  })
  @ManyToOne(() => Contest, (contest) => contest.payouts, { eager: false })
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The amount of the payout',
    example: 50.0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'The transaction associated with the payout',
    type: () => Transaction,
  })
  @ManyToOne(() => Transaction, (transaction) => transaction.payouts, { eager: false })
  @JoinColumn({
    name: 'transactionHash',
    referencedColumnName: 'transactionHash',
  })
  transaction: Transaction;

  @ApiProperty({
    description: 'The transaction hash of the on-chain payout transaction',
    example: '5x8y...',
  })
  @Column({ unique: true })
  transactionHash: string;

  @ApiProperty({
    description: 'When the payout was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the payout was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
