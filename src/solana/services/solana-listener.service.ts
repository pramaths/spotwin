import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { ConfigService } from '@nestjs/config';
import Shoot9SDK from '../program/contract_sdk';
import * as IDL from '../program/shoot_9_solana.json';
import { Shoot9Solana } from '../program/shoot_9_solana';
import { getKeypairFromFile } from '@solana-developers/helpers';
import { BetsService } from '../../bets/bets.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { ContestsService } from '../../contests/contests.service';
import { UserService } from '../../users/users.service';
import { EventsService } from '../../events/events.service';
import { ContestStatus } from '../../common/enums/common.enum';
import { CreateBetDto } from '../../bets/dto/create-bet.dto';
import { CreateTransactionDto } from '../../transactions/dto/create-transaction.dto';
import { CreateContestDto } from '../../contests/dtos/create-contest.dto';
import { User } from '../../users/entities/users.entity';
import { TransactionType } from '../../common/enums/transaction-type.enum';

@Injectable()
export class SolanaListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SolanaListenerService.name);
  private connection: Connection;
  private program: Program<Shoot9Solana>;
  private sdk: Shoot9SDK;
  private isListening = false;
  private processedTxs = new Set<string>(); // For deduplication

  constructor(
    private configService: ConfigService,
    @Inject(BetsService) private betsService: BetsService,
    @Inject(TransactionsService)
    private transactionsService: TransactionsService,
    @Inject(ContestsService) private contestsService: ContestsService,
    @Inject(UserService) private userService: UserService,
    @Inject(EventsService) private eventsService: EventsService,
  ) {
    this.connection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') ||
        'https://api.devnet.solana.com',
      'confirmed',
    );
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

      const InterfaceString = JSON.stringify(IDL);
      const InterfaceObject = JSON.parse(InterfaceString);

      this.program = new Program(InterfaceObject, provider);

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
      async (logs, context) => {
        if (this.processedTxs.has(logs.signature)) {
          this.logger.debug(
            `Transaction ${logs.signature} already processed, skipping.`,
          );
          return;
        }
        this.processedTxs.add(logs.signature);

        this.logger.log(
          `Raw logs for tx ${logs.signature}: ${logs.logs.join('\n')}`,
        );

        try {
          let eventData = null;
          for (const log of logs.logs) {
            if (log.includes('Program data:')) {
              const base64Data = log.split('Program data: ')[1];
              if (base64Data) {
                try {
                  eventData = this.program.coder.events.decode(base64Data);
                  this.logger.log(
                    `Decoded event from Program data: ${JSON.stringify(eventData)}`,
                  );
                  break;
                } catch (decodeError) {
                  this.logger.error(
                    `Failed to decode Program data "${base64Data}": ${decodeError}`,
                  );
                }
              }
            }
          }

          if (eventData) {
            switch (eventData.name) {
              case 'ContestCreated':
                await this.handleContestCreated(eventData.data);
                break;
              case 'ContestEntered':
                await this.handleContestEntered(eventData.data, logs.signature);
                break;
              case 'ContestResolved':
                this.handleContestResolved(eventData.data);
                break;
              default:
                this.logger.log(`Unexpected event name: ${eventData.name}`);
            }
          } else {
            this.logger.debug(
              `No event decoded from logs for tx ${logs.signature}`,
            );
          }
        } catch (error) {
          this.logger.error('Error processing logs:', error);
        }
      },
      'confirmed',
    );

    this.logger.log('Subscribed to Solana program logs');
  }

  private async handleContestCreated(event: any) {
    this.logger.log('ContestCreated Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      entryFee: Number(event.entryFee),
      name: event.name,
      feeReceiver: event.feeReceiver.toString(),
      timestamp: Number(event.timestamp),
    });

    try {
      const solanaContestId = event.contestId.toString();
      const entryFee = Number(event.entryFee) / 1_000_000_000;

      const existingContest =
        await this.contestsService.findBySolanaContestId(solanaContestId);
      if (existingContest) {
        this.logger.warn(
          `Contest with solanaContestId ${solanaContestId} already exists, skipping creation`,
        );
        return;
      }

      const events = await this.eventsService.findAll();
      if (!events) {
        this.logger.error(
          'No events found in the database to associate with the contest',
        );
        return;
      }
      const defaultEvent = events[0];

      const createContestDto: CreateContestDto = {
        eventId: defaultEvent.id,
        name: event.name,
        description: `Contest created on-chain with Solana ID ${solanaContestId}`,
        entryFee: entryFee,
        solanaContestId: solanaContestId,
      };

      const contest = await this.contestsService.createContest(
        defaultEvent.id,
        createContestDto,
      );
      this.logger.log(`Contest created: ${contest.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process ContestCreated event: ${error.message}`,
      );
    }
  }

  private async handleContestEntered(event: any, signature: string) {
    this.logger.log('ContestEntered Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      user: event.user.toString(),
      amount: Number(event.amount),
      timestamp: Number(event.timestamp),
    });

    try {
      const solanaContestId = event.contestId.toString();
      const userPubkey = event.user.toString();
      const entryFee = Number(event.amount) / 1_000_000_000;

      const contest =
        await this.contestsService.findBySolanaContestId(solanaContestId);
      if (!contest) {
        this.logger.error(
          `Contest with solanaContestId ${solanaContestId} not found`,
        );
        return;
      }

      if (
        contest.status === ContestStatus.CANCELLED ||
        contest.status === ContestStatus.COMPLETED
      ) {
        this.logger.error(
          `Contest with ID ${contest.id} is ${contest.status}, cannot join`,
        );
        return;
      }

      let user = await this.userService.findByPublicAddress(userPubkey);
      if (!user) {
        const createUserDto = {
          username: `user_${userPubkey.slice(0, 8)}`,
          email: `${userPubkey.slice(0, 8)}@example.com`,
          publicAddress: userPubkey,
          imageUrl: 'https://default-user-image.com',
        };
        user = await this.userService.create(createUserDto);
        this.logger.log(
          `Created new user: ${user.id} for public address ${userPubkey}`,
        );
      }

      // Create an entry in the transactions table
      const createTransactionDto: CreateTransactionDto = {
        userId: user.id,
        contestId: contest.id,
        type: TransactionType.ENTRY_FEE,
        amount: entryFee,
        transactionHash: signature,
      };
      const transaction =
        await this.transactionsService.create(createTransactionDto);
      this.logger.log(`Transaction created: ${transaction.id}`);

      // Create an entry in the bets table
      const createBetDto: CreateBetDto = {
        contestId: contest.id,
        userId: user.id,
        transactionId: transaction.id,
      };
      const bet = await this.betsService.create(createBetDto);
      this.logger.log(`Bet (contest entry) created: ${bet.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process ContestEntered event: ${error.message}`,
      );
    }
  }

  private handleContestResolved(event: any) {
    this.logger.log('ContestResolved Event:', {
      contest: event.contest.toString(),
      contestId: Number(event.contestId),
      winnerWallets: event.winnerWallets.map((w: PublicKey) => w.toString()),
      payouts: event.payouts.map((p: BN) => Number(p)),
      timestamp: Number(event.timestamp),
    });
    // Add custom logic if needed
  }

  async stopListening() {
    this.isListening = false;
    this.processedTxs.clear();
    this.logger.log(
      'Stopped Solana event listener and cleared processed transactions',
    );
  }

  public clearProcessedTxs(): void {
    this.processedTxs.clear();
    this.logger.debug('Cleared processed transaction cache.');
  }
}
