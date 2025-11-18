# Quick Reference Guide

## For Claude Code: Refreshing Context in New Session

This is a quick reference for understanding the project state when starting a new session.

## What This Project Is

A chat interface for xAI's Grok API with a unique **explanation pane** feature - users can select text to get definitions, Wikipedia articles, or AI explanations.

## Current State: PRODUCTION READY ✅

All features implemented, linted, and documented. Ready to deploy.

## Quick Start (Development)

```bash
# Terminal 1 - Backend
cd server
npm install
cp .env.example .env  # Add your XAI_API_KEY
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev

# Open http://localhost:5173
```

## Project Structure (Simplified)

```
client/src/
  ├── components/      # UI components
  │   ├── ChatView.tsx           # Main app layout
  │   ├── ChatInput.tsx          # Message input
  │   ├── MessageBubble.tsx      # Chat messages
  │   ├── ExplanationPane.tsx    # Right-side lookup pane
  │   └── LeftPane.tsx           # Chat history sidebar
  ├── hooks/           # React hooks
  │   ├── useChatAPI.ts          # Main chat logic + SSE streaming
  │   ├── usePopover.ts          # Explanation pane logic
  │   └── useChatManager.ts      # Chat history management
  ├── styles/          # CSS files (one per component)
  └── utils/           # Helper functions

server/src/
  ├── routes/          # API endpoints
  │   └── chat.ts                # /api/chat and /api/explain
  ├── services/        # External integrations
  │   └── xai.ts                 # xAI Grok API wrapper
  └── index.ts         # Express server setup
```

## Key Files to Know

### Most Important Files
1. **`client/src/hooks/useChatAPI.ts`** - All chat/streaming logic
2. **`client/src/hooks/usePopover.ts`** - Explanation pane logic
3. **`client/src/components/ExplanationPane.tsx`** - Right pane UI
4. **`server/src/routes/chat.ts`** - API endpoints
5. **`server/src/services/xai.ts`** - xAI integration

### Configuration Files
- **`client/.env`** - `VITE_API_URL=http://localhost:3001`
- **`server/.env`** - `XAI_API_KEY=your_key`, `PORT=3001`
- **`CLAUDE.md`** - Instructions for you (Claude Code)
- **`DEPLOYMENT.md`** - Deployment guide (Vercel + Railway)

## Recent Changes (Nov 18, 2024)

**What Changed**:
1. ❌ Removed auto-scroll during streaming (user controls scroll)
2. ✅ Made explanation pane persistent (only closes via X button)
3. ✅ Made search input editable with 100-char limit and 500ms debounce
4. ✅ Added nested text selection (select within explanation pane)
5. ✅ Styled input to match main chat input
6. ✅ Fixed all linting errors
7. ✅ Created deployment guide and memory bank

**Files Modified**:
- `client/src/components/ChatView.tsx` (removed auto-scroll)
- `client/src/components/ExplanationPane.tsx` (debounce + nested selection)
- `client/src/components/MessageBubble.tsx` (persistent pane)
- `client/src/hooks/usePopover.ts` (updateSearchText method)
- `client/src/styles/explanation-pane.css` (input styling)

## API Endpoints

### POST /api/chat
- **Purpose**: Main chat (streaming)
- **Body**: `{ message: string }`
- **Response**: SSE stream

### POST /api/explain
- **Purpose**: Explanation lookup (streaming)
- **Body**: `{ spanText: string, context: string }`
- **Response**: SSE stream

### External APIs (Client-Side)
- Dictionary: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- Wikipedia: `https://en.wikipedia.org/api/rest_v1/page/summary/{term}`

## Common Tasks

### Add a New Feature
1. Decide if it's client or server
2. If client: Add hook in `hooks/` or component in `components/`
3. If server: Add route or service
4. Update types in TypeScript files
5. Add CSS in `client/src/styles/`
6. Test manually

### Fix a Bug
1. Check browser console for client errors
2. Check server terminal for server errors
3. Check Network tab for API issues
4. Common issues:
   - CORS errors → check `server/src/index.ts`
   - Streaming issues → check `useChatAPI.ts`
   - Styling issues → check relevant CSS file

### Run Tests
```bash
cd server
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run with UI
```

### Lint & Fix
```bash
cd client && npm run lint:fix
cd server && npm run lint:fix
```

## Tech Stack Quick Ref

**Frontend**: React 18 + TypeScript + Vite
**Backend**: Express + TypeScript + Node
**AI**: xAI Grok (via OpenAI SDK)
**Streaming**: Server-Sent Events (SSE)
**Markdown**: react-markdown + remark-gfm
**Math**: KaTeX (via rehype-katex)
**Styling**: Pure CSS (no frameworks)
**Storage**: localStorage (chat history)

## Environment Variables

### Development
```bash
# client/.env
VITE_API_URL=http://localhost:3001

# server/.env
XAI_API_KEY=xai-xxxxx
PORT=3001
```

### Production
```bash
# Vercel (Frontend)
VITE_API_URL=https://your-railway-app.up.railway.app

# Railway (Backend)
XAI_API_KEY=xai-xxxxx
PORT=3001
NODE_ENV=production
```

## Deployment (Quick Version)

### Vercel Serverless (Recommended)

```bash
npm install      # Root dependencies for API
git push         # Push to GitHub
vercel           # Deploy
# Add XAI_API_KEY in dashboard
```

**Free tier, zero config, SSE streaming supported**

### Alternative: Vercel + Railway

Frontend on Vercel, Backend on Railway (separate platforms).
Railway no longer has free tier (~$5/month).

**Full guide**: See `DEPLOYMENT.md`

## Common Questions

**Q: Where is the double-click tooltip feature?**
A: Mentioned in CLAUDE.md but not implemented yet. Future enhancement.

**Q: Why no database?**
A: Project uses localStorage for simplicity. Good enough for demo/personal use.

**Q: Can I add authentication?**
A: Yes, but not implemented. You'd need to add auth middleware and user management.

**Q: How do I change the AI model?**
A: Edit `server/src/services/xai.ts`, change `model: "grok-4-fast"` to another xAI model.

**Q: How do I add more explanation sources?**
A: Add a new tab in `ExplanationPane.tsx` and corresponding fetch function in `usePopover.ts`.

**Q: Why is scroll position not auto-scrolling?**
A: Recent change - users want control during streaming. See `ChatView.tsx` comments.

## Debugging Tips

### Streaming Not Working
- Check Network tab for SSE connection
- Verify `Content-Type: text/event-stream` header
- Check server logs for xAI API errors
- Verify XAI_API_KEY is set

### Explanation Pane Not Opening
- Check browser console for errors
- Verify text is actually selected (not just clicked)
- Check `popover.showPopover()` is being called
- Inspect `usePopover` state in React DevTools

### Styling Issues
- Check which CSS file controls that component
- Verify CSS class names match between component and CSS
- Use browser DevTools to inspect applied styles
- Check for CSS specificity conflicts

### TypeScript Errors
- Run `npm run build` to see all errors
- Check if types are imported correctly
- Verify prop types match between components
- Use `any` as last resort (but fix later)

## Next Steps / TODOs

If user asks "what should we work on next":

**Immediate Wins**:
- [ ] Deploy to Vercel + Railway
- [ ] Add mobile responsive design
- [ ] Add syntax highlighting for code blocks
- [ ] Add conversation export feature

**Medium Effort**:
- [ ] Implement double-click tooltip (original plan)
- [ ] Add conversation search
- [ ] Add dark/light theme toggle
- [ ] Add keyboard shortcuts

**Larger Projects**:
- [ ] Add user authentication
- [ ] Switch to database for chat history
- [ ] Add image generation/viewing
- [ ] Add voice input/output
- [ ] Multi-language support

## Quick Wins for Code Quality

- Add React component tests (Vitest + Testing Library)
- Add E2E tests (Playwright)
- Set up GitHub Actions for CI/CD
- Add error boundary component
- Add loading skeletons
- Improve accessibility (ARIA labels, keyboard nav)
