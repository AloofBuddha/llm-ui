import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const { sender, text } = message;
  const isUser = sender === "user";

  if (isUser) {
    return (
      <div className="message-bubble message-user">
        <div className="user-avatar">U</div>
        <div className="message-content">
          <p>{text}</p>
        </div>
      </div>
    );
  }

  // AI message - plain text on dark background
  return (
    <div className="message-bubble message-ai">
      <div className="message-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
        {isStreaming && (
          <span className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
