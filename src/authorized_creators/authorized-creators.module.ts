import { Module } from '@nestjs/common';
import { AuthorizedCreatorsController } from './authorized-creators.controller';
import { AuthorizedCreatorsService } from './authorized-creators.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizedCreator } from './entities/authorized-creator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorizedCreator])],
  controllers: [AuthorizedCreatorsController],
  providers: [AuthorizedCreatorsService],
})
export class AuthorizedCreatorsModule {}
