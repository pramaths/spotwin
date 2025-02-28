import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContestDto {
  @ApiProperty({
    description: 'The ID of the event the contest belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNumber()
  eventId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
