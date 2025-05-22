import { Clerk as ClerkType } from '@clerk/backend'

declare module '@clerk/backend' {
  export interface ClerkOptions {
    secretKey: string | undefined;
  }

  export class Clerk implements ClerkType {
    constructor(options: ClerkOptions);
    sessions: {
      verifyToken: (token: string) => Promise<{
        userId: string;
      }>;
    };
  }
}
