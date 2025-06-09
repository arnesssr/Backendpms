# Security Keys Generation Guide

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

## Implementation Guide

### 1. Backend Keys (.env)
```env
# Generate and add these keys
API_KEY=generated_api_key
SECURITY_SIGNATURE_SECRET=generated_signature_key
WEBHOOK_SECRET=generated_webhook_secret
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

## Key Rotation Schedule
- API Keys: Every 90 days
- Security Signature: Every 30 days
- Webhook Secrets: Every 60 days

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
