import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContestDto {
  @ApiProperty({
    description: 'The ID of the event the contest belongs to',
    example: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    description: 'The name of the contest',
    example: 'Basketball Shootout',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the contest',
    example: 'A contest where two teams compete against each other in basketball',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The entry fee of the contest',
    example: 100,
  })
  @IsNumber()
  entryFee: number;

  @ApiProperty({
    description: 'The Solana contest ID (optional, for on-chain reference)',
    example: '1',
  })
  @IsString()
  @IsOptional()
  solanaContestId?: string;

  @ApiProperty({
    description: 'The Solana contest public key (PDA)',
    example: '5Xb...xyz',
    required: false,
  })
  @IsString()
  @IsOptional()
  contestPublicKey?: string;

  @ApiProperty({
    description: 'The creator of the contest',
    example: '5Xb...xyz',
    required: false,
  })
  @IsString()
  @IsOptional()
  contestCreator?: string;
}
