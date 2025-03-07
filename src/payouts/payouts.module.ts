import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { Payout } from './entities/payout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout])],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
