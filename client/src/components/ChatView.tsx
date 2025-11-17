import React, { useEffect, useRef } from "react";
import useChatAPI from "../hooks/useChatAPI";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

const ChatView: React.FC = () => {
  const { messages, sendMessage, isLoading, error, clearError } = useChatAPI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    clearError();
    await sendMessage(text);
  };

  // Empty state - centered input
  if (!hasMessages) {
    return (
      <div className="chat-view-empty">
        <div className="empty-state-container">
          <h1 className="empty-state-title">How can I help you today?</h1>
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat state - messages + fixed input at bottom
  return (
    <div className="chat-view">
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isLoading && message.sender === "ai" && message.id === messages[messages.length - 1]?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-fixed">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={clearError}>Dismiss</button>
          </div>
        )}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatView;
