import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UserService } from '../users/users.service';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  /**
   * Generate a random 6-character alphanumeric + special character referral code
   */
  generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    const charactersLength = characters.length;
    
    // Generate a 6-character string
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  /**
   * Assign a referral code to a user if they don't have one
   */
  async assignReferralCode(userId: string): Promise<string> {
    const user = await this.userService.findById(userId);
    
    if (user.referralCode) {
      return user.referralCode;
    }
    
    // Generate a unique referral code
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
    
    // Update user with new referral code
    user.referralCode = referralCode;
    await this.userRepository.save(user);
    
    return referralCode;
  }

  /**
   * Apply a referral code during registration
   */
  async applyReferralCode(userId: string, referralCode: string): Promise<User> {
    const user = await this.userService.findById(userId);
    
    if (user.referrerId) {
      throw new BadRequestException('User already has a referrer');
    }
    
    // Find the referrer by referral code
    const referrer = await this.userRepository.findOne({ 
      where: { referralCode } 
    });
    
    if (!referrer) {
      throw new NotFoundException(`Invalid referral code: ${referralCode}`);
    }
    
    // Prevent self-referral
    if (referrer.id === userId) {
      throw new BadRequestException('Cannot refer yourself');
    }
    
    // Update the user with referrer
    user.referrer = referrer;
    user.referrerId = referrer.id;
    
    return this.userRepository.save(user);
  }

  /**
   * Get all users referred by a specific user
   */
  async getReferrals(userId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { referrerId: userId },
      select: ['id', 'username', 'imageUrl', 'createdAt']
    });
  }

  /**
   * Get the referrer of a specific user
   */
  async getReferrer(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer']
    });
    
    return user?.referrer || null;
  }

  /**
   * Credit both referrer and referee with points (to be implemented after first investment)
   */
  async creditReferralPoints(userId: string, points: number = 100): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    if (!user.referrer) {
      throw new BadRequestException('User does not have a referrer');
    }
    
    // Credit both users with points
    user.points += points;
    user.referrer.points += points;
    
    // Save both users
    await this.userRepository.save([user, user.referrer]);
    
    this.logger.log(`Credited ${points} points to user ${userId} and referrer ${user.referrer.id} for successful referral`);
  }
} 