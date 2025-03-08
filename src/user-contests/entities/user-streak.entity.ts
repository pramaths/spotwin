import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_streaks')
export class UserStreak {
  @ApiProperty({
    description: 'Unique identifier for the user streak',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The user associated with this streak',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.streaks, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description:
      'The current streak count (consecutive days of joining contests)',
    example: 3,
  })
  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @ApiProperty({
    description: 'The highest streak achieved by the user',
    example: 5,
  })
  @Column({ type: 'int', default: 0 })
  highestStreak: number;

  @ApiProperty({
    description:
      'The date of the last contest joined (used to calculate streak)',
    example: '2025-03-08T00:00:00Z',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  lastJoinedDate: Date;

  @ApiProperty({
    description: 'When the streak record was created',
    example: '2025-03-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the streak record was last updated',
    example: '2025-03-08T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
