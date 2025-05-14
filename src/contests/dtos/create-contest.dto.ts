import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContestDto {
  @ApiProperty({
    description: 'The ID of the match the contest belongs to',
    example: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
  })
  @IsUUID()
  matchId: string;

  @ApiProperty({
    description: 'The name of the contest',
    example: 'Basketball Shootout',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The entry fee of the contest',
    example: 100,
  })
  @IsNumber()
  entryFee: number;

  @ApiProperty({
    description: 'The currency used for the entry fee',
    example: 'USDC',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description : "pool mint",
    example : "B8MjW2X3Y4Z5"
  })
  @IsString()
  poolMint: string;

  @ApiProperty({
    description : "contest id saved in solana",
    example : "B8MjW2X3Y4Z5"
  })
  @IsString()
  contestId: string;

  @ApiProperty({
    description : "contest public key",
    example : "B8MjW2X3Y4Z5"
  })
  @IsString()
  publicKey: string;

}
