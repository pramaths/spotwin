import { Controller, Get, Post, Body, Param, Logger, UseGuards, Request, BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { User } from '../users/entities/users.entity';
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy';
import { ApplyReferralDto } from './dto/apply-referral.dto';

@ApiTags('referrals')
@Controller('referrals')
export class ReferralsController {
  private readonly logger = new Logger(ReferralsController.name);

  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or generate user referral code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns user referral code' })
  async getMyReferralCode(@Request() req) {
    const userId = req.user.id;
    this.logger.log(`Getting/generating referral code for user ${userId}`);
    return { 
      referralCode: await this.referralsService.assignReferralCode(userId) 
    };
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply a referral code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Referral code applied successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid referral code or already has referrer' })
  async applyReferralCode(@Request() req, @Body() applyReferralDto: ApplyReferralDto) {
    const userId = req.user.id;
    this.logger.log(`User ${userId} applying referral code: ${applyReferralDto.referralCode}`);
    
    await this.referralsService.applyReferralCode(userId, applyReferralDto.referralCode);
    return { 
      success: true, 
      message: 'Referral code applied successfully' 
    };
  }

  @Get('my-referrals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users referred by the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns list of referred users' })
  async getMyReferrals(@Request() req) {
    const userId = req.user.id;
    this.logger.log(`Getting referrals for user ${userId}`);
    
    const referrals = await this.referralsService.getReferrals(userId);
    return { 
      count: referrals.length,
      referrals 
    };
  }

  @Get('my-referrer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referrer of the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns referrer details or null' })
  async getMyReferrer(@Request() req) {
    const userId = req.user.id;
    this.logger.log(`Getting referrer for user ${userId}`);
    
    const referrer = await this.referralsService.getReferrer(userId);
    return { referrer };
  }
} 