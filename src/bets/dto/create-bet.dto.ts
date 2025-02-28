import { IsEnum, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { OutcomeType } from '../../common/enums/outcome-type.enum';

export class CreateBetDto {
  @IsNotEmpty()
  userContestId: string;

  @IsNotEmpty()
  videoId: string;

  @IsEnum(OutcomeType)
  prediction: OutcomeType;

  @IsNumber()
  @Min(1)
  @Max(9)
  position: number;
}
