import crypto from 'crypto';

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Run if called directly
if (require.main === module) {
  const apiKey = generateApiKey();
  console.log('Generated API Key:', apiKey);
}
