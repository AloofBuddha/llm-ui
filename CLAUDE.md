# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude-inspired chat interface for interacting with xAI's Grok API. Features real-time streaming responses, markdown rendering, and a clean minimal design.

**Tech Stack:**
- Client: React 18 + TypeScript + Vite + react-markdown
- API: Vercel Serverless Functions + xAI (Grok) API via OpenAI SDK
- Communication: Server-Sent Events (SSE) for streaming responses
- Local Development: Vercel CLI (`vercel dev`)

**Note:** Double-click tooltip feature planned for future iteration.

## Development Commands

### Local Development (Recommended)
```bash
# Root directory
npm install               # Install root dependencies
cd client && npm install  # Install client dependencies
cd ..

npm run dev              # Start Vercel dev server (runs API + client)
                         # Client: http://localhost:3000
                         # API: http://localhost:3000/api/*
```

**Important:** Use `vercel dev` for local development to run both the client and API functions locally. This ensures your development environment matches production.

### Client Only
```bash
cd client
npm run dev              # Start Vite dev server (port 5173)
npm run build            # TypeScript compile + production build
npm run preview          # Preview production build
npm start                # Build and preview
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
```

## Environment Setup

**Root** (`.env`):
```
XAI_API_KEY=your_xai_api_key_here
```

**Client** (`client/.env`):
```
VITE_API_URL=http://localhost:3001
```

**Note:** The client's `VITE_API_URL` is only used when running the client independently. When using `npm run dev` (vercel dev), the API is available at the same origin.

## Architecture

### Request Flow: Chat Message to AI Response

1. **User Input**: User types message in `ChatInput.tsx`, presses Enter
2. **Send Message**: `useChatAPI.ts` hook adds user message to state
3. **API Request**: POST to `/api/chat` with message text
4. **SSE Stream**: `api/chat.ts` serverless function opens SSE connection
5. **xAI Integration**: `api/utils/xai.ts` streams from Grok-4-fast-reasoning model
6. **Client Streaming**: `useChatAPI.ts` reads SSE stream, accumulates tokens
7. **UI Update**: `MessageBubble.tsx` displays streaming AI response with markdown rendering

### Key Files

**API (Serverless Functions):**
- `api/chat.ts` - `/api/chat` endpoint with SSE streaming (Vercel function)
- `api/explain.ts` - `/api/explain` endpoint with SSE streaming (Vercel function)
- `api/utils/xai.ts` - xAI Grok integration using OpenAI SDK (shared logic)

**Client:**
- `src/hooks/useChatAPI.ts` - Chat state management, message sending, SSE streaming
- `src/hooks/usePopover.ts` - Popover feature for text explanations
- `src/components/ChatInput.tsx` - Multiline textarea input with send button
- `src/components/MessageBubble.tsx` - Individual message with user/AI styling, markdown rendering
- `src/components/ChatView.tsx` - Main chat interface with empty/chat states
- `src/App.tsx` - Minimal application wrapper

### Important Implementation Details

**SSE Response Format** (`api/chat.ts`, `api/explain.ts`):
```
data: {"token": "text chunk"}\n\n
data: [DONE]\n\n
data: {"error": "message"}\n\n
```

**xAI Service**: Uses OpenAI SDK with custom baseURL (`https://api.x.ai/v1`), model `grok-4-fast-reasoning`, max 150 tokens for explanations

**Chat Interface States**:
- Empty state: Centered container with input (like Claude homepage)
- Chat state: Messages scrollable area + fixed input at bottom

**Markdown Rendering**: AI responses rendered with `react-markdown` + `remark-gfm` for GitHub-flavored markdown

**Streaming UI**: Real-time token streaming with typing indicator animation during AI response

**Input Handling**: Multiline textarea with auto-resize, Enter to send, Shift+Enter for new line

**Abort Controllers**: Message requests use AbortController to cancel in-flight requests

**Module System**: Both client and API use ES modules (`"type": "module"` in package.json)

## Testing

Currently no automated tests. Previous Express server had vitest tests but were removed when migrating to Vercel serverless architecture.

## Common Patterns

**TypeScript Module Imports**: Always use `.js` extension for local imports in API functions (TypeScript with ES modules requirement)
```typescript
import { streamChat } from "./utils/xai.js";
```

**Environment Variables**:
- Client: Access via `import.meta.env.VITE_*`
- API Functions: Access via `process.env.*`

**API URL Resolution**:
- Development (using `vercel dev`): Same-origin at `http://localhost:3000/api/*`
- Production: Same-origin at your Vercel domain `/api/*`
- Client independently: Uses `VITE_API_URL` from `.env` (http://localhost:3001)
