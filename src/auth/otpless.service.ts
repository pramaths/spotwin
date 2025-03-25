import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtplessService {
  private readonly logger = new Logger(OtplessService.name);
  private readonly apiUrl = 'https://auth.otpless.app/auth/v1';
  private clientId: string;
  private clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('OTPLESS_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('OTPLESS_CLIENT_SECRET');
    
    if (!this.clientId || !this.clientSecret) {
      this.logger.error('OTPless API keys not found in environment variables');
    }
  }

  async initiateOtp(phoneNumber: string): Promise<{ requestId: string; message: string }> {
    this.logger.debug('Initiating OTP request', { phoneNumber });
    
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must include country code (e.g., +919999999999)');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/initiate/otp`, {
        method: 'POST',
        headers: {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          expiry: 900,
          otpLength: 6,
          channels: ["SMS"],
          metadata: {
            app: "spotwin"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('OTPless API error', errorData);
        throw new Error(`OTPless API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      this.logger.debug('OTP initiated successfully', data);
      
      return {
        requestId: data.requestId,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      this.logger.error('Failed to initiate OTP', error);
      throw error;
    }
  }

  async verifyOtp(requestId: string, otp: string): Promise<boolean> {
    this.logger.debug('Verifying OTP', { requestId });
    
    try {
      const response = await fetch(`${this.apiUrl}/verify/otp`, {
        method: 'POST',
        headers: {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: requestId,
          otp: otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('OTP verification error', errorData);
        return false;
      }

      const data = await response.json();
      this.logger.debug('OTP verified successfully', data);
      
      return true;
    } catch (error) {
      this.logger.error('Error verifying OTP', error);
      return false;
    }
  }
} 