import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns Newly created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new BadRequestException('User with this email, username, or public address already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Find all users
   * @returns Array of all users
   */
  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Fetching all users');
      return await this.userRepository.find();
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User with the specified ID
   */
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

  /**
   * Find a user by ID (alias for findOne)
   * @param id User ID
   * @returns User with the specified ID
   */
  async findById(id: string): Promise<User> {
    return await this.findOne(id);
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User with the specified email
   */
  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with email: ${email}`);
      const user = await this.userRepository.findOne({ where: { email } });
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

  /**
   * Find a user by public address
   * @param publicAddress User public blockchain address
   * @returns User with the specified public address
   */
  async findByPublicAddress(publicAddress: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with public address: ${publicAddress}`);
      const user = await this.userRepository.findOne({
        where: { publicAddress },
      });
      if (!user) {
        this.logger.warn(`User with public address ${publicAddress} not found`);
        throw new NotFoundException(
          `User with public address ${publicAddress} not found`,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch user by public address: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user by public address');
    }
  }

  /**
   * Update a user's information
   * @param id User ID
   * @param updateUserDto User update data
   * @returns Updated user
   */
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

  /**
   * Update a user's wallet address
   * @param id User ID
   * @param updateWalletDto Wallet update data
   * @returns Updated user
   */
  async updateWallet(id: string, updateWalletDto: UpdateWalletDto): Promise<User> {
    try {
      this.logger.log(`Updating wallet for user with ID: ${id}`);
      const user = await this.findOne(id);
      user.publicAddress = updateWalletDto.publicAddress;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update wallet: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new BadRequestException('User with this public address already exists');
      }
      throw new InternalServerErrorException('Failed to update wallet');
    }
  }

  /**
   * Deactivate a user account
   * @param id User ID
   * @returns Updated user with isActive set to false
   */
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

  /**
   * Activate a user account
   * @param id User ID
   * @returns Updated user with isActive set to true
   */
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
}
