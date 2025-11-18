# LLM UI - Chat Interface with Contextual Explanations

A Claude-inspired chat interface for interacting with xAI's Grok API, featuring real-time streaming responses and an innovative explanation pane for contextual lookups.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 💬 Real-Time Streaming Chat
- Server-Sent Events (SSE) for token-by-token streaming
- Markdown rendering with GitHub-flavored syntax
- LaTeX math equation support via KaTeX
- User-controlled scrolling (no auto-scroll during streaming)

### 🔍 Explanation Pane
- **Select text** from chat messages to get instant explanations
- **Three sources**: Dictionary, Wikipedia, and AI-powered explanations
- **Smart defaults**: Single words use Dictionary, phrases use Wikipedia
- **Nested selection**: Select text within explanations for deeper exploration
- **Editable search**: Manual search with 100-character limit and debouncing

### 💾 Chat Management
- Multiple conversation support
- Persistent history via localStorage
- Quick switching between chats
- Auto-save functionality

### 🎨 Modern UI
- Dark theme inspired by Claude
- Smooth transitions and animations
- Clean, minimal design
- Three-column layout (chat list, messages, explanations)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- xAI API key ([Get one here](https://console.x.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-ui
   ```

2. **Install dependencies**
   ```bash
   # Install both client and server dependencies
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment variables**

   **Server** (`server/.env`):
   ```bash
   XAI_API_KEY=your_xai_api_key_here
   PORT=3001
   ```

   **Client** (`client/.env`):
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

4. **Start development servers**

   **Terminal 1 - Backend**:
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend**:
   ```bash
   cd client
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
llm-ui/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatView.tsx           # Main app layout
│   │   │   ├── MessageBubble.tsx      # Chat messages
│   │   │   ├── ChatInput.tsx          # Message input
│   │   │   ├── ExplanationPane.tsx    # Right-side lookup pane
│   │   │   └── LeftPane.tsx           # Chat history sidebar
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useChatAPI.ts          # Chat logic + SSE streaming
│   │   │   ├── usePopover.ts          # Explanation pane logic
│   │   │   └── useChatManager.ts      # Chat history management
│   │   ├── styles/             # CSS files
│   │   ├── utils/              # Utility functions
│   │   └── types.ts            # TypeScript types
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.ts                # API endpoints (/api/chat, /api/explain)
│   │   ├── services/
│   │   │   └── xai.ts                 # xAI Grok integration
│   │   ├── config/
│   │   │   └── env.ts                 # Environment config
│   │   └── index.ts                   # Express server setup
│   └── package.json
│
├── memory-bank/                 # Project documentation for context
│   ├── project-overview.md            # High-level overview
│   ├── architecture.md                # System architecture
│   ├── feature-details.md             # Implementation details
│   └── quick-reference.md             # Quick reference guide
│
├── CLAUDE.md                    # Instructions for Claude Code
├── DEPLOYMENT.md                # Deployment guide (Vercel + Railway)
└── README.md                    # This file
```

## 🎯 Usage

### Basic Chat
1. Type your message in the input box
2. Press Enter or click the send button
3. Watch the AI response stream in real-time

### Explanation Lookup
1. **Select text** in any AI response
2. The explanation pane opens automatically
3. View results from Dictionary, Wikipedia, or AI
4. **Select text within explanations** to dig deeper
5. **Edit the search** to look up custom terms

### Managing Conversations
1. Click the **[+]** button to start a new chat
2. Click on any previous chat to switch to it
3. All conversations auto-save to your browser

## 🛠️ Development

### Available Scripts

#### Client
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting errors
```

#### Server
```bash
npm run dev        # Start with hot-reload (tsx)
npm run build      # Compile TypeScript
npm start          # Run production build
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Run tests with UI
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting errors
```

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite (build tool)
- react-markdown + remark-gfm
- KaTeX (LaTeX rendering)
- Pure CSS (no framework)

**Backend**
- Express + TypeScript
- OpenAI SDK (for xAI API)
- Server-Sent Events (SSE)
- Vitest (testing)

## 🚢 Deployment

### Option 1: Vercel All-in-One (Recommended) ⚡

Deploy **both frontend and backend** to Vercel using serverless functions. **Zero cost, zero config!**

See **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** for detailed instructions.

**Quick Deploy**:
1. Push to GitHub
2. Import to Vercel
3. Add `XAI_API_KEY` environment variable
4. Deploy! ✨

**Benefits**:
- Everything in one place
- Free tier (100GB-hrs/month)
- SSE streaming supported
- Global edge network

### Option 2: Vercel + Railway (Traditional)

Deploy frontend to Vercel and backend to Railway separately.

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions.

**Quick Deploy**:

1. **Backend to Railway**:
   - Connect GitHub repo
   - Set root directory: `server`
   - Add `XAI_API_KEY` environment variable
   - Deploy

2. **Frontend to Vercel**:
   - Connect GitHub repo
   - Set root directory: `client`
   - Add `VITE_API_URL` with Railway URL
   - Deploy

**Note**: Railway no longer offers a free tier.

## 🧪 Testing

Server includes comprehensive tests:

```bash
cd server
npm run test:run     # Run all tests
npm run test:ui      # Run with UI
```

Current test coverage:
- ✅ xAI service integration
- ✅ Chat route handlers
- ✅ SSE streaming
- ✅ Error handling

## 📖 API Documentation

### POST /api/chat
Main chat endpoint with streaming responses.

**Request**:
```json
{
  "message": "Explain quantum computing"
}
```

**Response**: SSE stream
```
data: {"token": "Quantum"}

data: {"token": " computing"}

data: [DONE]
```

### POST /api/explain
Contextual explanation endpoint.

**Request**:
```json
{
  "spanText": "quantum entanglement",
  "context": "In quantum computing, quantum entanglement..."
}
```

**Response**: SSE stream (same format as /api/chat)

## 🎨 Customization

### Changing the AI Model

Edit `server/src/services/xai.ts`:
```typescript
const completion = await openai.chat.completions.create({
  model: "grok-4-fast",  // Change this
  messages,
  stream: true,
  max_tokens: 300,       // Adjust as needed
});
```

### Styling

All styles are in `client/src/styles/`:
- `app.css` - Main layout and chat
- `explanation-pane.css` - Right panel
- `left-pane.css` - Chat history
- `message.css` - Message bubbles

### Adding New Explanation Sources

1. Add new tab in `client/src/components/ExplanationPane.tsx`
2. Add fetch function in `client/src/hooks/usePopover.ts`
3. Update tab data structure

## 🔐 Environment Variables

### Client
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |

### Server
| Variable | Description | Required |
|----------|-------------|----------|
| `XAI_API_KEY` | xAI API key | ✅ Yes |
| `PORT` | Server port | No (defaults to 3001) |
| `NODE_ENV` | Environment | No (defaults to development) |

## 🐛 Troubleshooting

### Streaming doesn't work
- Check Network tab for SSE connection
- Verify `XAI_API_KEY` is set correctly
- Check server logs for API errors

### Explanation pane not opening
- Ensure text is actually selected (not just clicked)
- Check browser console for errors
- Verify external APIs are accessible (Dictionary, Wikipedia)

### Build errors
- Delete `node_modules` and run `npm install` again
- Check Node.js version (18+ required)
- Run `npm run lint:fix` to fix linting errors

## 📚 Additional Resources

- [xAI API Documentation](https://docs.x.ai)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express Documentation](https://expressjs.com)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Claude](https://claude.ai)'s clean interface
- Powered by [xAI's Grok](https://x.ai) API
- Dictionary data from [Free Dictionary API](https://dictionaryapi.dev)
- Wikipedia summaries from [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the [memory-bank/](memory-bank/) documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

---

**Built with ❤️ using React, TypeScript, and xAI Grok**
