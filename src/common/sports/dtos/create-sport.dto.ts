import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSportDto {
  @ApiProperty({ example: 'Football', description: 'Name of the sport' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A team sport played with a spherical ball',
    description: 'Description of the sport',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the sport is active',
    default: true,
  })
  isActive?: boolean;
}
