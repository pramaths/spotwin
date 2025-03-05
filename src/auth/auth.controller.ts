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
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { Response, Request } from 'express';
  // import { LoginDto } from './dto/login.dto';
  import { JwtAuthGuard } from './strategies/jwt.strategy';
  import { JwtService } from '@nestjs/jwt';
  import { PrivyService } from '../privy/privy.service';
  @Controller('auth')
  export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
      private readonly authService: AuthService,
      private readonly jwttService: JwtService,
      private readonly privyService: PrivyService,
    ) {}
  
    @Get('login')
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: Request, @Res() res: Response) {
      const Cookietoken = req.cookies['privy-token'];
      const idToken = req.cookies['privy-id-token'];
      this.logger.log('Login request received');
      this.logger.log(`Cookie token value: ${Cookietoken}`);
  
      if (!Cookietoken) {
        this.logger.warn('No privy token found in cookies');
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No privy token found',
        });
      }
  
      try {
        const { token, user } = await this.authService.login(
          Cookietoken,
          idToken,
        );
  
        this.logger.log('Login successful, setting access token cookie');
        res.cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'lax',
        });
  
        return res.json(user);
      } catch (error) {
        this.logger.error(`Login error: ${error.message}`);
        this.logger.error('Full error details:', error);
        // More specific error handling
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
  