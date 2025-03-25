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
  import { JwtAuthGuard } from './strategies/jwt.strategy';
  import { JwtService } from '@nestjs/jwt';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
  import { UserService } from '../users/users.service';
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
      private readonly authService: AuthService,
      private readonly jwttService: JwtService,
      private readonly userService: UserService,
    ) {}
  
    @Post('otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send OTP to phone number' })
    @ApiBody({ type: SendOtpDto })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'OTP sent successfully',
    })
    @ApiResponse({ 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Invalid phone number' 
    })
    async sendOtp(@Body() sendOtpDto: SendOtpDto, @Res() res: Response) {
      try {
        const result = await this.authService.sendOtp(sendOtpDto);
        this.logger.log('OTP initiated successfully');
        return res.json(result);
      } catch (error) {
        this.logger.error(`OTP initiating error: ${error.message}`);
        this.logger.error('Full error details:', error);
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error during OTP initiation process',
          error: error.message,
        });
      }
    }
  
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP and login user' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'User logged in successfully',
    })
    @ApiResponse({ 
      status: HttpStatus.UNAUTHORIZED, 
      description: 'Invalid or expired OTP' 
    })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
      try {
        const result = await this.authService.verifyOtpAndLogin(verifyOtpDto);
        this.logger.log('OTP verification and login successful');
        return res.json(result);
      } catch (error) {
        this.logger.error(`OTP verification error: ${error.message}`);
        this.logger.error('Full error details:', error);
        
        if (error.message === 'Invalid or expired OTP' || error.message === 'Invalid request ID') {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: error.message,
          });
        }
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error during OTP verification process',
          error: error.message,
        });
      }
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
        const decoded = this.jwttService.verify(token);
        const phoneNumber = decoded.phoneNumber;
        
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
    @UseGuards(JwtAuthGuard)
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
        this.logger.log('Getting current user from database', { userId: req.user.sub });
        const user = await this.userService.findById(req.user.sub);
        return user;
      } catch (error) {
        this.logger.error(`Error fetching user from database: ${error.message}`, error.stack);
        throw error;
      }
    }
  
  }
  