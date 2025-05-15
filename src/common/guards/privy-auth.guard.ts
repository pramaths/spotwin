import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrivyService } from '../../privy/privy.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  private readonly logger = new Logger(PrivyAuthGuard.name);
  
  constructor(
    private reflector: Reflector,
    private privyService: PrivyService
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      this.logger.debug('Endpoint is public, skipping authentication');
      return true;
    }

    // Check for admin role
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles && roles.includes('admin')) {
      this.logger.debug('Admin role detected, bypassing token authentication');
      return true; 
    }
    
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Authorization header missing in request');
      throw new UnauthorizedException('Authorization header missing');
    }

    // Extract the token from the Authorization header
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader; // In case the 'Bearer ' prefix is not included
    }

    if (!token) {
      this.logger.warn('Token is empty after extraction from Authorization header');
      throw new UnauthorizedException('Empty token provided');
    }

    try {
      const privyUser = await this.privyService.verifyTokenAndLogin(token);
      
      if (!privyUser) {
        throw new UnauthorizedException('Invalid token - no user data');
      }
      
      this.logger.debug(`Successfully authenticated user: ${privyUser.userId}`);
      
      // Set the user in the request object
      request['user'] = privyUser;
      
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid Privy token');
    }
  }
}