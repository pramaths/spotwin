import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SolanaListenerService } from './services/solana-listener.service';
import { BetsModule } from '../bets/bets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ContestsModule } from '../contests/contests.module';
import { UserModule } from '../users/users.module';
import { UserContestsModule } from '../user-contests/user-contests.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contest } from '../contests/entities/contest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest]),
    BetsModule,
    TransactionsModule,
    ContestsModule,
    UserModule,
    UserContestsModule,
  ],
  providers: [SolanaListenerService],
  exports: [SolanaListenerService],
})
export class SolanaModule implements OnApplicationBootstrap {
  constructor(private readonly solanaListenerService: SolanaListenerService) {}

  async onApplicationBootstrap() {
    await this.solanaListenerService.initializeListener();
  }
}
