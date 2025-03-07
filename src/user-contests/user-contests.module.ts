import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContestsService } from './user-contests.service';
import { UserContestsController } from './user-contests.controller';
import { UserContest } from './entities/user-contest.entity';
import { Contest } from '../contests/entities/contest.entity';
import { BetsModule } from '../bets/bets.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserContest, Contest]),
    BetsModule,
    TransactionsModule,
  ],
  controllers: [UserContestsController],
  providers: [UserContestsService],
  exports: [UserContestsService],
})
export class UserContestsModule {}
