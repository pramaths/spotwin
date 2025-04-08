import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity';
import { QuestionsModule } from '../questions/questions.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction]), 
    QuestionsModule, 
    forwardRef(() => ContestsModule)
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}