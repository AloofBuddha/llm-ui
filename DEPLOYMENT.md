# Deployment Guide

Deploy your LLM UI application to production. Choose between two options:

1. **Vercel All-in-One** (Recommended) - Deploy both frontend and backend to Vercel using serverless functions. **Free tier, zero config**.
2. **Vercel + Railway** (Traditional) - Separate deployments for frontend and backend.

## Prerequisites

- GitHub account
- xAI API key ([Get one here](https://console.x.ai/))
- Vercel account ([Sign up](https://vercel.com))
- Railway account (only if using Option 2)

---

## Option 1: Vercel Serverless (Recommended) ⚡

Deploy everything to one platform with zero cost and zero configuration.

### Why Vercel Serverless?

✅ **Free Tier**: 100GB-hrs/month function execution
✅ **SSE Streaming**: Full support for Server-Sent Events
✅ **All-in-One**: Frontend + Backend on same platform
✅ **No CORS**: Same origin for API and frontend
✅ **Auto-scaling**: Handles traffic spikes automatically

### Quick Start (5 Minutes)

#### 1. Install Dependencies

```bash
# Install root dependencies (for API functions)
npm install
```

#### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. Deploy to Vercel

**Via Vercel Dashboard**:

1. Go to https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure Project** (auto-detected, verify):
   - Framework Preset: **Vite**
   - Root Directory: **.** (project root)
   - Build Command: `npm run build`
   - Output Directory: `client/dist`

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Name: `XAI_API_KEY`
   - Value: Your xAI API key
   - Available to: **All environments**

5. **Deploy**:
   - Click "Deploy"
   - Wait ~2 minutes
   - Done! 🎉

**Via Vercel CLI**:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add XAI_API_KEY production
# Paste your xAI API key

# Deploy to production
vercel --prod
```

#### 4. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://llm-ui.vercel.app`)
2. Send a chat message
3. Select text to test the explanation pane
4. Check browser console for errors

### How It Works

Your project structure supports serverless deployment:

```
llm-ui/
├── api/                    # Serverless functions → /api/*
│   ├── chat.ts            # /api/chat endpoint
│   ├── explain.ts         # /api/explain endpoint
│   └── utils/xai.ts       # xAI service
├── client/                # React frontend → /*
├── vercel.json            # Vercel configuration
└── package.json           # API dependencies
```

**URLs in production**:
```
https://your-app.vercel.app/           → React frontend
https://your-app.vercel.app/api/chat   → Chat API
https://your-app.vercel.app/api/explain → Explain API
```

### Local Development

**Option A: Express Server (Recommended)**

Use your existing Express server for development (faster, no cold starts):

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

**Option B: Vercel Dev (Test Serverless Locally)**

Test serverless functions locally:

```bash
# Create .env at project root
cp .env.example .env
# Add your XAI_API_KEY

# Install Vercel CLI
npm install -g vercel

# Start Vercel dev server
vercel dev
```

### Environment Variables

**Production** (Vercel Dashboard → Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `XAI_API_KEY` | Your xAI API key |

**Local** (for Vercel Dev only - create `.env` at project root):
```bash
XAI_API_KEY=your_xai_api_key_here
```

**Note**: Client and server folders have their own `.env` files for Express development.

### Serverless Functions Configuration

Edit `vercel.json` to customize:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,        // Memory in MB
      "maxDuration": 10      // Timeout in seconds (Free: 10s, Pro: 60s)
    }
  }
}
```

### Monitoring & Logs

**View Logs**:
1. Vercel Dashboard → Your Project → Deployments
2. Click a deployment → Functions tab
3. Click function name to see logs

**CLI**:
```bash
vercel logs
vercel logs --follow  # Real-time
```

### Troubleshooting

**Function Timeout**:
- Reduce `max_tokens` in API requests
- Upgrade to Vercel Pro for 60s timeout

**Environment Variable Not Found**:
- Verify `XAI_API_KEY` is set in Vercel dashboard
- Redeploy after adding environment variables

**SSE Not Streaming**:
- Check Network tab for `text/event-stream` header
- Verify chunks are being sent in Vercel logs

### Cost & Limits

**Free Tier**:
- 100GB-hrs function execution/month
- 100GB bandwidth/month
- Unlimited builds

**Typical Usage for This App**:
- Functions: ~1-5 GB-hrs/month
- Bandwidth: ~5-20 GB/month

**Result**: **$0/month** for personal/development use

---

## Option 2: Vercel + Railway (Traditional)

Deploy frontend to Vercel and backend to Railway as separate services.

**Note**: Railway no longer offers a free tier (~$5/month minimum).

### Backend Deployment (Railway)

#### 1. Prepare Repository

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Deploy to Railway

1. **Sign in**: Visit https://railway.app (sign in with GitHub)

2. **Create Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**:
   - Set **Root Directory**: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Environment Variables**:
   - `XAI_API_KEY`: Your xAI API key
   - `PORT`: `3001`
   - `NODE_ENV`: `production`

5. **Deploy**: Railway deploys automatically

6. **Get URL**: Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Frontend Deployment (Vercel)

#### 1. Update Environment Variable

Create `client/.env.production`:

```bash
VITE_API_URL=https://your-railway-app.up.railway.app
```

Commit and push:
```bash
git add client/.env.production
git commit -m "Add production API URL"
git push
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your repository
3. **Configure**:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variable**:
   - `VITE_API_URL`: Your Railway backend URL

5. Deploy!

### CORS Configuration

Update `server/src/index.ts` to allow your Vercel domain:

```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-app.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
```

Commit and push to redeploy on Railway.

---

## Comparison: Serverless vs Traditional

| Feature | Vercel Serverless | Vercel + Railway |
|---------|------------------|------------------|
| **Cost** | **Free** | ~$5/month |
| **Setup** | One platform | Two platforms |
| **CORS** | Not needed | Required |
| **Cold Starts** | 1-2s (first request) | None |
| **Maintenance** | Lower | Higher |
| **Scalability** | Auto | Manual/Auto |
| **Best For** | Personal/Small apps | High-traffic apps |

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel**:
1. Settings → Domains
2. Add your domain
3. Configure DNS

### Analytics (Optional)

Add Vercel Analytics:
1. Project Settings → Analytics
2. Enable Analytics
3. Add `<Analytics />` to your React app

### Monitoring (Optional)

**Error Tracking**: Integrate Sentry or similar

**Performance**: Use Vercel Speed Insights

---

## Testing Checklist

After deployment, verify:

- [ ] Frontend loads correctly
- [ ] Can send chat messages
- [ ] Messages stream in real-time
- [ ] Can select text to open explanation pane
- [ ] Dictionary/Wikipedia/AI tabs work
- [ ] Can create new chats
- [ ] Chat history persists
- [ ] LaTeX renders correctly
- [ ] No console errors

---

## Rollback

### Vercel Serverless

Redeploy previous version:
1. Vercel Dashboard → Deployments
2. Find previous deployment
3. Click "⋯" → "Promote to Production"

### Railway

Redeploy:
1. Railway Dashboard → Deployments
2. Click previous deployment
3. Click "Redeploy"

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **xAI Docs**: https://docs.x.ai
- **Issues**: Open issue on GitHub

---

## Quick Reference

### Vercel Serverless Commands

```bash
npm install               # Install API dependencies
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel env add           # Add environment variable
vercel logs              # View logs
vercel dev               # Test locally
```

### Railway Commands

```bash
npm install -g @railway/cli
railway login
railway link
railway logs
```

### Environment Variables Summary

**Vercel Serverless**:
- `XAI_API_KEY` (required)

**Railway + Vercel**:
- Backend: `XAI_API_KEY`, `PORT`, `NODE_ENV`
- Frontend: `VITE_API_URL`

---

**That's it!** Choose your deployment option and you're ready to go live. 🚀
