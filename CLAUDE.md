# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude-inspired chat interface for interacting with xAI's Grok API. Features real-time streaming responses, markdown rendering, and a clean minimal design.

**Tech Stack:**
- Client: React 18 + TypeScript + Vite + react-markdown
- Server: Express + TypeScript + xAI (Grok) API via OpenAI SDK
- Communication: Server-Sent Events (SSE) for streaming responses

**Note:** Double-click tooltip feature planned for future iteration.

## Development Commands

### Server (Express)
```bash
cd server
npm install                # Install dependencies
npm run dev               # Start dev server with hot-reload (tsx)
npm run build             # Compile TypeScript to dist/
npm start                 # Run production build
npm run test              # Run vitest in watch mode
npm run test:run          # Run tests once
npm run test:ui           # Run vitest with UI
npm run lint              # Check code quality
npm run lint:fix          # Auto-fix linting issues
```

### Client (React + Vite)
```bash
cd client
npm install               # Install dependencies
npm run dev              # Start Vite dev server
npm run build            # TypeScript compile + production build
npm run preview          # Preview production build
npm start                # Build and preview
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
```

## Environment Setup

**Server** (`server/.env`):
```
XAI_API_KEY=your_xai_api_key_here
PORT=3001
```

**Client** (`client/.env`):
```
VITE_API_URL=http://localhost:3001
```

## Architecture

### Request Flow: Chat Message to AI Response

1. **User Input**: User types message in `ChatInput.tsx`, presses Enter
2. **Send Message**: `useChatAPI.ts` hook adds user message to state
3. **API Request**: POST to `/api/chat` with message text (sent as both `spanText` and `context`)
4. **SSE Stream**: `server/src/routes/chat.ts` opens SSE connection
5. **xAI Integration**: `server/src/services/xai.ts` streams from Grok-4-fast model
6. **Client Streaming**: `useChatAPI.ts` reads SSE stream, accumulates tokens
7. **UI Update**: `MessageBubble.tsx` displays streaming AI response with markdown rendering

### Key Files

**Server:**
- `src/index.ts` - Express app setup, CORS, routes
- `src/routes/chat.ts` - `/api/chat` endpoint with SSE streaming
- `src/services/xai.ts` - xAI Grok integration using OpenAI SDK
- `src/config/env.ts` - Environment variable loading

**Client:**
- `src/hooks/useChatAPI.ts` - Chat state management, message sending, SSE streaming
- `src/hooks/useTooltip.ts` - (Reserved for future popover feature)
- `src/components/ChatInput.tsx` - Multiline textarea input with send button
- `src/components/MessageBubble.tsx` - Individual message with user/AI styling, markdown rendering
- `src/components/ChatView.tsx` - Main chat interface with empty/chat states
- `src/App.tsx` - Minimal application wrapper

### Important Implementation Details

**SSE Response Format** (`server/src/routes/chat.ts`):
```
data: {"token": "text chunk"}\n\n
data: [DONE]\n\n
data: {"error": "message"}\n\n
```

**xAI Service**: Uses OpenAI SDK with custom baseURL (`https://api.x.ai/v1`), model `grok-4-fast`, max 300 tokens per explanation

**Chat Interface States**:
- Empty state: Centered container with input (like Claude homepage)
- Chat state: Messages scrollable area + fixed input at bottom

**Markdown Rendering**: AI responses rendered with `react-markdown` + `remark-gfm` for GitHub-flavored markdown

**Streaming UI**: Real-time token streaming with typing indicator animation during AI response

**Input Handling**: Multiline textarea with auto-resize, Enter to send, Shift+Enter for new line

**Abort Controllers**: Message requests use AbortController to cancel in-flight requests

**Module System**: Both client and server use ES modules (`"type": "module"` in package.json)

## Testing

Server uses **vitest** with **supertest** for API testing:
- Unit tests: `src/services/xai.test.ts`
- Integration tests: `src/routes/chat.integration.test.ts`
- Route tests: `src/routes/chat.test.ts`

Run single test file:
```bash
cd server
npx vitest run src/routes/chat.test.ts
```

## Common Patterns

**TypeScript Module Imports**: Always use `.js` extension for local imports in server code (TypeScript with ES modules requirement)
```typescript
import chatRouter from "./routes/chat.js";
```

**Environment Variables**: Access via `import.meta.env` in client, `process.env` in server after dotenv configuration
