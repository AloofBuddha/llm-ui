import React from 'react';
import MessageBubble from './MessageBubble';
import TooltipOverlay from './TooltipOverlay';
import useTooltip from '../hooks/useTooltip';
import { Message } from '../types';

interface ChatViewProps {
  messages: Message[];
}

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
  const { tooltip, isVisible, lookup, hideTooltip } = useTooltip();

  const handleDoubleClick = (content: string, event: React.MouseEvent) => {
    // Get surrounding context (basic implementation)
    const contextStart = Math.max(0, content.length - 100);
    const context = content.substring(contextStart) + " (selected text)";
    lookup(content, context);
  };

  return (
    <div className="chat-view">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message.text} onDoubleClick={handleDoubleClick} />
      ))}
      {isVisible && tooltip && (
        <TooltipOverlay
          content={tooltip.content || (tooltip.loading ? "Loading..." : tooltip.error || "")}
          isVisible={true}
          position={{ top: 100, left: 100 }}
          onClose={hideTooltip}
        />
      )}
    </div>
  );
};

export default ChatView;