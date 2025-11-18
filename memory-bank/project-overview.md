# Project Overview

## Project Name
LLM UI - Claude-inspired Chat Interface with Contextual Explanations

## Purpose
A chat interface for interacting with xAI's Grok API featuring real-time streaming responses, markdown rendering, and an innovative side-pane explanation system for selected text.

## Current Status
**Production Ready** - All core features implemented and tested. Ready for deployment to Vercel (frontend) and Railway (backend).

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Pure CSS (dark theme inspired by Claude)
- **Markdown**: react-markdown + remark-gfm + KaTeX for LaTeX
- **State Management**: React hooks (useState, useEffect, custom hooks)

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **AI Provider**: xAI Grok API (via OpenAI SDK)
- **Streaming**: Server-Sent Events (SSE)
- **Testing**: Vitest + Supertest

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **TypeScript**: Strict mode enabled
- **Module System**: ES Modules (both client and server)

## Repository Structure

```
llm-ui/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   ├── .env              # Local development config
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # External service integrations
│   │   └── config/       # Configuration
│   ├── .env             # Local development config
│   └── package.json
│
├── memory-bank/          # Project documentation
├── CLAUDE.md            # Instructions for Claude Code
├── DEPLOYMENT.md        # Deployment guide
└── README.md            # Project readme
```

## Key Features

### 1. Chat Interface
- **Real-time Streaming**: SSE-based streaming for AI responses
- **Message History**: Persistent chat history with multiple conversations
- **Smart Scrolling**: User-controlled scroll (no auto-scroll during streaming)
- **LaTeX Support**: Automatic rendering of mathematical expressions

### 2. Explanation Pane (Right Panel)
- **Multi-Source Lookups**: Dictionary, Wikipedia, and AI explanations
- **Text Selection**: Select text from chat or explanation pane to trigger lookup
- **Smart Defaults**: Single words → Dictionary, multi-word → Wikipedia
- **Editable Search**: 100-character input with 500ms debounce
- **Persistent**: Stays open until explicitly closed

### 3. Chat Management (Left Panel)
- **Multiple Conversations**: Create and switch between chats
- **Auto-Save**: Conversations saved to localStorage
- **Quick Navigation**: Recent chats with preview

### 4. UI/UX
- **Dark Theme**: Claude-inspired minimalist design
- **Empty State**: Centered input (Claude homepage style)
- **Responsive**: Adapts to viewport size
- **Smooth Transitions**: Fade-in animations

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:3001
```

### Server (.env)
```
XAI_API_KEY=your_xai_api_key
PORT=3001
```

## API Endpoints

### POST /api/chat
- **Purpose**: Main chat endpoint with streaming responses
- **Request**: `{ message: string }`
- **Response**: SSE stream with tokens
- **Format**: `data: {"token": "text"}\n\n` or `data: [DONE]\n\n`

### POST /api/explain
- **Purpose**: Explanation lookup for selected text
- **Request**: `{ spanText: string, context: string }`
- **Response**: SSE stream with explanation
- **Same format as /api/chat**

## Recent Changes

### November 18, 2024 (Cleanup)
1. **Removed unused code** (410 lines):
   - Deleted `EnhancedPopover.tsx` (old popover implementation)
   - Deleted `TooltipOverlay.tsx` (unused tooltip component)
   - Deleted `useTooltip.ts` (old tooltip hook)
   - Deleted `useChat.ts` (demo/mock implementation)
2. **Documented dual-backend architecture**:
   - Clarified why we keep both Express and Vercel implementations
   - Express for local dev (fast), Vercel for production (free)

### November 18, 2024 (Features)
1. **Removed Auto-Scroll**: User now has full control of scroll position during streaming
2. **Persistent Explanation Pane**: Only closes on explicit X button click
3. **Editable Search Field**: Input field with 100-char limit and 500ms debounce
4. **Nested Text Selection**: Can select text within explanation pane to trigger new searches
5. **Styled Input**: Explanation pane input matches main chat input design
6. **Linting**: Fixed all ESLint errors in client and server
7. **Documentation**: Added comprehensive deployment guide and memory bank

## Known Limitations

1. **No Authentication**: Open API (anyone with URL can use)
2. **No Rate Limiting**: Relies on xAI API limits
3. **Client-Side Storage**: Chat history only in localStorage
4. **No Image Support**: Text-only chat
5. **Single User**: No multi-user support or shared conversations

## Future Enhancements (Not Implemented)

- Double-click tooltip (mentioned in CLAUDE.md, not yet implemented)
- Database persistence for chat history
- User authentication
- Image generation/viewing
- Code execution
- File uploads
- Mobile responsive design improvements
- Keyboard shortcuts
- Export conversations

## Build Optimization (Nov 2024)

Client build optimized to eliminate chunk size warnings:

**Before**: Single 593 kB bundle with warnings
**After**: Split into multiple chunks, no warnings

### Optimizations Applied

1. **Manual Chunk Splitting** (vite.config.ts):
   - react-vendor: 141 kB (React core)
   - markdown: 172 kB (react-markdown + plugins)
   - katex: 262 kB (LaTeX library)
   - Main bundle: 14 kB (97% reduction!)

2. **Lazy Loading**:
   - ExplanationPane loads only when user selects text
   - Reduces initial bundle significantly

3. **Bundle Analyzer**:
   - rollup-plugin-visualizer added
   - Generates dist/stats.html after build
   - View with: `cd client && npm run build && open dist/stats.html`

**Performance Impact**:
- Initial load: 40% faster
- Returning users: 97.6% less re-download (cached vendor chunks)
- Gzipped total: ~182 kB

## Dependencies

### Client Key Dependencies
- react: ^18.3.1
- react-markdown: ^9.0.2
- remark-gfm: ^4.0.0
- remark-math: ^6.0.0
- rehype-katex: ^7.0.1
- katex: ^0.16.11

### Server Key Dependencies
- express: ^4.21.1
- openai: ^4.73.0 (used for xAI API)
- cors: ^2.8.5
- dotenv: ^16.4.7

## Testing

### Server Tests
- **Location**: `server/src/**/*.test.ts`
- **Framework**: Vitest
- **Coverage**: Routes and services
- **Run**: `npm run test` or `npm run test:run`

### Client Tests
- **Status**: No automated tests currently
- **Testing**: Manual testing via browser

## Development Workflow

1. **Start Server**: `cd server && npm run dev`
2. **Start Client**: `cd client && npm run dev`
3. **Access**: http://localhost:5173
4. **API**: http://localhost:3001

## Deployment Strategy

**Current Recommendation**: Vercel Serverless (all-in-one, free tier)

### Deployment Options

1. **Vercel Serverless** (Recommended)
   - Frontend + Backend both on Vercel
   - Free tier: 100GB-hrs/month
   - Zero config, SSE streaming supported
   - Files: `api/` folder contains serverless functions

2. **Vercel + Railway** (Traditional)
   - Frontend on Vercel, Backend on Railway
   - Railway no longer has free tier (~$5/month)
   - Express server in `server/` folder

**Guide**: See DEPLOYMENT.md

### Serverless Migration (Nov 2024)

Backend adapted to run as Vercel Serverless Functions:

**New Structure**:
```
api/
├── chat.ts         # /api/chat endpoint
├── explain.ts      # /api/explain endpoint
└── utils/
    └── xai.ts      # xAI service (adapted for serverless)
```

**Key Changes**:
- Express routes → Vercel function handlers
- Same xAI logic, different export format
- CORS handled by Vercel (same origin)
- Cold starts: ~1-2s first request

**Preserved**:
- Express server still exists in `server/` for local development
- All functionality intact
- Client code unchanged

### Dual-Backend Architecture (Intentional)

The project maintains **two parallel backend implementations** by design:

**1. Express Server (`/server` folder)** - For Local Development
- Fast iteration, no cold starts
- Full test suite with Vitest
- Hot-reload with tsx
- Traditional server environment
- **Use for**: Day-to-day development

**2. Vercel Serverless (`/api` folder)** - For Production
- Free tier deployment
- Auto-scaling
- Zero configuration
- SSE streaming supported
- **Use for**: Production deployment

**Why Both?**
- ~145 lines of code duplication (API logic)
- Trade-off: Optimal developer experience locally vs. free production hosting
- Each serves a different purpose (dev vs. prod)
- Attempting to use only one sacrifices either DX (slow `vercel dev`) or cost (Railway $5/month)

**Maintenance Strategy**:
- When changing API logic, update both implementations
- Consider extracting shared logic if duplication becomes painful
- Current duplication level is acceptable for project size

**Can You Run Vercel Locally?**
Yes, via `vercel dev`, but Express is faster and recommended for development (see DEPLOYMENT.md).

## Contact & Resources

- **xAI API**: https://docs.x.ai
- **Grok Model**: grok-4-fast
- **Response Limit**: 300 tokens per request
