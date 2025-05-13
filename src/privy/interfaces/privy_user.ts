export interface PrivyUser {
    email?: string;
    walletAddress?: string;
    userId: string;
    name?: string;
    imageUrl?: string;
    twitterUsername?: string;
  }
  
  export interface AuthTokenClaims {
    appId: string;
    userId: string;
    issuer: string;
    issuedAt: number;
    expiration: number;
    sessionId: string;
  }