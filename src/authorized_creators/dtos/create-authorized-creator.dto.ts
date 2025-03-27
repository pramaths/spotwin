import { IsString, Length } from 'class-validator';

export class CreateAuthorizedCreatorDto {
  @IsString()
  @Length(44, 44)
  userId: string;

  @IsString()
  @Length(10, 10)
  phoneNumber: string;
}
