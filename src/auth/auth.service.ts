import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { Response } from 'express';
import { generateUsername } from 'unique-username-generator';
import { PrivyService } from 'src/privy/privy.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private privyService: PrivyService
  ) {}

  async verifyTokenAndLogin(token:string) {
    this.logger.debug('Privy token received', { token });
    
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }
    try {
      const privyUser = await this.privyService.verifyTokenAndLogin(token);
      
      if (!privyUser) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }
      
      let user;
      
      try {
        user = await this.userService.findByEmail(privyUser.email);
        this.logger.log('User found in database by phone number', { userId: user.id });
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.log('User not found in database, creating new user');
          
          user = await this.userService.create({
            username: privyUser.name,
            imageUrl: 'https://img.freepik.com/free-vector/smiling-redhaired-cartoon-boy_1308-174709.jpg?semt=ais_hybrid&w=740',
            walletAddress: privyUser.walletAddress || '', 
            email: privyUser.email || '', 
            privyId: privyUser.privyId,
          });
          
          this.logger.log('User created successfully', { userId: user.id });
        } else {
          throw error;
        }
      }
      
      return { 
        user,
        isNewUser: true,
      };
    } catch (error) {
      this.logger.error('Verification process failed', { error });
      throw error;
    }
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  async getUser(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
