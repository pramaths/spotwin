import { Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Wallet, AnchorProvider } from '@coral-xyz/anchor';   // Wallet *is* exported
import * as bs58 from 'bs58';
import { SpotwinClient } from './sdk';         // adjust path

export class ServerWallet implements Wallet {
    constructor(readonly payer: Keypair) {}
  
    get publicKey() {
      return this.payer.publicKey;
    }
  
    async signTransaction<T extends Transaction | VersionedTransaction>(
      tx: T,
    ): Promise<T> {
      if (tx instanceof Transaction) {
        tx.partialSign(this.payer);          // legacy tx
      } else {
        tx.sign([this.payer]);               // v0 tx
        // or: tx.addSignature(this.publicKey, this.payer.sign(tx.message.serialize()))
      }
      return tx;
    }
  
    async signAllTransactions<T extends Transaction | VersionedTransaction>(
      txs: T[],
    ): Promise<T[]> {
      return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    }
  }


export const SolanaProviders = [
  /* ───── Connection singleton ───── */
  {
    provide: Connection,
    useFactory: () =>
      new Connection(process.env.SOLANA_RPC_URL!, 'confirmed'),
  },
  {
    provide: 'ANCHOR_WALLET',
    useFactory: () => {
      const secret = bs58.decode(process.env.FEE_PAYER_PRIVATE_KEY!);
      return new Wallet(Keypair.fromSecretKey(secret));
    },
  },
  {
    provide: SpotwinClient,
    useFactory: (wallet: Wallet, connection: Connection) => 
      new SpotwinClient(wallet, connection),
    inject: ['ANCHOR_WALLET', Connection],
  },
];
