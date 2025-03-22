import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('teams')
export class Team {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440111',
    description: 'Unique identifier for the team',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Real Madrid',
    description: 'Name of the team',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'https://example.com/team_logo.png',
    description: 'URL of the team logo',
    required: false,
  })
  @Column({ nullable: true })
  imageUrl?: string;

  @ApiProperty({
    example: 'Spain',
    description: 'Country or region the team represents',
  })
  @Column({ nullable: true })
  country?: string;

  @OneToMany(() => Match, (match) => match.teamA)
  matchesAsTeamA: Match[];

  @OneToMany(() => Match, (match) => match.teamB)
  matchesAsTeamB: Match[];
}
