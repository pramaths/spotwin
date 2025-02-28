import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContestsService } from './user-contests.service';
import { UserContestsController } from './user-contests.controller';
import { UserContest } from './entities/user-contest.entity';
import { Contest } from '../contests/entities/contest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserContest, Contest])],
  controllers: [UserContestsController],
  providers: [UserContestsService],
  exports: [UserContestsService],
})
export class UserContestsModule {}
