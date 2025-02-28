export interface PrivyUser {
  email?: string;
  walletAddress?: string;
  userId: string;
}

export interface AuthTokenClaims {
  appId: string;
  userId: string;
  issuer: string;
  issuedAt: string;
  expiration: string;
  sessionId: string;
}
