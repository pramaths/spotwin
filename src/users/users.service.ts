import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
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
      return await this.userRepository.find();
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
      this.logger.error(`Failed to fetch user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findById(id: string): Promise<User> {
    return await this.findOne(id);
  }

  async findByPhonenumber(phoneNumber: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with phoneNumber: ${phoneNumber}`);
      const user = await this.userRepository.findOne({ where: { phoneNumber } });
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

  async updateExpoPushToken(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.expoPushToken = updateUserDto.expoPushToken;
    return await this.userRepository.save(user);
  }

  async getUserBalance(id: string): Promise<Number> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.points;
  }

  async updateReferralCodeUsed(id: string, referralcode: string | null): Promise<User> {
    const user = await this.findOne(id);
    console.log(referralcode);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isReferralCodeUsed = true;

    if (typeof referralcode === 'string' && referralcode.trim().length > 0) {
      referralcode = referralcode.trim();
      const referrer = await this.userRepository.findOne({ where: { referralCode: referralcode } });
      if (!referrer) {
        throw new NotFoundException('Referrer not found');
      }
      user.referrer = referrer;
      referrer.referrals.push(user);
      return await this.userRepository.save(user);
    }
    return await this.userRepository.save(user);

  }
}
