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
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { Response, Request } from 'express';
  import { LoginDto } from './dto/login.dto';
  import { JwtAuthGuard } from './strategies/jwt.strategy';
  import { JwtService } from '@nestjs/jwt';
  import { PrivyService } from '../privy/privy.service';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
      private readonly authService: AuthService,
      private readonly jwttService: JwtService,
      private readonly privyService: PrivyService,
    ) {}
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with Twitter username or wallet address' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'User logged in successfully',
    })
    @ApiResponse({ 
      status: HttpStatus.UNAUTHORIZED, 
      description: 'Invalid credentials' 
    })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
      try {
        const user = await this.authService.login(loginDto);
  
        this.logger.log('Login successful');
        return res.json(user);
      } catch (error) {
        this.logger.error(`Login error: ${error.message}`);
        this.logger.error('Full error details:', error);
        if (error.message === 'Invalid Privy token') {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Invalid authentication token',
          });
        }
  
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error during login process',
          error: error.message,
        });
      }
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res() res: Response) {
      const token = req.cookies['access_token'];
  
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No access token found' });
      }
      try {
        const decoded = this.jwttService.verify(token);
        const walletAddress = decoded.walletAddress;
        if (!walletAddress) {
          throw new Error('No wallet address found');
        }
      } catch (e) {
        console.error('Error logging out:', e);
      }
      res.clearCookie('access_token');
      return res.json({ message: 'Logged out successfully' });
    }
  
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req: Request & { user: any }) {
      console.log('req.user', req.user);
      return req.user;
    }
  }
  