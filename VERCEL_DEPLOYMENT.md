# Vercel Deployment Guide (All-in-One)

Deploy both frontend and backend to Vercel using serverless functions. Everything in one place, zero cost!

## Why Vercel Serverless?

✅ **Free Tier**: 100GB-hrs/month function execution
✅ **SSE Streaming**: Full support for Server-Sent Events
✅ **Zero Config**: Auto-detects and deploys
✅ **All-in-One**: Frontend + Backend on same platform
✅ **Fast**: Edge network for global performance

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. xAI API key (get from https://console.x.ai/)

## Project Structure

Your project now has this structure:

```
llm-ui/
├── api/                    # Serverless functions (backend)
│   ├── chat.ts            # /api/chat endpoint
│   ├── explain.ts         # /api/explain endpoint
│   └── utils/
│       └── xai.ts         # xAI service
├── client/                # React app (frontend)
├── server/                # Original Express server (keep for local dev)
├── vercel.json            # Vercel configuration
└── package.json           # Root dependencies (for API)
```

**How it works**:
- `api/` folder → Serverless functions at `/api/*`
- `client/` folder → Static frontend
- Vercel serves both from the same domain

## Quick Deploy (5 minutes)

### 1. Install Dependencies

```bash
# Install root dependencies (for API functions)
npm install

# Install client dependencies (if not already done)
cd client && npm install
cd ..
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure Project**:
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: **Leave as `.`** (project root)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `client/dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `XAI_API_KEY` = `your_xai_api_key`
   - Available to: **Production**, **Preview**, and **Development**

5. **Deploy**:
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live!

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: (select your account)
# - Link to existing project: No
# - Project name: llm-ui (or your choice)
# - Directory: ./ (root)
# - Override settings: No

# Add environment variable
vercel env add XAI_API_KEY production
# Paste your xAI API key when prompted

# Deploy to production
vercel --prod
```

### 4. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://llm-ui.vercel.app`)
2. Try sending a chat message
3. Select text to test the explanation pane
4. Check browser console for any errors

## Local Development

You have two options for local development:

### Option 1: Use Original Express Server (Recommended)

```bash
# Terminal 1 - Backend (Express)
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Frontend will proxy /api/* to Express server
```

This is the same workflow you've been using.

### Option 2: Use Vercel Dev (Test Serverless Locally)

```bash
# Install Vercel CLI
npm install -g vercel

# Start Vercel dev server
vercel dev

# This runs:
# - Client at http://localhost:3000
# - API functions at http://localhost:3000/api/*
```

**Note**: You'll need a `.env` file at the root:
```bash
XAI_API_KEY=your_xai_api_key
```

## Environment Variables

### Production (Vercel Dashboard)

Go to: Project Settings → Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `XAI_API_KEY` | `xai-xxx...` | Your xAI API key |

### Local Development (Root .env)

Create `/home/aloofbuddha/src/llm-ui/.env`:
```bash
XAI_API_KEY=your_xai_api_key_here
```

**Important**: This `.env` is for Vercel Dev only. The client and server folders have their own `.env` files for Express development.

## How Serverless Functions Work

### File → Route Mapping

```
api/chat.ts     → https://your-app.vercel.app/api/chat
api/explain.ts  → https://your-app.vercel.app/api/explain
```

### Request Flow

```
User sends message
      ↓
https://your-app.vercel.app/api/chat
      ↓
Vercel invokes api/chat.ts function
      ↓
Function calls xAI API
      ↓
Streams response back via SSE
      ↓
Client receives tokens
```

### Cold Starts

- First request may be slower (~1-2s)
- Subsequent requests are fast (~100-300ms)
- Free tier: functions stay warm for ~5 minutes
- Pro tier: functions stay warm longer

## Customization

### Increase Function Timeout

Edit `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60  // Increase to 60 seconds (max on free tier: 10s)
    }
  }
}
```

**Free tier limit**: 10 seconds
**Pro tier limit**: 60 seconds

### Add CORS for Custom Domain

Edit `api/chat.ts` and `api/explain.ts`, update headers:

```typescript
res.setHeader("Access-Control-Allow-Origin", "https://yourdomain.com");
```

### Change AI Model

Edit `api/utils/xai.ts`, change model:

```typescript
const stream = await client.chat.completions.create({
  model: "grok-4-fast", // or other xAI model
  // ...
});
```

## Monitoring

### View Logs

**Vercel Dashboard**:
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. Click "Functions" tab
5. Click on a function to see logs

**Vercel CLI**:
```bash
vercel logs
```

### Real-Time Logs

```bash
vercel logs --follow
```

## Troubleshooting

### Function Timeout

**Error**: Function exceeded timeout

**Solutions**:
- Reduce `max_tokens` in xAI request
- Check xAI API latency
- Upgrade to Vercel Pro for longer timeouts

### Environment Variable Not Found

**Error**: "XAI_API_KEY environment variable is required"

**Solutions**:
1. Verify env var is set in Vercel dashboard
2. Redeploy after adding env var
3. Check spelling matches exactly: `XAI_API_KEY`

### SSE Streaming Not Working

**Error**: Messages appear all at once instead of streaming

**Solutions**:
1. Check browser network tab for SSE connection
2. Verify response headers include `text/event-stream`
3. Test with Vercel logs to see if chunks are being sent

### Build Fails

**Error**: Build fails during deployment

**Solutions**:
1. Check Vercel build logs for specific error
2. Test build locally: `npm run build`
3. Verify all dependencies in `package.json`
4. Check TypeScript errors

## Cost Breakdown

### Vercel Free Tier

| Resource | Limit | Usage for This App |
|----------|-------|-------------------|
| Function Executions | 100GB-hrs/month | ~1-5 GB-hrs/month |
| Bandwidth | 100GB/month | ~5-20 GB/month |
| Builds | Unlimited | ~10-50/month |
| Projects | Unlimited | 1 |

**Estimated Cost**: $0/month for personal use

### When to Upgrade

Upgrade to Pro ($20/month) if you need:
- More than 100GB bandwidth
- Functions over 10-second timeout
- Team collaboration
- Advanced analytics

## Comparison: Vercel vs Railway

| Feature | Vercel Serverless | Railway |
|---------|------------------|---------|
| **Cost** | $0/month | No free tier (was $5) |
| **Setup** | Zero config | Needs configuration |
| **Platform** | Same as frontend | Separate platform |
| **Cold Starts** | Yes (~1-2s) | No (always on) |
| **Scaling** | Auto, instant | Manual/Auto |
| **Best For** | Low-medium traffic | High traffic, always-on |

## Migration from Express

The original Express server (`/server`) is **still useful for local development**. Keep it!

**Local Dev**: Use Express (`npm run dev` in server)
**Production**: Use Vercel Serverless

No need to delete the Express code - it's a great development environment.

## Next Steps

1. ✅ Deploy to Vercel
2. ⚙️ Set up custom domain (optional)
3. 📊 Add Vercel Analytics (optional)
4. 🔒 Add rate limiting (optional - see below)
5. 🚀 Monitor with Vercel Logs

### Optional: Add Rate Limiting

Create `api/middleware/rateLimit.ts`:

```typescript
const rateLimitMap = new Map<string, number[]>();

export function rateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Filter requests within window
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limited
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true; // Allowed
}
```

Then use in your handlers:

```typescript
import { rateLimit } from "./middleware/rateLimit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = req.headers['x-forwarded-for'] || 'unknown';

  if (!rateLimit(ip as string)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // ... rest of handler
}
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Serverless**: https://vercel.com/docs/functions
- **Issues**: Open issue on GitHub

---

**You're all set!** 🎉

Your entire app (frontend + backend) is now running on Vercel with zero cost.
