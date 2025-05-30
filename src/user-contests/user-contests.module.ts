import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContestsService } from './user-contests.service';
import { UserContestsController } from './user-contests.controller';
import { UserContest } from './entities/user-contest.entity';
import { Contest } from '../contests/entities/contest.entity';
import { UserStreak } from './entities/user-streak.entity';
import { User } from '../users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserContest, UserStreak, Contest, User]),
  ],
  controllers: [UserContestsController],
  providers: [UserContestsService],
  exports: [UserContestsService],
})
export class UserContestsModule {}
