import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contest } from '../../contests/entities/contest.entity';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { QuestionLevel } from '../../common/enums/common.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('questions')
export class Question {
  @ApiProperty({
    description: 'The ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The question text',
    example: 'Will the stock price of Tesla increase in the next 30 days?',
  })  
  @Column()
  question: string;

  @ApiProperty({
    description: 'The outcome of the question',
    enum: OutcomeType,
    example: OutcomeType.YES,
  })
  @Column({ nullable: true, default: null })
  outcome: OutcomeType | null;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The difficulty level of the question',
    enum: QuestionLevel,
    example: QuestionLevel.EASY,
  })
  @Column()
  difficultyLevel: QuestionLevel;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174002',
    type: () => Contest,
  })
  @ManyToOne(() => Contest)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description: "special question",
    example: false,
  })
  @Column({ default: false })
  specialQuestion: boolean;

  @ApiProperty({
    description: 'The number of bets on the question',
    example: 100,
  })
  @Column({ default: 0 })
  numberOfBets: number;

  @Column({default: 0})
  contestOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

