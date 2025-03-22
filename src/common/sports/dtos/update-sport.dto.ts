import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSportDto {
  @ApiProperty({
    required: false,
    example: 'Cricket',
    description: 'The name of the sport',
  })
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'image.jpg',
    description: 'URL of the sport image',
  })
  @IsString()
  imageUrl?: string;
}
