# AI User Experience Double Click Project

## Overview

This project is designed to enhance user interaction with AI-generated responses by allowing users to double-click on phrases within the chat interface. When a phrase is double-clicked, a tooltip will appear, providing additional information fetched from the server.

## Project Structure

The project is divided into two main parts: the client and the server.

### Client

The client is a React application that handles the user interface and interactions.

- **src/index.tsx**: Entry point for the React application.
- **src/App.tsx**: Main application component that integrates the chat view.
- **src/components**: Contains various components:
  - **ChatView.tsx**: Displays chat messages and handles user interactions.
  - **MessageBubble.tsx**: Represents individual chat messages.
  - **DoubleClickHandler.tsx**: Manages double-click events and communicates with the tooltip.
  - **TooltipOverlay.tsx**: Displays additional information when a phrase is double-clicked.
- **src/hooks**: Custom hooks for managing state and interactions.
  - **useChat.ts**: Manages chat state and server interactions.
  - **useTooltip.ts**: Manages tooltip visibility and content.
- **src/styles/app.css**: CSS styles for the application.
- **src/types/index.ts**: TypeScript interfaces and types used in the client.

### Server

The server is built with Express and handles API requests to xAI's Grok via the OpenAI SDK (xAI API is OpenAI-compatible).

- **src/index.ts**: Entry point for the server application with Express setup and CORS configuration.
- **src/routes/chat.ts**: Route handler for the `/api/chat` endpoint with Server-Sent Events (SSE) streaming.
- **src/services/xai.ts**: Functions to interact with the xAI Grok API via OpenAI SDK, including the `streamChat` function.
- **src/types/index.ts**: TypeScript interfaces and types used in the server.

## Setup Instructions

1. Clone the repository:

   ```
   git clone <repository-url>
   cd ai-ux-doubleclick
   ```

2. Install dependencies for the client:

   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:

   ```
   cd server
   npm install
   ```

4. Set up environment variables:

   - For the **server**, copy `.env.example` to `.env` and add your `XAI_API_KEY`.
   - For the **client**, copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:3001`.

5. Start the server:

   ```
   cd server
   npm run dev
   ```

6. In a separate terminal, start the client:
   ```
   cd client
   npm run dev
   ```

## Development

- **Server**: Runs on `http://localhost:3001` with hot-reload via `tsx`
- **Client**: Runs on `http://localhost:3000` with Vite dev server
- **Testing**: Run `npm run test:run` in the server directory to execute vitest
- **Linting**: Run `npm run lint` in either directory to check code quality

## Usage

- Open the application in your browser.
- Interact with the chat by double-clicking on phrases to see additional information in the tooltip.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
