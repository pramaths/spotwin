import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from 'src/teams/entities/team.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tickets')
export class Ticket {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440111',
        description: 'Unique identifier for the ticket',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 100,
        description: 'Number of points for the ticket',
    })
    @Column()
    costPoints: number;

    @ApiProperty({
        example: 'Santiago Bernabeu',
        description: 'Stadium where the match will be held',
    })
    @Column()
    stadium: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440222',
        description: 'ID of the first team (Team A)',
    })
    @ManyToOne(() => Team, { eager: true })
    @JoinColumn({ name: 'teamAId' })
    teamA: Team;

    @Column()
    teamAId: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440333',
        description: 'ID of the second team (Team B)',
    })
    @ManyToOne(() => Team, { eager: true })
    @JoinColumn({ name: 'teamBId' })
    teamB: Team;

    @Column()
    teamBId: string;

    @ApiProperty({
        example: '2023-12-25T18:00:00',
        description: 'Date and time of the match',
    })
    @Column()
    matchDateTime: Date;
}
