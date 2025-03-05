import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventStatus } from '../../common/enums/common.enum';

export class UpdateEventStatusDto {
  @ApiProperty({
    description: 'New status for the event',
    enum: EventStatus,
    example: EventStatus.LIVE,
    examples: {
      upcoming: {
        value: EventStatus.UPCOMING,
        summary: 'Event is scheduled but not yet open for betting/trading',
      },
      open: {
        value: EventStatus.OPEN,
        summary: 'Event is open for trading (e.g., 2 days before the match)',
      },
      live: {
        value: EventStatus.LIVE,
        summary: 'Event is currently happening',
      },
      completed: {
        value: EventStatus.COMPLETED,
        summary: 'Event has ended, results are finalized',
      },
      cancelled: {
        value: EventStatus.CANCELLED,
        summary: 'Event got canceled (e.g., rain in cricket)',
      },
      suspended: {
        value: EventStatus.SUSPENDED,
        summary: 'Temporarily paused (e.g., technical issues, review delays)',
      },
    },
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(EventStatus, { message: 'Invalid event status' })
  status: EventStatus;
}
