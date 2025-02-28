import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  contestId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}
