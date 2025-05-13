import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PrivyModule } from 'src/privy/privy.module';
import { PrivyService } from 'src/privy/privy.service';

@Module({
  imports: [
    UserModule,
    PrivyModule
  ],
  providers: [AuthService, PrivyService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
