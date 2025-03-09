import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrivyService } from '../privy/privy.service';
import { UserService } from '../users/users.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { generateUsername } from 'unique-username-generator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private privyService: PrivyService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(didToken: string, idToken: string) {
    this.logger.debug('Login request received', { didToken });
    try {
      let metadata;
      try {
        metadata = await this.privyService.validateToken(didToken, idToken);
        this.logger.log('Token validated successfully', { metadata });
      } catch (e) {
        this.logger.error('Token validation failed', { error: e });
        throw new Error('Invalid or expired token');
      }

      const { email, walletAddress } = metadata;

      let user;
      user = await this.userService.findByEmail(email);

      if (!user) {
        try {
          user = await this.userService.create({
            email: email,
            publicAddress: walletAddress,
            username: generateUsername('', 2, 10),
            didToken: didToken,
            name: metadata.name,
            imageUrl: metadata.imageUrl,
          });
          this.logger.log('User created successfully', { user });
        } catch (e) {
          this.logger.error('Error creating user', { error: e });
          throw new Error('Failed to create user');
        }
      }

      const payload = {
        sub: user.id,
        email: user.email,
        publicAddress: user.walletAddress,
      };

      let token;
      try {
        token = this.jwtService.sign(payload);
      } catch (e) {
        this.logger.error('Error signing JWT token', { error: e });
        throw new Error('Token creation failed');
      }
      return { user, token };
    } catch (e) {
      this.logger.error('Login process failed', { error: e });
      throw new Error('Login failed, please try again later');
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
