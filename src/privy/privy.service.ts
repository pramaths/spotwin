import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrivyUser } from './interfaces/privy_user';
import { PrivyClient } from '@privy-io/server-auth';

@Injectable()
export class PrivyService implements OnModuleInit {
  private privy: PrivyClient;
  private readonly logger = new Logger(PrivyService.name);

  constructor() {
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
    const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
      throw new Error(
        'PRIVY_APP_ID or PRIVY_APP_SECRET environment variable is not set',
      );
    }
  }

  async onModuleInit() {
    try {
      this.privy = new PrivyClient(
        process.env.PRIVY_APP_ID!,
        process.env.PRIVY_APP_SECRET!,
      );
    } catch (error) {
      throw new Error(`Failed to initialize Privy client: ${error.message}`);
    }
  }

  async validateToken(authToken: string, idToken: string): Promise<PrivyUser> {
    if (!this.privy) {
      throw new Error('Privy client not initialized');
    }
    this.logger.log('Validating token:', authToken);
    try {
      let verifiedClaims;
      try {
        verifiedClaims = await this.privy.verifyAuthToken(authToken);
      } catch (error) {
        this.logger.error('Token validation failed', { error: error });
        throw new UnauthorizedException('Invalid Privy token');
      }
      this.logger.log('Verified claims:', JSON.stringify(verifiedClaims));
      const user = await this.privy.getUser({ idToken: idToken });
      this.logger.log('Privy user:', user);
      const solanaAddress = user.linkedAccounts.find(
        (account: any) =>
          account.chainType === 'solana' &&
          account.walletClientType === 'privy',
      );
      const response: PrivyUser = {
        userId: verifiedClaims.userId,
        email:
          typeof user.email === 'string' ? user.email : user.email?.address,
        walletAddress: (solanaAddress as any)?.address || '',
      };
      this.logger.log('Privy user:', response);

      return response;
    } catch (error) {
      this.logger.error('Token validation failed', { error: error });
      throw new UnauthorizedException('Invalid Privy token');
    }
  }
}
