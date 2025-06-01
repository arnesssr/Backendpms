# Backend Deployment Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Git repository
- Environment variables ready

## Required Environment Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=5000
API_KEY=your_generated_api_key

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/dbname

# CORS Settings
PMS_URL=https://your-pms.vercel.app
STOREFRONT_URL=https://your-storefront.vercel.app

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication (if using Clerk)
CLERK_SECRET_KEY=your_secret_key
CLERK_JWT_KEY=your_jwt_key
```

## Deployment Options

### 1. Render Deployment
```bash
1. Create new Web Service
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: pnpm install && pnpm build
   - Start Command: pnpm start

4. Add environment variables in Render dashboard
```

### 2. Railway Deployment
```bash
1. Create new project
2. Connect GitHub repository
3. Configure settings:
   - Build Command: pnpm install && pnpm build
   - Start Command: pnpm start
4. Add environment variables
```

### 3. DigitalOcean App Platform
```bash
1. Create new App
2. Connect repository
3. Configure:
   - Build Command: pnpm install && pnpm build
   - Run Command: pnpm start
4. Add environment variables
```

### 4. Custom VPS (Ubuntu)
```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PNPM
npm install -g pnpm

# 3. Clone repository
git clone your-repo-url
cd your-repo-directory

# 4. Setup environment
cp .env.example .env
nano .env  # Edit with your values

# 5. Install & Build
pnpm install
pnpm build

# 6. Setup PM2
npm install -g pm2
pm2 start dist/server.js --name "backend"
pm2 save

# 7. Setup Nginx
sudo apt install nginx
# Configure Nginx as reverse proxy
```

## Database Setup

### Supabase Setup
1. Create new project
2. Get connection string
3. Set environment variables
4. Run migrations:
```bash
pnpm migrate
```

### PostgreSQL Setup
1. Create database
2. Set up user access
3. Configure connection string
4. Run migrations

## Post-Deployment Checklist

1. Verify Environment
```bash
# Test database connection
curl https://your-api/health

# Test CORS
curl -H "Origin: your-pms-url" https://your-api/health
```

2. Security Checks
- [ ] API Key configured
- [ ] CORS origins set
- [ ] Database access restricted
- [ ] Rate limiting enabled

3. Monitor Setup
- [ ] Setup logging
- [ ] Configure alerts
- [ ] Monitor database connections
- [ ] Track API usage

## Troubleshooting

### Common Issues
1. Database Connection
```bash
# Check connection
DATABASE_URL format correct?
Database accessible from deployment?
```

2. CORS Errors
```bash
# Verify origins in env
PMS_URL and STOREFRONT_URL match exactly?
Including https:// in URLs?
```

3. Build Failures
```bash
# Check build logs
pnpm install --frozen-lockfile failing?
TypeScript errors?
```

## Maintenance

### Regular Tasks
1. Update dependencies
```bash
pnpm update
```

2. Monitor logs
3. Backup database
4. Check security updates

### Scaling
1. Configure database pooling
2. Setup caching if needed
3. Monitor resource usage
