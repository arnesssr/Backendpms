# Security Keys Generation Guide

## Key Types and Criticality

### Critical Keys (System Cannot Function Without)
```plaintext
1. API_KEY
   - Primary authentication mechanism
   - Required for all API requests
   - System will reject all requests without valid API key
   - CRITICALITY: HIGH ⚠️

2. ENCRYPTION_KEY
   - Used for sensitive data encryption/decryption
   - Required for secure data storage and transmission
   - System will fail to process sensitive data without it
   - CRITICALITY: HIGH ⚠️
```

### Important But Non-Critical Keys (System Can Function Without)
```plaintext
1. WEBHOOK_ENCRYPTION_KEY
   - Used for webhook payload encryption
   - System can still process requests without it
   - Affects only webhook functionality
   - CRITICALITY: MEDIUM

2. SECURITY_SIGNATURE_SECRET
   - Used for request signature verification
   - Adds extra security layer but not critical
   - System can be configured to skip verification
   - CRITICALITY: MEDIUM

3. WEBHOOK_SECRET
   - Used for webhook authentication
   - Only affects webhook delivery
   - Can be disabled if needed
   - CRITICALITY: LOW
```

## Key Usage and Purpose

### API_KEY
- Primary request authentication
- Rate limiting identification
- Access control management
- Usage tracking and monitoring

### ENCRYPTION_KEY
- Database field encryption
- Sensitive data protection
- Secure storage of PII
- End-to-end message encryption

### WEBHOOK_ENCRYPTION_KEY
- Webhook payload encryption
- Third-party integration security
- Event notification security

### SECURITY_SIGNATURE_SECRET
- Request tampering prevention
- Message integrity verification
- Man-in-the-middle attack prevention

### WEBHOOK_SECRET
- Webhook source verification
- Event delivery authentication
- Integration security

## API Key Generation
```bash
# Using Node.js crypto module
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Signature Key
```bash
# Using Node.js crypto module
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Webhook Secret
```bash
# Using Node.js crypto module
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Encryption Key Generation

### Application Encryption Key 
```bash
# Using Node.js crypto to generate 32-byte (256-bit) key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

### Webhook Encryption Key
```bash
# Using Node.js crypto to generate 32-byte (256-bit) key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## Implementation Guide

### 1. Backend Keys (.env)
```env
# Generate and add these keys
API_KEY=generated_api_key
SECURITY_SIGNATURE_SECRET=generated_signature_key
WEBHOOK_SECRET=generated_webhook_secret
ENCRYPTION_KEY=your_generated_key
WEBHOOK_ENCRYPTION_KEY=your_generated_key
```

### 2. Frontend Keys (Vercel Environment)
```env
# PMS Frontend (.env)
VITE_API_KEY=generated_api_key
VITE_SECURITY_SIGNATURE_SECRET=generated_signature_key

# Storefront Frontend (.env)
NEXT_PUBLIC_API_KEY=generated_api_key
NEXT_PUBLIC_SECURITY_SIGNATURE_SECRET=generated_signature_key
```

### 3. Generate the keys:
```bash
# Run these commands in your terminal
ENCRYPTION_KEY=$(node -e "console.log(crypto.randomBytes(32).toString('hex'))")
WEBHOOK_KEY=$(node -e "console.log(crypto.randomBytes(32).toString('hex'))")

echo "Generated Keys:"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "WEBHOOK_ENCRYPTION_KEY=$WEBHOOK_KEY"
```

### 4. Add to deployment environment:
   - Add to Render environment variables
   - Keep a secure backup of the keys
   - Never commit these keys to version control

## Key Rotation Schedule
- API Keys: Every 90 days
- Security Signature: Every 30 days
- Webhook Secrets: Every 60 days
- Rotate encryption keys every 90 days
  - Generate new keys before rotating
  - Maintain old keys for 24 hours during rotation
  - Document all key rotations in secure log

## Security Headers Implementation
All API requests must include:
```typescript
headers: {
  'X-API-Key': process.env.API_KEY,
  'X-Request-Signature': generateSignature(payload),
  'X-Request-Timestamp': Date.now().toString(),
  'X-Request-Nonce': generateNonce()
}
```

## Important Notes
1. Never commit keys to version control
2. Use different keys for development/production
3. Share keys securely (password manager)
4. Monitor key usage in logs
5. Implement key rotation alerts
6. Limit key access to senior developers only
7. Monitor key usage in application logs
8. Set up alerts for failed decryption attempts

## Encryption Keys Distribution

### Backend (.env)
```env
# Full encryption keys required
ENCRYPTION_KEY=your_generated_key
WEBHOOK_ENCRYPTION_KEY=your_generated_key
```

### PMS Frontend (.env)
```env
# Only verification parts needed
VITE_VERIFY_KEY=public_verification_part
# Does NOT need ENCRYPTION_KEY or WEBHOOK_ENCRYPTION_KEY
```

### Storefront Frontend (.env)
```env
# Only verification parts needed
NEXT_PUBLIC_VERIFY_KEY=public_verification_part
# Does NOT need ENCRYPTION_KEY or WEBHOOK_ENCRYPTION_KEY
```

## ⚠️ Frontend Security Guidelines

### Never Add to Frontend:
1. Encryption Keys
   - ENCRYPTION_KEY
   - WEBHOOK_ENCRYPTION_KEY
   - These are for backend encryption only

2. Database Credentials
   - All database connection strings
   - Service role keys
   - Redis URLs

3. Internal Secrets
   - SECURITY_SIGNATURE_SECRET
   - WEBHOOK_SECRET
   - Private keys

### What Frontend Should Have:
1. Public Keys Only
   - API_KEY (restricted version)
   - Public verification keys
   - Public endpoints

2. Public Configurations
   - API URLs
   - WebSocket URLs
   - Public environment indicators

## Security Notes
1. Encryption keys remain ONLY on backend
2. Frontend apps only receive verification parts
3. Never expose full encryption keys to frontend
4. Use asymmetric encryption for frontend-backend communication
5. Webhook encryption keys stay exclusively on backend
