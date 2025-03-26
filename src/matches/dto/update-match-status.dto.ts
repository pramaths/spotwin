import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MatchStatus } from '../../common/enums/common.enum';

export class UpdateMatchStatusDto {
  @ApiProperty({
    description: 'New status for the event',
    enum: MatchStatus,
    example: MatchStatus.OPEN,
    examples: {
      open: {
        value: MatchStatus.OPEN,
        summary: 'Event is scheduled but not yet open for betting/trading',
      },
      closed: {
        value: MatchStatus.CLOSED,
        summary: 'Event is currently happening',
      },
      completed: {
        value: MatchStatus.COMPLETED,
        summary: 'Event has ended, results are finalized',
      },
      cancelled: {
        value: MatchStatus.CANCELLED,
        summary: 'Event got canceled (e.g., rain in cricket)',
      },
    },
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(MatchStatus, { message: 'Invalid event status' })
  status: MatchStatus;
}
