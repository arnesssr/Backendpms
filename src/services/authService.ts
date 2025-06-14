import { getAuthStatus } from '../middleware/auth';

export class AuthService {
  static verifyConfig(): boolean {
    const requiredEnvVars = [
      'API_KEY',
      'ENCRYPTION_KEY',
      'SECURITY_SIGNATURE_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Auth Configuration Error: Missing env vars:', missingVars);
      return false;
    }

    return true;
  }

  static getStatus(): string {
    return getAuthStatus() ? '✅ Active & Secured' : '❌ Not Configured';
  }
}
