import {
    Controller,
    Post,
    Res,
    HttpStatus,
    HttpCode,
    UseGuards,
    Get,
    Req,
    Logger,
    Body,
    Headers,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { Response, Request } from 'express';
  import { SendOtpDto } from './dto/send-otp.dto';
  import { VerifyOtpDto } from './dto/verify-otp.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
  import { UserService } from '../users/users.service';
  import { Public } from '../common/decorators/public.decorator';

  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
    ) {}
  
    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiHeader({
      name: 'Authorization',
      description: 'Bearer JWT token',
      required: true,
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Logged in successfully',
    })
    @ApiResponse({ 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Invalid authorization token' 
    })
    async login(@Headers('authorization') authHeader: string) {
      const token = authHeader.split(' ')[1];
      const response = await this.authService.verifyTokenAndLogin(token);
      const userData = this.userService.findByEmail(response.user.email);
      return userData;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiHeader({
      name: 'Authorization',
      description: 'Bearer JWT token',
      required: true,
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Logged out successfully',
    })
    @ApiResponse({ 
      status: HttpStatus.BAD_REQUEST, 
      description: 'No authorization token found' 
    })
    async logout(@Headers('authorization') authHeader: string, @Res() res: Response) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No authorization token found' });
      }
  
      try {
        const token = authHeader.split(' ')[1];
        const decoded = await this.authService.verifyTokenAndLogin(token);
        const phoneNumber = decoded.user.email;
        
        if (!phoneNumber) {
          throw new Error('No phone number found in token');
        }
        
        this.logger.log(`User with phone number ${phoneNumber} logged out successfully`);
        return res.json({ message: 'Logged out successfully' });
      } catch (error) {
        this.logger.error('Error during logout:', error);
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          message: 'Invalid authorization token',
          error: error.message
        });
      }
    }
  
    @Get('me')
    @ApiHeader({
      name: 'Authorization',
      description: 'Bearer JWT token',
      required: true,
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Current user details',
    })
    @ApiResponse({ 
      status: HttpStatus.UNAUTHORIZED, 
      description: 'Unauthorized' 
    })
    async getCurrentUser(@Req() req: Request & { user: any }) {
      try {
        this.logger.debug('User object from Privy authentication:', req.user);
        
        if (!req.user) {
          this.logger.error('No user object found in request');
          throw new Error('User not authenticated');
        }
        if (req.user.email) {
          this.logger.log(`Attempting to find user by email: ${req.user.email}`);
          try {
            const userByEmail = await this.userService.findByEmail(req.user.email);
            this.logger.log(`Successfully found user by email: ${req.user.email}`);
            return userByEmail;
          } catch (emailError) {
            this.logger.warn(`Could not find user by email: ${emailError.message}`);
          }
        }
        this.logger.error('Could not find user with the provided authentication data');
        throw new Error('User not found in the system');
      } catch (error) {
        this.logger.error(`Error fetching user from database: ${error.message}`, error.stack);
        throw error;
      }
    }
  
  }
  