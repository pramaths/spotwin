import { IsString } from 'class-validator';

export class UpdateSportDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsString()
  imageUrl?: string;
}
