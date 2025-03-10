import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { PrivyService } from '../privy/privy.service';
import { UserService } from '../users/users.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private privyService: PrivyService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.debug('Login request received', { loginDto });
    try {
      // Try to find user by Twitter username or wallet address
      let user;
      let privyUser;

      if (loginDto.twitterUsername) {
        try {
          user = await this.userService.findByTwitterUsername(loginDto.twitterUsername);
          this.logger.log('User found in database by Twitter username', { userId: user.id });
        } catch (error) {
          if (error instanceof NotFoundException) {
            // If not in our database, try to get from Privy
            this.logger.log('User not found in database, checking Privy');
            privyUser = await this.privyService.getUserByTwitterUsername(loginDto.twitterUsername);
          } else {
            throw error;
          }
        }
      } else if (loginDto.address) {
        try {
          // First check if user exists in our database
          user = await this.userService.findByPublicAddress(loginDto.address);
          this.logger.log('User found in database by wallet address', { userId: user.id });
        } catch (error) {
          if (error instanceof NotFoundException) {
            // If not in our database, try to get from Privy
            this.logger.log('User not found in database, checking Privy');
            privyUser = await this.privyService.getUserByWalletAddress(loginDto.address);
          } else {
            throw error;
          }
        }
      } else {
        throw new Error('Twitter username or wallet address is required');
      }

      // If user not found in our database but found in Privy, create a new user
      if (!user && privyUser) {
        this.logger.log('Creating new user from Privy data', { privyUser });
        user = await this.userService.create({
          email: privyUser.email || `${privyUser.twitterUsername}@twitter.com`,
          publicAddress: privyUser.walletAddress,
          username: privyUser.twitterUsername,
          name: privyUser.name || privyUser.twitterUsername || '',
          imageUrl: privyUser.imageUrl || '',
          twitterUsername: privyUser.twitterUsername,
        });
        this.logger.log('User created successfully', { userId: user.id });
      }

      if (!user) {
        throw new Error('User not found');
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        publicAddress: user.publicAddress,
        twitterUsername: user.twitterUsername,
      };

      const token = this.jwtService.sign(payload);
      
      return { 
        user,
        token 
      };
    } catch (error) {
      this.logger.error('Login process failed', { error });
      throw error;
    }
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  async getUser(userId: string) {
    const user = await this.userService.findByEmail(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
