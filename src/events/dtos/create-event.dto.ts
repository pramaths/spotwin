import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'World Cup Finals 2024',
    description: 'Title of the event',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'The ultimate football championship event of the year',
    description: 'Detailed description of the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the sport',
  })
  @IsNumber()
  sportId: string;

  @ApiProperty({
    example: '2024-07-01T15:00:00Z',
    description: 'Start date and time of the event',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    example: '2024-07-01T18:00:00Z',
    description: 'End date and time of the event',
  })
  @IsDateString()
  endDate: Date;
}
