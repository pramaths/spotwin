import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateContestDto {
  @IsString()
  @IsOptional()
  entryFee?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
