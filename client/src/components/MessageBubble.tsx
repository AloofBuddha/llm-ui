import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Message } from "../types";
import { UsePopoverReturn } from "../hooks/usePopover";
import { fixLatex } from "../utils/fixLatex";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  popover?: UsePopoverReturn;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  popover,
}) => {
  const { sender, text } = message;
  const isUser = sender === "user";

  // Handle text selection (only for AI messages)
  const handleTextSelection = () => {
    if (isUser || !popover) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText || selectedText.length === 0) {
      // No text selected - close the popover
      popover.hidePopover();
      return;
    }

    // Get selection position (not used anymore but kept for API compatibility)
    const range = selection?.getRangeAt(0);
    if (!range) return;

    const rect = range.getBoundingClientRect();
    const position = {
      x: rect.right + 10,
      y: rect.top - 10,
    };

    // Show explanation pane with selected text and full message as context
    popover.showPopover(selectedText, text, position);

    // Keep the selection (don't clear it so user can copy/paste)
  };

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
  // Fix bare LaTeX commands by wrapping them in $ delimiters
  const fixedText = fixLatex(text);

  return (
    <div className="message-bubble message-ai">
      <div className="message-content" onMouseUp={handleTextSelection}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {fixedText}
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
