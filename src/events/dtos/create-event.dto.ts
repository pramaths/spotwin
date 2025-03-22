import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';
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
    example: '3dc44aff-9748-44fc-aa74-1379213a4363',
    description: 'Unique identifier for the sport',
  })
  @IsString()
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
