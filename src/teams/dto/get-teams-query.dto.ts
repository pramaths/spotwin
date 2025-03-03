import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetTeamsQueryDto {
  @ApiProperty({
    description: 'Filter teams by name (partial match)',
    required: false,
    example: 'Madrid',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter teams by country (exact match)',
    required: false,
    example: 'Spain',
  })
  @IsOptional()
  @IsString()
  country?: string;
}
