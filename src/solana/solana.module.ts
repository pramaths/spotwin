import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SolanaListenerService } from './services/solana-listener.service';

@Module({
  providers: [SolanaListenerService],
  exports: [SolanaListenerService],
})
export class SolanaModule implements OnApplicationBootstrap {
  constructor(private readonly solanaListenerService: SolanaListenerService) {}

  async onApplicationBootstrap() {
    await this.solanaListenerService.initializeListener();
  }
}