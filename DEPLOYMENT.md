# Deployment Guide

Deploy your LLM UI application to Vercel using serverless functions. **Free tier, zero config**.

## Prerequisites

- GitHub account
- xAI API key ([Get one here](https://console.x.ai/))
- Vercel account ([Sign up](https://vercel.com))

---

## Vercel Serverless Deployment ⚡

Deploy everything to one platform with zero cost and zero configuration.

### Why Vercel Serverless?

✅ **Free Tier**: 100GB-hrs/month function execution
✅ **SSE Streaming**: Full support for Server-Sent Events
✅ **All-in-One**: Frontend + Backend on same platform
✅ **No CORS**: Same origin for API and frontend
✅ **Auto-scaling**: Handles traffic spikes automatically

### Quick Start (5 Minutes)

#### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy to Vercel

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
   - Available to: **Production**

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

#### 3. Test Your Deployment

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

Use **Vercel CLI** to test locally (matches production environment):

```bash
# Create .env at project root
echo "XAI_API_KEY=your_api_key_here" > .env

# Install Vercel CLI globally
npm install -g vercel

# Start dev server (runs both client and API)
npm run dev
# Client: http://localhost:3000
# API: http://localhost:3000/api/*
```

This runs `vercel dev` which:
- Serves your client from `client/`
- Runs API functions from `api/` as serverless functions locally
- Matches production behavior exactly

### Environment Variables

**Production** (Vercel Dashboard → Settings → Environment Variables):

| Variable      | Value            | Required |
| ------------- | ---------------- | -------- |
| `XAI_API_KEY` | Your xAI API key | ✅ Yes   |

**Local** (`.env` at project root):

```bash
XAI_API_KEY=your_xai_api_key_here
```

### Serverless Functions Configuration

Edit `vercel.json` to customize function behavior:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite"
}
```

**Optional advanced configuration**:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

- `memory`: Function memory in MB (default: 1024)
- `maxDuration`: Timeout in seconds (Free: 10s, Pro: 60s)

### Monitoring & Logs

**View Logs**:

1. Vercel Dashboard → Your Project
2. Click "Logs" tab in top navigation
3. See real-time function execution logs

**CLI**:

```bash
vercel logs
vercel logs --follow  # Real-time
```

### Troubleshooting

**Build Failures**:
- Check that `vercel.json` points to correct output directory
- Verify `npm run build` works locally
- Check build logs in Vercel dashboard

**Function Errors (500)**:
- Check Logs tab for error messages
- Common: Missing `XAI_API_KEY` environment variable
- Verify TypeScript imports use `.js` extensions

**Module Not Found Errors**:
- API function imports must use `.js` extension
- Example: `import { streamChat } from "./utils/xai.js"`

**Function Timeout**:
- Reduce `max_tokens` in API requests
- Upgrade to Vercel Pro for 60s timeout

**Environment Variable Not Found**:
- Verify `XAI_API_KEY` is set in Vercel dashboard
- Redeploy after adding environment variables (automatic on git push)

**SSE Not Streaming**:
- Check Network tab for `text/event-stream` header
- Verify chunks are being sent in Vercel logs

### Cost & Limits

**Free Tier**:

- 100GB-hrs function execution/month
- 100GB bandwidth/month
- Unlimited builds
- 10s function timeout

**Typical Usage for This App**:

- Functions: ~1-5 GB-hrs/month
- Bandwidth: ~5-20 GB/month

**Result**: **$0/month** for personal/development use

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel**:

1. Settings → Domains
2. Add your domain
3. Configure DNS records
4. Done! SSL automatic

### Analytics (Optional)

Add Vercel Analytics:

1. Project Settings → Analytics
2. Enable Analytics
3. Add `@vercel/analytics` to your client

```bash
cd client
npm install @vercel/analytics
```

Then in `client/src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

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

Redeploy previous version:

1. Vercel Dashboard → Deployments
2. Find previous deployment
3. Click "⋯" → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

---

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a unique preview URL

To disable auto-deploy:
1. Settings → Git
2. Uncheck "Auto-deploy"

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **xAI Docs**: https://docs.x.ai
- **Issues**: Open issue on GitHub

---

## Quick Reference

### Vercel CLI Commands

```bash
npm install -g vercel     # Install CLI
vercel login              # Authenticate
vercel                    # Deploy preview
vercel --prod             # Deploy production
vercel env add            # Add environment variable
vercel env ls             # List environment variables
vercel logs               # View logs
vercel logs --follow      # Real-time logs
vercel dev                # Test locally (recommended for development)
vercel rollback           # Rollback to previous deployment
```

### Environment Variables

**Production** (Vercel Dashboard):
- `XAI_API_KEY` (required)

**Local** (`.env` at root):
- `XAI_API_KEY` (required)

---

**That's it!** Your app is live on Vercel. 🚀
