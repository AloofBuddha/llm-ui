# Architecture Documentation

## System Architecture

**Deployment**: Vercel Serverless (no separate backend server)

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (Vite)                  │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   Left   │  │    Chat      │  │   Explanation   │ │ │
│  │  │   Pane   │  │    Main      │  │      Pane       │ │ │
│  │  │ (Chats)  │  │ (Messages)   │  │  (Dictionary/   │ │ │
│  │  │          │  │              │  │  Wiki/AI)       │ │ │
│  │  └──────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                                        │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │         Custom Hooks Layer                     │   │ │
│  │  │  - useChatAPI (messaging)                      │   │ │
│  │  │  - usePopover (explanations)                   │   │ │
│  │  │  - useChatManager (history)                    │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           │ HTTP/SSE (same-origin)           │
│                           ▼                                  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ No CORS needed
                            │
┌───────────────────────────▼───────────────────────────────────┐
│              Vercel Serverless Functions                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  API Functions                         │  │
│  │  - api/chat.ts         (main chat)                     │  │
│  │  - api/explain.ts      (explanations)                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │              Shared Utils                              │  │
│  │  - api/utils/xai.ts (Grok API integration)             │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
                   ┌──────────────────────────┐
                   │    xAI Grok API          │
                   │  (grok-4-fast-reasoning) │
                   └──────────────────────────┘
```

**Key Architectural Change** (as of 2025):
- **Removed**: Separate Express server
- **Now**: Vercel serverless functions for API
- **Local Dev**: `vercel dev` runs both client and API locally
- **Production**: Single Vercel deployment, no CORS needed

## Data Flow

### 1. Chat Message Flow

```
User types message
      │
      ▼
ChatInput component
      │
      ▼
useChatAPI.sendMessage()
      │
      ├─> Add user message to state (optimistic update)
      │
      ├─> Create placeholder AI message
      │
      ▼
POST /api/chat
      │
      ▼
api/chat.ts (serverless function)
      │
      ├─> Validate request
      │
      ▼
xaiService.streamExplanation()
      │
      ├─> Build prompt with context
      │
      ├─> Call OpenAI SDK (xAI base URL)
      │
      ▼
SSE stream chunks back to client
      │
      ├─> data: {"token": "Hello"}\n\n
      ├─> data: {"token": " world"}\n\n
      ├─> data: [DONE]\n\n
      │
      ▼
useChatAPI accumulates tokens
      │
      ├─> Update AI message incrementally (throttled 100ms)
      │
      ▼
MessageBubble re-renders with new content
      │
      ▼
react-markdown renders markdown + LaTeX
```

### 2. Explanation Lookup Flow

```
User selects text (mouseup event)
      │
      ▼
MessageBubble.handleTextSelection()
      │
      ▼
popover.showPopover(selectedText, context)
      │
      ├─> Determine default tab (1 word = dict, >1 = wiki)
      │
      ├─> Set pane visible
      │
      ├─> Fetch data for default tab
      │
      ▼
Tab-specific API call:
      │
      ├─> Dictionary: Free Dictionary API
      │      https://api.dictionaryapi.dev/api/v2/entries/en/{word}
      │
      ├─> Wikipedia: Wikipedia REST API
      │      https://en.wikipedia.org/api/rest_v1/page/summary/{term}
      │
      └─> AI: POST /api/explain (SSE stream)
            │
            ▼
      api/explain.ts (serverless function)
            │
            ▼
      xaiService.streamExplanation()
            │
            ▼
      SSE stream back to client
            │
            ▼
      usePopover.fetchAI() accumulates response
            │
            ▼
      ExplanationPane displays result
```

### 3. Debounced Search Flow

```
User types in explanation pane input
      │
      ▼
ExplanationPane.handleSearchTextChange()
      │
      ├─> Update local state (immediate)
      │
      ├─> Clear existing debounce timer
      │
      ├─> Set new timer (500ms)
      │
      │   [User continues typing...]
      │   [Timer resets each keystroke]
      │
      └─> After 500ms of no typing:
            │
            ▼
      popover.updateSearchText(newText)
            │
            ├─> Reset all tab data
            │
            └─> Re-fetch active tab with new search
```

## Component Hierarchy

```
App
 └── ChatView
      ├── LeftPane
      │    └── Chat list items
      │
      ├── ChatMain (or EmptyState)
      │    ├── MessagesContainer
      │    │    └── MessageBubble[] (user/AI messages)
      │    │         └── ReactMarkdown (for AI messages)
      │    │
      │    └── ChatInputFixed
      │         └── ChatInput (textarea + send button)
      │
      └── ExplanationPane
           ├── Header (editable search input + close button)
           ├── Tabs (Dictionary / Wikipedia / AI)
           └── Body
                ├── DictionaryTab
                ├── WikipediaTab
                └── AITab
```

## State Management

### Local Component State
- **ChatInput**: Input text, textarea height
- **ExplanationPane**: Local debounced text

### Custom Hook State
- **useChatAPI**: messages[], isLoading, error
- **usePopover**: selectedText, activeTab, tabData, isVisible
- **useChatManager**: chats[], activeChat

### Persistent State
- **localStorage**:
  - `chat-history`: Array of saved chats
  - Key: `chat-history`
  - Structure: `{ id, messages[], timestamp }`

## API Request/Response Formats

### POST /api/chat

**Request:**
```json
{
  "message": "Explain quantum computing"
}
```

**Response (SSE stream):**
```
data: {"token": "Quantum"}

data: {"token": " computing"}

data: {"token": " is"}

data: [DONE]
```

### POST /api/explain

**Request:**
```json
{
  "spanText": "quantum entanglement",
  "context": "In quantum computing, quantum entanglement is a key resource..."
}
```

**Response (SSE stream):**
```
data: {"token": "Quantum"}

data: {"token": " entanglement"}

data: [DONE]
```

## External API Integrations

### 1. xAI Grok API
- **Base URL**: https://api.x.ai/v1
- **Model**: grok-4-fast
- **Max Tokens**: 300
- **Streaming**: Yes (via OpenAI SDK)
- **Authentication**: Bearer token in header

### 2. Dictionary API
- **Endpoint**: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
- **Method**: GET
- **Rate Limit**: None (free tier)
- **Response**: JSON with definitions, phonetics, examples

### 3. Wikipedia API
- **Endpoint**: https://en.wikipedia.org/api/rest_v1/page/summary/{term}
- **Method**: GET
- **Rate Limit**: None specified
- **Response**: JSON with title, extract, thumbnail, page URL

## Error Handling

### Client-Side
1. **API Errors**: Display error message below input
2. **Network Errors**: Show "Failed to fetch" message
3. **Abort**: Cancel in-flight requests on new message
4. **SSE Errors**: Parse errors silently ignored (for incomplete chunks)

### Server-Side
1. **Missing API Key**: Return 500 with error message
2. **xAI API Errors**: Forward error to client via SSE
3. **Invalid Request**: Return 400 with validation message
4. **Stream Errors**: Send error in SSE format

## Performance Optimizations

### 1. Throttled Updates
- **Where**: useChatAPI streaming
- **Interval**: 100ms
- **Why**: Prevent excessive React re-renders during fast streaming

### 2. Debounced Input
- **Where**: ExplanationPane search
- **Delay**: 500ms
- **Why**: Avoid API calls on every keystroke

### 3. Lazy Tab Loading
- **Where**: ExplanationPane tabs
- **Strategy**: Only fetch data when tab is activated
- **Why**: Don't load all 3 APIs for every selection

### 4. Abort Controllers
- **Where**: All API calls
- **Strategy**: Cancel previous request when new one starts
- **Why**: Prevent race conditions and wasted bandwidth

## Security Considerations

### Current Security Posture
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ✅ No API key exposure to client
- ✅ HTTPS in production (via Vercel/Railway)
- ❌ No rate limiting (relies on xAI limits)
- ❌ No authentication
- ❌ No input sanitization (markdown rendering handles most XSS)

### Potential Vulnerabilities
1. **Open API**: Anyone can use if they find the URL
2. **XSS**: Markdown could potentially render malicious content
3. **API Key Exposure**: Only protected by server-side env vars
4. **DoS**: No rate limiting on endpoints

### Recommendations for Production
1. Add rate limiting (express-rate-limit)
2. Implement user authentication
3. Add input validation/sanitization
4. Set up API key rotation
5. Add request logging for monitoring
6. Implement CSRF protection if adding forms
