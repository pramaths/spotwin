import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
