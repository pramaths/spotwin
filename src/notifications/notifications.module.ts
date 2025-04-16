import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [UserModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 