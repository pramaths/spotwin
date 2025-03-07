import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { ConfigService } from '@nestjs/config';
import Shoot9SDK from '../program/contract_sdk'; // Adjusted import path
import IDL from '../program/shoot_9_solana.json'; // Adjusted import path
import { Shoot9Solana } from '../program/shoot_9_solana'; // Adjusted import path
import { getKeypairFromFile } from '@solana-developers/helpers';

@Injectable()
export class SolanaListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SolanaListenerService.name);
  private connection: Connection;
  private program: Program<Shoot9Solana>;
  private sdk: Shoot9SDK;
  private isListening = false;
  private processedTxs = new Set<string>(); // For deduplication

  constructor(private configService: ConfigService) {
    this.connection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.devnet.solana.com',
      'confirmed',
    );
    // SDK initialization deferred to initializeSolanaProgram
  }

  async onModuleInit() {
    await this.initializeSolanaProgram();
    await this.initializeListener();
  }

  async onModuleDestroy() {
    await this.stopListening();
  }

  private async initializeSolanaProgram() {
    try {
      const keypair = await getKeypairFromFile(
        '/home/ritikbhatt020/.config/solana/id.json',
      );
      const wallet = new Wallet(keypair);
      const provider = new AnchorProvider(this.connection, wallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });

      // Initialize the SDK with the wallet
      this.sdk = new Shoot9SDK(this.connection, wallet);

      // Initialize the program with the program ID from the SDK
      this.program = new Program<Shoot9Solana>(IDL as Shoot9Solana, provider);

      this.logger.log('Solana program initialized successfully');
      this.logger.log(`Program ID: ${this.program.programId.toBase58()}`);
    } catch (error) {
      this.logger.error('Failed to initialize Solana program:', error);
      throw error;
    }
  }

  public async initializeListener() {
    if (this.isListening) {
      this.logger.warn('Listener is already running');
      return;
    }

    if (!this.program) {
      throw new Error('Solana program not initialized');
    }

    this.isListening = true;
    this.logger.log('Initializing Solana event listener...');

    this.connection.onLogs(
      this.program.programId,
      (logs, context) => {
        // Deduplicate based on transaction signature
        if (this.processedTxs.has(logs.signature)) {
          this.logger.debug(`Transaction ${logs.signature} already processed, skipping.`);
          return;
        }
        this.processedTxs.add(logs.signature);

        this.logger.log(`Raw logs for tx ${logs.signature}: ${logs.logs.join('\n')}`);

        try {
          let eventData = null;
          for (const log of logs.logs) {
            if (log.includes('Program data:')) {
              const base64Data = log.split('Program data: ')[1];
              if (base64Data) {
                try {
                  eventData = this.program.coder.events.decode(base64Data);
                  this.logger.log(`Decoded event from Program data: ${JSON.stringify(eventData)}`);
                  break;
                } catch (decodeError) {
                  this.logger.error(`Failed to decode Program data "${base64Data}": ${decodeError}`);
                }
              }
            }
          }

          if (eventData) {
            switch (eventData.name) {
              case 'ContestCreated':
                this.handleContestCreated(eventData.data);
                break;
              case 'ContestEntered':
                this.handleContestEntered(eventData.data);
                break;
              case 'ContestResolved':
                this.handleContestResolved(eventData.data);
                break;
              default:
                this.logger.log(`Unexpected event name: ${eventData.name}`);
            }
          } else {
            this.logger.debug(`No event decoded from logs for tx ${logs.signature}`);
          }
        } catch (error) {
          this.logger.error('Error processing logs:', error);
        }
      },
      'confirmed',
    );

    this.logger.log('Subscribed to Solana program logs');
  }

  private handleContestCreated(event: any) {
    this.logger.log('ContestCreated Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      entryFee: Number(event.entryFee),
      name: event.name,
      feeReceiver: event.feeReceiver.toString(),
      timestamp: Number(event.timestamp),
    });
    // Add custom logic here (e.g., notify admin, update cache, etc.)
  }

  private handleContestEntered(event: any) {
    this.logger.log('ContestEntered Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      user: event.user.toString(),
      amount: Number(event.amount),
      timestamp: Number(event.timestamp),
    });
    // Add custom logic here (e.g., update participant list, trigger notification)
  }

  private handleContestResolved(event: any) {
    this.logger.log('ContestResolved Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      winnerWallets: event.winnerWallets.map((w: PublicKey) => w.toString()),
      payouts: event.payouts.map((p: BN) => Number(p)),
      timestamp: Number(event.timestamp),
    });
    // Add custom logic here (e.g., update leaderboard, notify winners)
  }

  async stopListening() {
    this.isListening = false;
    this.processedTxs.clear();
    this.logger.log('Stopped Solana event listener and cleared processed transactions');
  }

  // Optional: Clear processed transactions to manage memory
  public clearProcessedTxs(): void {
    this.processedTxs.clear();
    this.logger.debug('Cleared processed transaction cache.');
  }
}
