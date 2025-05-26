import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { UserTicket } from './entities/user-ticket.entity';
import { EmailModule } from '../email/email.module';
import { SolanaModule } from 'src/solana/solana.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserTicket]),
    EmailModule,
    SolanaModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
