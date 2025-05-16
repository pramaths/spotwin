import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, LessThan, LessThanOrEqual, Between } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExpoPushTokenDto } from './dto/expo-push-token.dto';
import { subDays } from 'date-fns';
import { UserTicket } from './entities/user-ticket.entity';
import { EmailService } from '../email/email.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { StakeDto } from './dto/stake.dto';
import {Keypair, VersionedTransaction, Connection, clusterApiUrl, PublicKey} from '@solana/web3.js';
import * as bs58 from 'bs58'; 
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTicket)
    private readonly userTicketRepository: Repository<UserTicket>,
    private readonly emailService: EmailService,
  ) { }

  private generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;

    // Generate a 6-character string
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating new user with name: ${createUserDto.username}`);
      const user = this.userRepository.create(createUserDto);

      let referralCode;
      let isUnique = false;

      while (!isUnique) {
        referralCode = this.generateReferralCode();
        const existingUser = await this.userRepository.findOne({
          where: { referralCode }
        });

        if (!existingUser) {
          isUnique = true;
        }
      }

      user.referralCode = referralCode;

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      if (error.code === '23505') {
        throw new BadRequestException('User with this username, or public address already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Fetching all users');
      return await this.userRepository.find({
        where: {
          isActive: true
        }
      });
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with ID: ${id}`);
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch user with ID ${id}: ${error.message}`, 
        error.stack
      );
      throw new InternalServerErrorException(`Failed to fetch user with ID ${id}`);
    }
  }

  async findById(id: string): Promise<User> {
    return await this.findOne(id);
  }

  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with email: ${email}`);
      const user = await this.userRepository.findOne({ where: { email, isActive: true } });
      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch user by email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      const user = await this.findOne(id);
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new BadRequestException('User with this email, username, or public address already exists');
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deactivateUser(id: string): Promise<User> {
    try {
      this.logger.log(`Deactivating user with ID: ${id}`);
      const user = await this.findOne(id);
      user.isActive = false;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to deactivate user');
    }
  }

  async activateUser(id: string): Promise<User> {
    try {
      this.logger.log(`Activating user with ID: ${id}`);
      const user = await this.findOne(id);
      user.isActive = true;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to activate user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to activate user');
    }
  }

  async updateExpoPushToken(id: string, expoPushTokenDto: ExpoPushTokenDto): Promise<User> {
    try {
      this.logger.log(`Updating Expo push token for user with ID: ${id}`);
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.expoPushToken = expoPushTokenDto.expoPushToken;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update Expo push token: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update Expo push token');
    }
  }

  async updateReferralCodeUsed(id: string, referralCode: string | null): Promise<User> {
    try {
      this.logger.log(`Updating referral code used for user with ID: ${id}, referral code: ${referralCode}`);
      
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isReferralCodeUsed) {
        throw new BadRequestException('User already used a referral code');
      }

      user.isReferralCodeUsed = true;

      if (typeof referralCode === 'string' && referralCode.trim().length > 0) {
        referralCode = referralCode.trim();        
        if (user.referralCode === referralCode) {
          throw new BadRequestException('Cannot use your own referral code');
        }
        const referrer = await this.userRepository.findOne({ 
          where: { referralCode: referralCode },
          relations: ['referrals']
        });
        
        if (!referrer) {
          throw new NotFoundException(`Referrer with code ${referralCode} not found`);
        }

        this.logger.log(`Found referrer with ID: ${referrer.id} for code: ${referralCode}`);
        
        user.referrerId = referrer.id;
        
        if (!referrer.referrals) {
          referrer.referrals = [];
        }
        
        await this.userRepository.save(referrer);
        
        this.logger.log(`Updated referrer ${referrer.id} with new referral ${user.id}`);
      }

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`Updated user ${id} with isReferralCodeUsed=${savedUser.isReferralCodeUsed}, referrerId=${savedUser.referrerId || 'null'}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error(`Error updating referral code used: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update referral code used');
    }
  }


  async getUserAnalytics(): Promise<{
    totalUsers: number;
    yesterdayNewUsers: number;
    newUsers: number;
  }> {
    try {
      const totalUsers = await this.userRepository.count();
      const now = new Date();
      
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      
      const newUsers = await this.userRepository.count({
        where: { 
          createdAt: MoreThan(todayStart)
        }
      });
      
      const yesterdayNewUsers = await this.userRepository.count({
        where: { 
          createdAt: Between(yesterdayStart, todayStart)
        }
      });
      
      return { totalUsers, yesterdayNewUsers, newUsers };
    } catch (error) {
      this.logger.error(`Failed to get user analytics: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get user analytics');
    }
  }

  async stake(stakedto:StakeDto, privyId: string):Promise<void> {

    const feePayerAddress = process.env.FEE_PAYER_ADDRESS;
    const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY;
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed');
   
    const feePayerWallet = Keypair.fromSecretKey(bs58.decode(feePayerPrivateKey));
    console.log('Fee payer private key:', feePayerPrivateKey);
    console.log('Fee payer wallet:', feePayerWallet.publicKey.toBase58());

    const transactionBuffer = Buffer.from(stakedto.instructions, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    const sim = await connection.simulateTransaction(transaction, { sigVerify: false });
    console.dir(sim.value.logs, { depth: null });

    const message = transaction.message;
    const accountKeys = message.getAccountKeys();
    const feePayerIndex = 0; // Fee payer is always the first account
    const feePayer = accountKeys.get(feePayerIndex);
    console.log('Fee payer:', feePayer.toBase58());
    if (!feePayer || feePayer.toBase58() !== feePayerAddress) {
      throw new BadRequestException('Invalid fee payer in transaction');
    }
    console.log("feepayer address matched")
    for (const instruction of message.compiledInstructions) {
      
      const programId = accountKeys.get(instruction.programIdIndex);

      // Check if instruction is for System Program (transfers)
      if (programId && programId.toBase58() === '11111111111111111111111111111111') {
        // Check if it's a transfer (command 2)
        if (instruction.data[0] === 2) {
          const senderIndex = instruction.accountKeyIndexes[0];
          const senderAddress = accountKeys.get(senderIndex);

          // Don't allow transactions that transfer tokens from fee payer
          if (senderAddress && senderAddress.toBase58() === feePayerAddress) {
            throw new BadRequestException('Transaction attempts to transfer funds from fee payer');
          }
        }
      }
    }
    console.log("transaction verified")
    transaction.sign([feePayerWallet]);

    // 4. Send transaction
    const signature = await connection.sendTransaction(transaction);
    console.log('Transaction signature:', signature);
    
    const user = await this.userRepository.findOne({
      where: { privyId: privyId },
    })

    user.stakedAmount+= stakedto.stakeAmount/1000000;
    await this.userRepository.save(user);
    console.log("user found",user.id)
  }
}
