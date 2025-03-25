import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { generateUsername } from 'unique-username-generator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    this.logger.debug('OTP request received', { phoneNumber: sendOtpDto.phoneNumber });
    try {
      const message = await this.otpService.sendOtp(sendOtpDto.phoneNumber);
      return { message };
    } catch (error) {
      this.logger.error('Failed to send OTP', { error });
      throw error;
    }
  }

  async verifyOtpAndLogin(verifyOtpDto: VerifyOtpDto) {
    this.logger.debug('OTP verification request received', { phoneNumber: verifyOtpDto.phoneNumber });
    
    try {
      const isValid = this.otpService.verifyOtp(verifyOtpDto.phoneNumber, verifyOtpDto.otp);
      
      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }
      
      let user;
      
      try {
        user = await this.userService.findByPhonenumber(verifyOtpDto.phoneNumber);
        this.logger.log('User found in database by phone number', { userId: user.id });
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.log('User not found in database, creating new user');
          
          user = await this.userService.create({
            username: generateUsername(),
            imageUrl: 'https://ui.shadcn.com/avatars/shadcn.jpg',
            phoneNumber: verifyOtpDto.phoneNumber,
          });
          
          this.logger.log('User created successfully', { userId: user.id });
        } else {
          throw error;
        }
      }

      const payload = {
        sub: user.id,
        phoneNumber: user.phoneNumber,
      };

      const token = this.jwtService.sign(payload);
      
      return { 
        user,
        token 
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

  async getUser(phoneNumber: string) {
    const user = await this.userService.findByPhonenumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
