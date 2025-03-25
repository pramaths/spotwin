import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecret',
    });
  }

  async validate(payload: any) {
    this.logger.debug('Validating JWT payload', { payload });
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.warn('User not found during JWT validation', { userId: payload.sub });
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
