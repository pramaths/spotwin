import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  contestId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}
