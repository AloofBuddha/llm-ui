# LLM UI - Chat Interface with Contextual Explanations

A Claude-inspired chat interface for interacting with xAI's Grok API, featuring real-time streaming responses and an innovative explanation pane for contextual lookups.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-black)](https://vercel.com/)
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
- Vercel CLI (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-ui
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (API functions)
   npm install

   # Install client dependencies
   cd client && npm install
   cd ..
   ```

3. **Set up environment variables**

   **Root** (`.env`):
   ```bash
   XAI_API_KEY=your_xai_api_key_here
   ```

   **Client** (`client/.env`) - *Optional, for standalone client dev*:
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

4. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

5. **Start development server**
   ```bash
   npm run dev
   # This runs 'vercel dev' which starts both client and API locally
   # Client: http://localhost:3000
   # API: http://localhost:3000/api/*
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser

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
├── api/                         # Vercel serverless functions
│   ├── chat.ts                         # /api/chat endpoint (SSE streaming)
│   ├── explain.ts                      # /api/explain endpoint (SSE streaming)
│   └── utils/
│       └── xai.ts                      # xAI Grok integration (shared logic)
│
├── memory-bank/                 # Project documentation for context
│   ├── project-overview.md            # High-level overview
│   ├── architecture.md                # System architecture
│   ├── feature-details.md             # Implementation details
│   └── quick-reference.md             # Quick reference guide
│
├── vercel.json                  # Vercel deployment configuration
├── CLAUDE.md                    # Instructions for Claude Code
├── DEPLOYMENT.md                # Deployment guide (Vercel)
├── package.json                 # Root package (API dependencies)
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

#### Root (Development)
```bash
npm run dev        # Start Vercel dev server (client + API)
npm run build      # Build client for production
```

#### Client
```bash
cd client
npm run dev        # Start Vite dev server (standalone)
npm run build      # Build for production
npm run preview    # Preview production build
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
- Vercel Serverless Functions
- OpenAI SDK (for xAI API)
- Server-Sent Events (SSE)
- TypeScript

## 🚢 Deployment

Deployed to **Vercel** using serverless functions. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete guide.

### Quick Deploy to Vercel ⚡

1. **Push to GitHub**
   ```bash
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variable**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add `XAI_API_KEY` with your xAI API key
   - Set for "Production" environment

4. **Deploy**
   - Vercel automatically deploys on every push to main branch
   - View your live site at your Vercel URL

**Benefits**: Everything in one place • Free tier • SSE streaming • No CORS • Auto-deploy on push

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions.

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

Edit `api/utils/xai.ts`:
```typescript
const stream = await client.chat.completions.create({
  model: "grok-4-fast-reasoning",  // Change this
  stream: true,
  messages,
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

### Root (API Functions)
| Variable | Description | Required |
|----------|-------------|----------|
| `XAI_API_KEY` | xAI API key | ✅ Yes |

### Client (Optional)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API URL for standalone dev | `""` (uses same-origin) |

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
