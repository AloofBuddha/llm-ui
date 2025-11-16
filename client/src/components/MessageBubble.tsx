import React from "react";

interface MessageBubbleProps {
  message: string;
  onDoubleClick: (content: string, event: React.MouseEvent) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onDoubleClick,
}) => {
  return (
    <div
      className="message-bubble"
      onDoubleClick={(e) => onDoubleClick(message, e)}
    >
      {message}
    </div>
  );
};

export default MessageBubble;
