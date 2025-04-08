import { IsString } from 'class-validator';

export class BuyTicketDto {
  @IsString()
  ticketId: string;
}

