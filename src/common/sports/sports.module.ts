import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { SportsService } from './sports.service';
import { SportsController } from './sports.controller';
import { S3Module } from 'src/aws/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sport]), S3Module],
  providers: [SportsService],
  controllers: [SportsController],
  exports: [SportsService],
})
export class SportsModule {}
