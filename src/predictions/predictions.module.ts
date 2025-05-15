import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity';
import { QuestionsModule } from '../questions/questions.module';
import { ContestsModule } from '../contests/contests.module';
import { User } from 'src/users/entities/users.entity';
import { SolanaModule } from 'src/solana/solana.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, User]), 
    QuestionsModule, 
    forwardRef(() => ContestsModule),
    SolanaModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}