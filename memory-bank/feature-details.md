# Feature Implementation Details

## Core Features

### 1. Real-Time Streaming Chat

**Implementation**: Server-Sent Events (SSE)

**File**: `client/src/hooks/useChatAPI.ts`

**Key Points**:
- Uses native Fetch API with `response.body.getReader()`
- Streams tokens from server as they arrive
- Accumulates content incrementally
- Throttles UI updates to 100ms intervals to prevent excessive re-renders
- Handles incomplete JSON chunks gracefully

**Code Pattern**:
```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  // Process complete lines from buffer
}
```

**SSE Message Format**:
```
data: {"token": "text chunk"}\n\n
data: [DONE]\n\n
```

---

### 2. Explanation Pane System

**Implementation**: Multi-source lookup with smart defaults

**Files**:
- `client/src/hooks/usePopover.ts`
- `client/src/components/ExplanationPane.tsx`

**Key Points**:
- **Smart Default**: Single word → Dictionary, Multiple words → Wikipedia
- **Lazy Loading**: Only fetches data when tab is activated
- **Fallback Chain**: Dictionary fails → Wikipedia → AI
- **Persistent**: Stays open until explicit close (X button)
- **Editable Search**: User can manually edit and search

**Tab Data Structure**:
```typescript
{
  dictionary: { data: null | DictionaryEntry[], loading: boolean, error: string | null },
  wikipedia: { data: null | WikipediaData, loading: boolean, error: string | null },
  ai: { data: string, loading: boolean, error: string | null }
}
```

**Selection Flow**:
1. User selects text in MessageBubble
2. `onMouseUp` event fires
3. `handleTextSelection()` gets selected text
4. `popover.showPopover(text, context, position)` called
5. Smart default tab determined based on word count
6. Initial data fetch triggered for default tab

---

### 3. Debounced Search Input

**Implementation**: Controlled input with timer-based debounce

**File**: `client/src/components/ExplanationPane.tsx`

**Key Points**:
- **Local State**: Immediate UI update (`localText`)
- **Debounce Timer**: 500ms delay before API call
- **Timer Management**: Clears previous timer on each keystroke
- **Character Limit**: 100 characters max
- **Sync with Props**: Updates when `selectedText` changes externally

**Code Pattern**:
```typescript
const [localText, setLocalText] = useState(selectedText);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

const handleChange = (e) => {
  const newText = e.target.value;
  setLocalText(newText);  // Immediate UI update

  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  debounceTimerRef.current = setTimeout(() => {
    updateSearchText(newText);  // API call after 500ms
  }, 500);
};
```

---

### 4. Nested Text Selection

**Implementation**: Same selection handler on both chat and explanation pane

**Files**:
- `client/src/components/MessageBubble.tsx` (line 25-50)
- `client/src/components/ExplanationPane.tsx` (line 48-54)

**Key Points**:
- `onMouseUp` event on both chat messages and explanation content
- Both trigger `popover.updateSearchText()` or `popover.showPopover()`
- Allows user to explore related terms recursively
- Selection in explanation pane updates search immediately (no debounce for selection)

**User Flow**:
```
Chat: "quantum entanglement"
  → Select "entanglement"
    → Shows Dictionary/Wikipedia/AI for "entanglement"
      → In explanation, select "quantum state"
        → Shows results for "quantum state"
```

---

### 5. User-Controlled Scrolling

**Implementation**: Removed auto-scroll behavior

**File**: `client/src/components/ChatView.tsx`

**What Was Removed** (lines 20-23):
```typescript
// REMOVED:
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [displayMessages]);
```

**Why**:
- Auto-scroll fights user's scroll position during streaming
- User can't read previous messages while AI responds
- Breaking change from typical chat UX, but better for reading long responses

**Current Behavior**:
- Messages container grows downward
- Scroll position stays exactly where user left it
- User can manually scroll to bottom if desired
- No jumping or fighting during streaming

---

### 6. Chat History Management

**Implementation**: localStorage persistence with multi-chat support

**File**: `client/src/hooks/useChatManager.ts`

**Key Points**:
- Saves conversations to `localStorage` under `chat-history` key
- Each chat has unique ID (timestamp-based)
- Auto-saves on message changes (debounced via useEffect)
- Loads all chats on mount
- Provides `createNewChat()`, `selectChat()`, `deleteChat()` methods

**Data Structure**:
```typescript
interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Storage**:
```javascript
localStorage.setItem('chat-history', JSON.stringify(chats));
```

---

### 7. LaTeX Rendering

**Implementation**: Automatic LaTeX detection and wrapping

**Files**:
- `client/src/utils/fixLatex.ts` (preprocessing)
- `client/src/components/MessageBubble.tsx` (rendering)

**Libraries**:
- `remark-math`: Parse LaTeX in markdown
- `rehype-katex`: Render LaTeX with KaTeX
- `katex`: Math typesetting library

**Auto-Wrapping Logic**:
Detects bare LaTeX commands like `\mathcal{C}` and wraps them with `$...$` delimiters for proper rendering.

**Supported Commands**:
- Math fonts: `\mathcal`, `\mathbb`, `\mathbf`, etc.
- Operators: `\frac`, `\sqrt`, `\sum`, `\int`, `\lim`
- Symbols: `\alpha`, `\beta`, `\gamma`, `\pi`, `\sigma`
- Arrows: `\rightarrow`, `\to`, `\mapsto`
- Relations: `\in`, `\subset`, `\leq`, `\geq`

**Code Pattern**:
```typescript
const fixedText = fixLatex(text);

<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {fixedText}
</ReactMarkdown>
```

---

### 8. Theme & Styling

**Implementation**: Pure CSS with dark theme

**Files**: `client/src/styles/*.css`

**Design Principles**:
- **Color Palette**:
  - Background: `#1a1a1a` (dark charcoal)
  - Surface: `#2d2d2d` (lighter charcoal)
  - Border: `#3d3d3d` (subtle borders)
  - Text: `#e8e8e8` (off-white)
  - Accent: `#ff6b4a` (coral/orange)

- **Typography**:
  - System fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", ...`
  - Font size: 15px (base)
  - Line height: 1.7 (readable)

- **Layout**:
  - 3-column: Left pane (240px) | Main (flex) | Right pane (400px)
  - Empty state: Centered with max-width 750px
  - Chat state: Messages centered, max-width 750px

- **Animations**:
  - Fade-in: 0.3s ease-in
  - Transition to chat: 0.6s ease-out
  - Typing indicator: Pulsing dots

**Responsive Behavior**:
- Currently optimized for desktop (1280px+)
- Mobile responsiveness not fully implemented

---

## UI States

### Empty State (No Messages)
```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│     How can I help you today?         │
│                                        │
│     [___________________________]      │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

**Characteristics**:
- Centered container
- Large heading
- Prominent input
- No left/right panes visible

### Chat State (With Messages)
```
┌──────┬────────────────────────┬─────────┐
│      │                        │         │
│ Chat │  User: Hello           │ Expla-  │
│ List │  AI: Hi there! How...  │ nation  │
│      │                        │ Pane    │
│ [+]  │  [____________] [↑]    │ (Dict)  │
└──────┴────────────────────────┴─────────┘
```

**Characteristics**:
- 3-column layout
- Left pane: Chat history
- Center: Messages + fixed input
- Right pane: Explanations (when active)

### Streaming State
```
AI: The concept of quantum e...▊
```

**Characteristics**:
- Typing indicator (3 animated dots)
- Incremental text appears
- Input disabled
- User can still scroll

---

## Error Handling

### 1. Network Errors
**Display**: Error banner above input
```
┌─────────────────────────────────┐
│ ⚠ Failed to connect to server  │
│                         [Dismiss]│
└─────────────────────────────────┘
```

### 2. API Errors
**SSE Format**:
```
data: {"error": "Invalid API key"}
```

**Handling**: Show in error banner, remove failed AI message

### 3. Missing Dictionary/Wikipedia
**Display**: Fallback to next available tab
- Dictionary fails → Try Wikipedia
- Wikipedia fails → Try AI
- AI shows loading state or error

### 4. Abort Errors
**Handling**: Silently ignored (expected when user sends new message)

---

## Performance Characteristics

### Bundle Size (Production Build)
- **Client**: ~500KB (including KaTeX)
- **Server**: N/A (Node.js runtime)

### Initial Load Time
- **Empty State**: < 1s
- **With Chat History**: < 1.5s (depends on localStorage size)

### Streaming Latency
- **First Token**: ~500-1000ms (xAI API latency)
- **Token Rate**: 20-50 tokens/second
- **UI Update**: 100ms throttle

### API Response Times
- **Dictionary**: 100-300ms
- **Wikipedia**: 200-500ms
- **xAI (First Token)**: 500-1000ms
- **xAI (Streaming)**: Real-time

---

## Known Issues & Limitations

### Current Limitations
1. **No Mobile Optimization**: Layout breaks on small screens
2. **LocalStorage Only**: Chat history limited by browser storage (typically 5-10MB)
3. **No Search**: Can't search within conversations
4. **No Export**: Can't export conversations
5. **No Syntax Highlighting**: Code blocks not highlighted
6. **Single Language**: English only for Dictionary/Wikipedia

### Edge Cases Handled
✅ Incomplete SSE chunks (silently ignored)
✅ Multiple rapid text selections (abort previous requests)
✅ LaTeX in streaming responses (accumulated before rendering)
✅ Empty text selection (no action taken)
✅ Long messages (scrollable with fixed input)

### Edge Cases NOT Handled
❌ Very long chat history (performance degradation)
❌ Extremely long messages (might cause layout issues)
❌ Special characters in URLs (Wikipedia lookup might fail)
❌ Concurrent streams (only one SSE stream per endpoint at a time)

---

## Testing Strategy

### Current Testing
- **Server**: Unit and integration tests with Vitest
  - `xai.test.ts`: xAI service tests
  - `chat.test.ts`: Route handler tests
  - `chat.integration.test.ts`: End-to-end API tests

### Manual Testing Checklist
- [ ] Send chat message and verify streaming
- [ ] Select single word (verify dictionary loads)
- [ ] Select phrase (verify Wikipedia loads)
- [ ] Switch between tabs
- [ ] Edit search input (verify debounce)
- [ ] Select text in explanation pane
- [ ] Create new chat
- [ ] Switch between chats
- [ ] Refresh page (verify history persists)
- [ ] Test with LaTeX equations
- [ ] Test error states (invalid API key, network error)

### Recommended Additional Testing
- Component tests for React components
- E2E tests with Playwright or Cypress
- Performance testing with Lighthouse
- Accessibility testing with axe-core
- Cross-browser testing (Chrome, Firefox, Safari)
