import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { Contest } from '../../contests/entities/contest.entity';
  import { EventStatus } from '../../common/enums/common.enum';
  import { ApiProperty } from '@nestjs/swagger';
  import { Team } from '../../teams/entities/team.entity';
  import { Event } from '../../events/entities/events.entity';
  
  @Entity('matches')
  export class Match {
    @ApiProperty({
      example: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Unique identifier for the match',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({
      example: 'World Cup Finals 2024',
      description: 'Title of the match',
    })
    @Column()
    title: string;

    @ApiProperty({
      example: '2024-07-01T15:00:00Z',
      description: 'Start date and time of the match',
    })
    @Column({ type: 'timestamp' })
    startTime: Date;
  
    @ApiProperty({
      example: '2024-07-01T18:00:00Z',
      description: 'End date and time of the match',
    })
    @Column({ type: 'timestamp' })
    endTime: Date;
  
    @ApiProperty({
      example: EventStatus.UPCOMING,
      enum: EventStatus,
      description: 'Current status of the match',
    })
    @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING })
    status: EventStatus;
  
    @ApiProperty({
      example: '2024-01-01T12:00:00Z',
      description: 'Timestamp when the match was created',
    })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @ApiProperty({
      example: '2024-01-01T12:00:00Z',
      description: 'Timestamp when the match was last updated',
    })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
  
    @ApiProperty({
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Quarter Finals',
          startDate: '2024-07-01T15:00:00Z',
        },
      ],
      description: 'List of contests within this match',
      type: [Contest],
    })
    @OneToMany(() => Contest, (contest) => contest.match)
    contests: Contest[];
  
    @ApiProperty({
      example: {
        id: '550e8400-e29b-41d4-a716-446655440111',
        name: 'Real Madrid',
        country: 'Spain',
      },
      description: 'First team participating in the match',
    })
    @ManyToOne(() => Team, (team) => team.matchesAsTeamA, { nullable: false })
    teamA: Team;
  
    @ApiProperty({
      example: {
        id: '550e8400-e29b-41d4-a716-446655440222',
        name: 'Barcelona',
        country: 'Spain',
      },
      description: 'Second team participating in the match',
    })
    @ManyToOne(() => Team, (team) => team.matchesAsTeamB, { nullable: false })
    teamB: Team;

    @ApiProperty({
      example: '550e8400-e29b-41d4-a716-446655440333',
      description: 'Unique identifier for the event',
    })
    @ManyToOne(() => Event, (event) => event.matches, { nullable: false })
    event: Event;
  }
