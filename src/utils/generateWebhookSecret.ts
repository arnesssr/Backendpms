import crypto from 'crypto';

const generateWebhookSecret = () => {
  const secret = crypto.randomBytes(32).toString('hex');
  console.log('Generated Webhook Secret:', secret);
  return secret;
};

if (require.main === module) {
  generateWebhookSecret();
}
