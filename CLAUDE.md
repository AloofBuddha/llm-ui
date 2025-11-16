# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI User Experience experiment featuring a chat interface with double-click tooltips. When users double-click phrases in chat messages, the app fetches contextual explanations from xAI's Grok API via server-sent events (SSE) streaming.

**Tech Stack:**
- Client: React 18 + TypeScript + Vite
- Server: Express + TypeScript + xAI (Grok) API via OpenAI SDK
- Communication: Server-Sent Events (SSE) for streaming responses

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

### Request Flow: Double-Click to Tooltip

1. **User Interaction**: User double-clicks text in `MessageBubble.tsx`
2. **Hook Activation**: `useTooltip.ts` calls `lookup(spanText, context)`
3. **API Request**: POST to `/api/chat` with selected text and surrounding context
4. **SSE Stream**: `server/src/routes/chat.ts` opens SSE connection
5. **xAI Integration**: `server/src/services/xai.ts` streams from Grok-4-fast model
6. **Client Streaming**: `useTooltip.ts` reads SSE stream, accumulates tokens
7. **UI Update**: `TooltipOverlay.tsx` displays streaming explanation

### Key Files

**Server:**
- `src/index.ts` - Express app setup, CORS, routes
- `src/routes/chat.ts` - `/api/chat` endpoint with SSE streaming
- `src/services/xai.ts` - xAI Grok integration using OpenAI SDK
- `src/config/env.ts` - Environment variable loading

**Client:**
- `src/hooks/useTooltip.ts` - Tooltip state management, SSE parsing, abort handling
- `src/hooks/useChat.ts` - Chat message state management
- `src/components/TooltipOverlay.tsx` - Tooltip UI component
- `src/components/MessageBubble.tsx` - Individual message with double-click handling
- `src/components/ChatView.tsx` - Main chat interface

### Important Implementation Details

**SSE Response Format** (`server/src/routes/chat.ts`):
```
data: {"token": "text chunk"}\n\n
data: [DONE]\n\n
data: {"error": "message"}\n\n
```

**xAI Service**: Uses OpenAI SDK with custom baseURL (`https://api.x.ai/v1`), model `grok-4-fast`, max 300 tokens per explanation

**Abort Controllers**: Client-side tooltip lookups use AbortController to cancel in-flight requests when new lookups start

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
