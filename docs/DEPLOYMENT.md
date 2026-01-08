# Deployment Guide

This guide covers deploying the Xandeum pNode Analytics Platform to production.

## Deployment Options

1. [Vercel](#vercel-recommended) - Recommended, easiest setup
2. [Docker](#docker) - Self-hosted containers
3. [Node.js Server](#nodejs-server) - Traditional VPS deployment

---

## Vercel (Recommended)

Vercel provides the simplest deployment for Next.js applications.

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

### Steps

1. **Push to Repository**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**

   In Vercel dashboard → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_PNODE_SEED_IPS=173.212.203.145,65.109.29.154,95.216.148.118
   NEXT_PUBLIC_PNODE_RPC_PORT=6000
   BASE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   
   # Supabase (Required)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   SUPABASE_ANON_KEY=your-anon-key

   # AI & Analytics (Required)
   GEMINI_API_KEY=your-gemini-key
   LONGCAT_API_KEY=your-longcat-key
   JUPITER_API_KEY=your-jupiter-key
   
   # Optional Features
   BREVO_API_KEY=your-brevo-api-key
   ALERT_FROM_EMAIL=alerts@yourdomain.com
   ALERT_FROM_NAME="pNode Watch"
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   VAPID_SUBJECT=mailto:your@email.com
   TELEGRAM_BOT_TOKEN=your-token
   DISCORD_BOT_TOKEN=your-token
   ```

4. **Deploy**

   Click "Deploy" - Vercel builds and deploys automatically.

### Custom Domain

1. Go to Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. Update `BASE_URL` accordingly

### Automatic Deployments

Vercel automatically redeploys on every push to `main` branch.

---

## Docker

Deploy using Docker for self-hosted environments.

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_PNODE_SEED_IPS
ARG NEXT_PUBLIC_PNODE_RPC_PORT=6000
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  xandeum-analytics:
    build:
      context: .
      args:
        - NEXT_PUBLIC_PNODE_SEED_IPS=${NEXT_PUBLIC_PNODE_SEED_IPS}
        - NEXT_PUBLIC_PNODE_RPC_PORT=${NEXT_PUBLIC_PNODE_RPC_PORT}
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - LONGCAT_API_KEY=${LONGCAT_API_KEY}
      - JUPITER_API_KEY=${JUPITER_API_KEY}
      - BREVO_API_KEY=${BREVO_API_KEY}
      - ALERT_FROM_EMAIL=${ALERT_FROM_EMAIL}
      - ALERT_FROM_NAME=${ALERT_FROM_NAME}
      - NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
      - VAPID_SUBJECT=${VAPID_SUBJECT}
      - BASE_URL=${BASE_URL}
      - NEXT_PUBLIC_BASE_URL=${BASE_URL}
    restart: unless-stopped
```

### Next.js Configuration

Update `next.config.ts` for standalone output:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### Build and Run

```bash
# Create .env file with variables
cp .env.example .env
# Edit .env with your values

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### With Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name analytics.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Node.js Server

Traditional deployment on a VPS or bare metal server.

### Prerequisites

- Ubuntu 20.04+ or similar Linux
- Node.js 20+
- npm 9+
- PM2 (process manager)

### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install build tools (for better-sqlite3)
sudo apt install -y python3 make g++
```

### Application Setup

```bash
# Clone repository
git clone https://github.com/abulimen/xandeum-analytics.git
cd xandeum-analytics

# Install dependencies
npm ci --production=false

# Create environment file
cp .env.example .env.local
# Edit .env.local with your values
nano .env.local

# Build application
npm run build

# Start with PM2
pm2 start npm --name "xandeum-analytics" -- start

# Save PM2 configuration
pm2 save

# Enable PM2 startup on boot
pm2 startup
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'xandeum-analytics',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/xandeum-analytics',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '1G',
  }]
};
```

Then run:

```bash
pm2 start ecosystem.config.js
```

### Updating

```bash
cd /path/to/xandeum-analytics
git pull origin main
npm ci
npm run build
pm2 restart xandeum-analytics
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_PNODE_SEED_IPS` | Yes | Seed node IPs | `1.2.3.4,5.6.7.8` |
| `SUPABASE_URL` | Yes | Supabase Project URL | `https://x.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key | `ey...` |
| `GEMINI_API_KEY` | Yes | AI Copilot Key | `AI...` |
| `LONGCAT_API_KEY` | Yes | Network Summary AI Key | `LC...` |
| `JUPITER_API_KEY` | Yes | Token Price API | `...` |
| `BASE_URL` | Yes | Production URL | `https://analytics...` |
| `BREVO_API_KEY` | No | Email Alerts | `xkeysib...` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | No | Push Notifications | `BH...` |
| `TELEGRAM_BOT_TOKEN` | No | Telegram Bot | `123:ABC...` |
| `DISCORD_BOT_TOKEN` | No | Discord Bot | `MT...` |

---

## Health Checks

### Endpoint

```
GET /api/prpc
POST body: {"method": "get-pods-with-stats"}
```

Expected response: `{"success": true, "data": {...}}`

### Monitoring Script

```bash
#!/bin/bash
RESPONSE=$(curl -s -X POST https://your-domain.com/api/prpc \
  -H "Content-Type: application/json" \
  -d '{"method":"get-pods-with-stats"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Healthy"
  exit 0
else
  echo "❌ Unhealthy"
  exit 1
fi
```

---

## SSL/TLS

### Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d analytics.yourdomain.com

# Auto-renewal (added automatically)
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Caching

The app uses TanStack Query with 30-second stale time. For higher traffic:

1. Add CDN (Cloudflare, Fastly)
2. Enable Vercel Edge caching
3. Add Redis for session storage

### Database

Supabase (PostgreSQL) is used for all data storage.

1. Enable Row Level Security (RLS)
2. Use connection pooling (Supabase Transaction Mode)
3. Monitor database size and index usage

---

## Troubleshooting

### Build Failures

```bash
# Clear caches
rm -rf .next node_modules
npm ci
npm run build
```



### Memory Issues

Increase Node.js memory:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```
