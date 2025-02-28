import { IsString, IsNumber } from 'class-validator';

export class CreateContestDto {
  @IsNumber()
  eventId: number;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
