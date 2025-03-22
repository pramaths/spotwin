import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/questions.entity';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { User } from '../../users/entities/users.entity';
import { Contest } from '../../contests/entities/contest.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('predictions')
export class Prediction {
  @ApiProperty({
    description: 'The unique identifier of the prediction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user associated with this prediction',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'The contest associated with this prediction',
    type: () => Contest,
  })
  @ManyToOne(() => Contest)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;

  @ApiProperty({
    description: 'The ID of the contest',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @Column()
  contestId: string;

  @ApiProperty({
    description: 'The video associated with this prediction',
    type: () => Question,
  })
  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @ApiProperty({
    description: 'The ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Column()
  questionId: string;

  @ApiProperty({
    description: 'The prediction outcome (YES or NO)',
    enum: OutcomeType,
    example: OutcomeType.YES,
  })
  @Column({ type: 'enum', enum: OutcomeType })
  prediction: OutcomeType;

  @ApiProperty({
    description: 'Whether the prediction was correct',
    example: true,
    nullable: true,
  })
  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean;

  @ApiProperty({
    description: 'The date when the prediction was created',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the prediction was last updated',
    example: '2023-01-02T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
