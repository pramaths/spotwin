import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContestDto } from '../../contests/dtos/create-contest.dto';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  sportId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ValidateNested({ each: true })
  @Type(() => CreateContestDto)
  @IsOptional()
  contests?: CreateContestDto[];
}
