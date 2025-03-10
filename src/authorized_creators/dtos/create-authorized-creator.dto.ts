import { IsString, Length } from 'class-validator';

export class CreateAuthorizedCreatorDto {
  @IsString()
  @Length(44, 44)
  user: string;
}
