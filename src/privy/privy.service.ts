import {
    Injectable,
    OnModuleInit,
    UnauthorizedException,
    Logger,
  } from '@nestjs/common';
  import { PrivyUser } from './interfaces/privy_user';
  import { PrivyClient } from '@privy-io/server-auth';
  import { AuthTokenClaims } from './interfaces/privy_user';
  
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
        this.logger.log('Initializing Privy client');
        this.privy = new PrivyClient(
          process.env.PRIVY_APP_ID!,
          process.env.PRIVY_APP_SECRET!,
        );
        this.logger.log('Privy client initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Privy client', error);
        throw error;
      }
    }
  
    
    async getUserByWalletAddress(walletAddress: string): Promise<PrivyUser> {
      if (!this.privy) {
        throw new Error('Privy client not initialized');
      }
      
      this.logger.log(`Fetching user from Privy by wallet address: ${walletAddress}`);
      try {
        const users = await this.privy.getUsers();
        const user = users.find(u => {
          const solanaAccount = u.linkedAccounts?.find(
            (account: any) =>
              account.chainType === 'solana' &&
              account.walletClientType === 'privy' &&
              (account as any).address === walletAddress
          );
          return !!solanaAccount;
        });
        
        if (!user) {
          throw new UnauthorizedException(`User with wallet address ${walletAddress} not found in Privy`);
        }
        
        return {
          userId: user.id,
          email: typeof user.email === 'string' ? user.email : user.email?.address,
          walletAddress: walletAddress,
          name: (user as any).name || '',
          imageUrl: (user as any).avatarUrl || '',
        };
      } catch (error) {
        this.logger.error(`Failed to fetch user from Privy by wallet address: ${error.message}`, error.stack);
        throw new UnauthorizedException('Failed to fetch user from Privy');
      }
    }
  
    async getUserByTwitterUsername(twitterUsername: string): Promise<PrivyUser> {
      if (!this.privy) {
        this.logger.error('Privy client not initialized when trying to get user by Twitter username');
        throw new Error('Privy client not initialized');
      }
      
      this.logger.log(`Fetching user from Privy by Twitter username: ${twitterUsername}`);
      try {
        // Log the API call attempt
        this.logger.log('Calling privy.getUsers() to fetch all users');
        const users = await this.privy.getUsers();
        this.logger.log(`Retrieved ${users.length} users from Privy`);
        
        // Log the search criteria
        this.logger.log(`Searching for user with Twitter username: ${twitterUsername}`);
        
        // Debug log some sample user data to understand the structure
        if (users.length > 0) {
          this.logger.debug(`Sample user structure: ${JSON.stringify(users[0], null, 2)}`);
          this.logger.debug(`Sample linkedAccounts: ${JSON.stringify(users[0].linkedAccounts, null, 2)}`);
        }
        
        const user = users.find(u => {
          // Check if the user has a Twitter account linked
          const twitterAccount = u.linkedAccounts?.find(
            (account: any) =>
              (account.type === 'twitter' || account.type === 'twitter_oauth') &&
              account.username === twitterUsername
          );
          
          // Also check the twitter property if available
          const twitterMatch = u.twitter && u.twitter.username === twitterUsername;
          
          return !!twitterAccount || twitterMatch;
        });
        
        if (!user) {
          this.logger.warn(`User with Twitter username ${twitterUsername} not found in Privy`);
          throw new UnauthorizedException(`User with Twitter username ${twitterUsername} not found in Privy`);
        }
        
        this.logger.log(`Found user with ID: ${user.id} for Twitter username: ${twitterUsername}`);
        
        // Find the wallet address if available
        const solanaAddress = user.linkedAccounts?.find(
          (account: any) =>
            account.chainType === 'solana' &&
            account.walletClientType === 'privy',
        ) || user.wallet; // Try the wallet property if linkedAccounts doesn't have it
        
        // Get Twitter profile details - check both linkedAccounts and the twitter property
        const twitterAccount = user.linkedAccounts?.find(
          (account: any) => account.type === 'twitter' || account.type === 'twitter_oauth'
        ) || user.twitter;
        
        // Log the extracted data
        this.logger.log(`User data extracted - Email: ${typeof user.email === 'string' ? user.email : user.email?.address}`);
        this.logger.log(`User data extracted - Wallet: ${(solanaAddress as any)?.address || 'Not found'}`);
        this.logger.log(`User data extracted - Name: ${(user as any).name || (twitterAccount as any)?.name || 'Not found'}`);
        
        const userData = {
          userId: user.id,
          email: typeof user.email === 'string' ? user.email : user.email?.address,
          walletAddress: (solanaAddress as any)?.address || '',
          name: (user as any).name || (twitterAccount as any)?.name || '',
          imageUrl: (user as any).avatarUrl || (twitterAccount as any)?.profilePictureUrl || '',
          twitterUsername: twitterUsername,
        };
        
        this.logger.log(`Successfully retrieved user data for Twitter username: ${twitterUsername}`);
        return userData;
      } catch (error) {
        this.logger.error(`Failed to fetch user from Privy by Twitter username: ${twitterUsername}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
        
        // Log additional details about the error
        if (error.response) {
          this.logger.error(`Privy API response error: ${JSON.stringify(error.response.data)}`);
          this.logger.error(`Privy API response status: ${error.response.status}`);
        }
        
        throw new UnauthorizedException('Failed to fetch user from Privy');
      }
    }

    async verifyTokenAndLogin(token: string) {
      if (!this.privy) {
        this.logger.error('Privy client not initialized when trying to verify token');
        throw new UnauthorizedException('Privy client not initialized');
      }
      
      try {
        const verifiedClaims: AuthTokenClaims = await this.privy.verifyAuthToken(token);
        const user = await this.privy.getUser(verifiedClaims.userId);
        
        let email = '';
        if (user.google) {
          email = user.google.email;
        }
        
        let walletAddress = '';
        if (user.wallet && user.wallet.address) {
          walletAddress = user.wallet.address;
        } else if (user.linkedAccounts) {
          const solanaAccount = user.linkedAccounts.find(
            (account: any) => account.chainType === 'solana' && account.walletClientType === 'privy'
          );
          if (solanaAccount && solanaAccount) {
            walletAddress = 'o9ggg' ;
          }
        }
        
        // Extract name from various possible sources
        let name = '';
        if (user.google) {
          name = user.google.name;
        } else if (user.google && user.google.name) {
          name = user.google.name;
        }
        
        const privyUser = {
          userId: user.id,
          email: email,
          walletAddress: walletAddress,
          name: name,
          privyId: verifiedClaims.userId,
        };
        
        return privyUser;
      } catch (error) {
        this.logger.error(`Failed to verify Privy token: ${error.message}`, error.stack);
        
        if (error.response) {
          this.logger.error(`Privy API response error: ${JSON.stringify(error.response.data)}`);
          this.logger.error(`Privy API response status: ${error.response.status}`);
        }
        
        throw new UnauthorizedException('Invalid Privy token');
      }
    }
  }