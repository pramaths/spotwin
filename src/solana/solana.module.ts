import { Module } from '@nestjs/common';
import { SolanaProviders } from './solana.provider';

@Module({
  providers: [...SolanaProviders],
  exports:   [...SolanaProviders],
})
export class SolanaModule {}
