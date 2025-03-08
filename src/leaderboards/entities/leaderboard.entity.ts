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
import { Contest } from '../../contests/entities/contest.entity';
import { User } from '../../users/entities/users.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('leaderboards')
@Index(['contestId', 'rank']) // Index for efficient sorting and querying by contest and rank
export class Leaderboard {
  @ApiProperty({
    description: 'Unique identifier for the leaderboard entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The contest associated with this leaderboard entry',
    type: () => Contest,
  })
  @ManyToOne(() => Contest, (contest) => contest.leaderboards, { eager: false })
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The user associated with this leaderboard entry',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.leaderboards, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The score of the user in the contest',
    example: 100,
  })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({
    description: 'The rank of the user in the contest',
    example: 1,
  })
  @Column({ type: 'int' })
  rank: number;

  @ApiProperty({
    description: 'When the leaderboard entry was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the leaderboard entry was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
