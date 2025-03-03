import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiProperty({
    example: 'FC Barcelona',
    description: 'Updated name of the team',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'https://example.com/updated_logo.png',
    description: 'Updated URL of the team logo',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'Italy',
    description: 'Updated country or region the team represents',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;
}
