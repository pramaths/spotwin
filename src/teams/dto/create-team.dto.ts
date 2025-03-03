import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    example: 'Real Madrid',
    description: 'Name of the team',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Spain',
    description: 'Country or region the team represents',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;
}
