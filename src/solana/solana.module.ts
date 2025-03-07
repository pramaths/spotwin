import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SolanaListenerService } from './services/solana-listener.service';
import { UserContestsModule } from '../user-contests/user-contests.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ContestsModule } from '../contests/contests.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    UserContestsModule,
    TransactionsModule,
    ContestsModule,
    UserModule,
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