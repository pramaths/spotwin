import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Sport } from '../../common/sports/entities/sport.entity';
import { EventStatus } from '../../common/enums/common.enum';
import { Match } from '../../matches/entities/match.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('events')
export class Event {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the event',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'World Cup Finals 2024',
    description: 'Title of the event',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'The ultimate football championship event of the year',
    description: 'Detailed description of the event',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;


  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL to the image of the event',
    required: false,
  })
  @Column()
  eventImageUrl: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Football',
      description: 'Association Football',
    },
    description: 'Sport associated with the event',
  })
  @ManyToOne(() => Sport, (sport) => sport.events, { nullable: false })
  sport: Sport;

  @ApiProperty({
    example: '2024-07-01T15:00:00Z',
    description: 'Start date and time of the event',
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    example: '2024-07-01T18:00:00Z',
    description: 'End date and time of the event',
  })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({
    example: EventStatus.UPCOMING,
    enum: EventStatus,
    description: 'Current status of the event',
  })
  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING })
  status: EventStatus;

  @ApiProperty({
    example: {
      id: '550e8400-e29b-41d4-a716-446655440222',
      name: 'matchname',
    },
    description: 'team names playing in the event',
  })
  @OneToMany(() => Match, (match) => match.event)
  matches: Match[];

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Timestamp when the event was created',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Timestamp when the event was last updated',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

}
