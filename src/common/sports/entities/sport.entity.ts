import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from '../../../events/entities/events.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sports')
export class Sport {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Football', description: 'Name of the sport' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'A team sport played with a spherical ball',
    description: 'Description of the sport',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/football.jpg',
    description: 'URL to the sport image',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({
    example: true,
    description: 'Whether the sport is active',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: () => Event,
    isArray: true,
    description: 'Events related to this sport',
  })
  @OneToMany(() => Event, (event) => event.sport)
  events: Event[];

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
