import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('bets')
export class Bet {
  @ApiProperty({
    description: 'The unique identifier of the bet (contest entry)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The contest associated with this entry',
    type: () => Contest,
  })
  @ManyToOne(() => Contest, (contest) => contest.bets)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The user associated with this entry',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.bets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The transaction associated with this entry',
    type: () => Transaction,
  })
  @ManyToOne(() => Transaction, (transaction) => transaction.bets)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ApiProperty({
    description: 'The ID of the transaction',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column()
  transactionId: string;

  @ApiProperty({
    description: 'The date when the entry was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the entry was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
