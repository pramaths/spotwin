import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { generateUsername } from 'unique-username-generator';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.debug('Login request received', { loginDto });
    try {
      let user;
      let privyUser;

      if (loginDto.phoneNumber) {
        try {
          user = await this.userService.findByPhonenumber(loginDto.phoneNumber);
          this.logger.log('User found in database by Twitter username', { userId: user.id });
        } catch (error) {
          if (error instanceof NotFoundException) {
            this.logger.log('User not found in database, checking Privy');
          } else {
            throw error;
          }
        }
      }else {
        throw new Error('Twitter username or wallet address is required');
      }

      if (!user && privyUser) {
        this.logger.log('Creating new user from Privy data', { privyUser });
        user = await this.userService.create({
          username: generateUsername(),
          imageUrl: privyUser.imageUrl || '',
          phoneNumber: privyUser.phoneNumber,
        });
        this.logger.log('User created successfully', { userId: user.id });
      }

      if (!user) {
        throw new Error('User not found');
      }

      const payload = {
        sub: user.id,
        email: user.email,
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

  async getUser(phoneNumber: string) {
    const user = await this.userService.findByPhonenumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
