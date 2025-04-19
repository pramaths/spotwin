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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

  async findByPhonenumber(phoneNumber: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with phoneNumber: ${phoneNumber}`);
      const user = await this.userRepository.findOne({ where: { phoneNumber, isActive: true } });
      if (!user) {
        this.logger.warn(`User with phoneNumber ${phoneNumber} not found`);
        throw new NotFoundException(`User with phoneNumber ${phoneNumber} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch user by phoneNumber: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user by phoneNumber');
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
        throw new BadRequestException('User with this phonenumber, username, or public address already exists');
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

  async getUserBalance(id: string): Promise<Number> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.points;
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

  async addPoints(userIds: string[], points: number){
    try {
      this.logger.log(`Adding ${points} points to ${userIds.length} users`);
      
      return await this.userRepository.manager.transaction(async transactionalEntityManager => {
        const users = await transactionalEntityManager.find(User, { 
          where: { id: In(userIds) } 
        });
        
        if (!users || users.length === 0) {
          throw new NotFoundException('No users found with the provided IDs');
        }
        
        users.forEach(user => {
          user.points += points;
        });
        
        return await transactionalEntityManager.save(users);
      });
    } catch (error) {
      this.logger.error(`Failed to add points in batch: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add points to users');
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

  async buyTickets(id: string, ticketId: string): Promise<User> {
    try {
      return await this.userRepository.manager.transaction(async transactionalEntityManager => {
        const user = await transactionalEntityManager.findOne(User, { where: { id } });
        const ticket = await transactionalEntityManager.findOne(Ticket, { where: { id: ticketId } });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        if (user.points < ticket.costPoints) {
          throw new BadRequestException('Insufficient points');
        }
        
        user.points -= ticket.costPoints;
        const userTicket = transactionalEntityManager.create(UserTicket, {
          userId: user.id,
          purchasedAt: new Date(),
        });
        
        await transactionalEntityManager.save(userTicket);
        const savedUser = await transactionalEntityManager.save(user);

        try {
          await this.emailService.sendTicketPurchaseNotification(
            user.id,
            user.username,
            user.phoneNumber
          );
        } catch (emailError) {
          this.logger.error(`Failed to send ticket purchase email: ${emailError.message}`, emailError.stack);
        }

        return savedUser;
      });
    } catch (error) {
      this.logger.error(`Failed to buy tickets: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to buy tickets');
    }
  }
}
