import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { ContestStatus } from '../../common/enums/common.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContestDto {
  @ApiProperty({
    description: "The entry fee of the contest",
    example: 100,
    required: false
  })
  @IsNumber()
  @IsOptional()
  entryFee?: number;

  @ApiProperty({
    description: "The name of the contest",
    example: "Basketball Shootout",
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "The status of the contest",
    enum: ContestStatus,
    example: ContestStatus.OPEN,
    required: false
  })
  @IsEnum(ContestStatus)
  @IsOptional()
  status?: ContestStatus;

  @ApiProperty({
    description: "The ID of the match the contest belongs to",
    example: "077e38f3-6275-4c68-920f-3a7de8ba9bbf",
    required: false
  })
  @IsUUID()
  @IsOptional()
  matchId?: string;
}
