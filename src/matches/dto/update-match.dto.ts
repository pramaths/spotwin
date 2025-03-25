import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    ValidateNested,
    IsUUID,
    IsEnum,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { CreateContestDto } from '../../contests/dtos/create-contest.dto';
  import { ApiProperty } from '@nestjs/swagger';
  import { EventStatus } from '../../common/enums/common.enum';
  
  export class UpdateMatchDto {
    @ApiProperty({
      example: 'World Cup Finals 2024',
      description: 'Title of the event',
      required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;
  
    @ApiProperty({
      example: 'The ultimate football championship event of the year',
      description: 'Detailed description of the event',
      required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
  
    @ApiProperty({
      example: '2024-07-01T15:00:00Z',
      description: 'Start date and time of the event',
      required: false,
    })
    @IsDateString()
    @IsOptional()
    startDate?: Date;
  
    @ApiProperty({
      example: '2024-07-01T18:00:00Z',
      description: 'End date and time of the event',
      required: false,
    })
    @IsDateString()
    @IsOptional()
    endDate?: Date;
  
    @ApiProperty({
      example: '550e8400-e29b-41d4-a716-446655440111',
      description: 'Unique identifier for the first team (Team A)',
      required: false,
    })
    @IsUUID()
    @IsOptional()
    teamAId?: string;
  
    @ApiProperty({
      example: '550e8400-e29b-41d4-a716-446655440222',
      description: 'Unique identifier for the second team (Team B)',
      required: false,
    })
    @IsUUID()
    @IsOptional()
    teamBId?: string;
  
    @ApiProperty({
      example: EventStatus.UPCOMING,
      enum: EventStatus,
      enumName: 'EventStatus',
      description: 'Current status of the event. Status flow must follow: UPCOMING → LIVE → COMPLETED',
      required: false,
    })
    @IsEnum(EventStatus, {
      message: 'Status must be one of: UPCOMING, LIVE, COMPLETED, CANCELLED',
    })
    @IsOptional()
    status?: EventStatus;
  
    @ValidateNested({ each: true })
    @Type(() => CreateContestDto)
    @IsOptional()
    contests?: CreateContestDto[];
  }
  