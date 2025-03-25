import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OtpRecord {
  otp: string;
  expiresAt: Date;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpMap = new Map<string, OtpRecord>();

  constructor(private readonly configService: ConfigService) {
    setInterval(() => this.cleanupExpiredOtps(), 5 * 60 * 1000);
  }

  private cleanupExpiredOtps() {
    const now = new Date();
    for (const [phoneNumber, record] of this.otpMap.entries()) {
      if (record.expiresAt < now) {
        this.logger.log(`Removing expired OTP for ${phoneNumber}`);
        this.otpMap.delete(phoneNumber);
      }
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phoneNumber: string): Promise<string> {
    console.log(this.otpMap);
    if (this.otpMap.has(phoneNumber)) {
      this.logger.warn(`OTP already sent to ${phoneNumber}. Returning existing OTP.`);
      
      return this.otpMap.get(phoneNumber).otp;
    }

    const otp = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    this.otpMap.set(phoneNumber, { otp, expiresAt });
    
    try {
      const apiKey = this.configService.get<string>('FAST2SMS_API_KEY');
      
      if (!apiKey) {
        this.logger.error('FAST2SMS_API_KEY is not set in environment variables');
        throw new Error('SMS service configuration is missing');
      }
      
      // Create form data parameters
      const params = new URLSearchParams();
      params.append('variables_values', otp);
      params.append('route', 'otp');
      params.append('numbers', phoneNumber);
      
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'authorization': apiKey
        },
        body: params
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`SMS service error: ${errorText}`);
        throw new Error(`SMS service responded with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      this.logger.log(`OTP sent to ${phoneNumber}. Response: ${JSON.stringify(responseData)}`);
      
      return 'OTP sent successfully';
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error.message}`, error.stack);
        if (process.env.NODE_ENV !== 'production') {
        return `OTP for testing: ${otp}`;
      }
      
      throw new Error('Failed to send OTP');
    }
  }

  // For development/testing only - gets the current OTP for a phone number
  getOtpForTesting(phoneNumber: string): string | null {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('Attempted to access OTP in production mode');
      return null;
    }

    if (!this.otpMap.has(phoneNumber)) {
      return null;
    }

    const record = this.otpMap.get(phoneNumber);
    if (record.expiresAt < new Date()) {
      this.otpMap.delete(phoneNumber);
      return null;
    }

    return record.otp;
  }

  verifyOtp(phoneNumber: string, otp: string): boolean {
    const record = this.otpMap.get(phoneNumber);
    
    if (!record) {
      this.logger.warn(`No OTP found for ${phoneNumber}`);
      return false;
    }
    
    if (record.expiresAt < new Date()) {
      this.logger.warn(`OTP expired for ${phoneNumber}`);
      this.otpMap.delete(phoneNumber);
      return false;
    }
    
    if (record.otp !== otp) {
      this.logger.warn(`Invalid OTP provided for ${phoneNumber}`);
      return false;
    }
    
    this.otpMap.delete(phoneNumber);
    
    this.logger.log(`OTP verified successfully for ${phoneNumber}`);
    return true;
  }
} 