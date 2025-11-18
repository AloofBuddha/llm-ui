import React from "react";

interface Chat {
  id: string;
  name: string;
  messageCount: number;
}

interface LeftPaneProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

const LeftPane: React.FC<LeftPaneProps> = ({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
}) => {
  return (
    <div className={`left-pane ${chats.length === 0 ? "invisible" : ""}`}>
      {chats.length > 0 && (
        <>
          {/* New Chat Button */}
          <div className="left-pane-header">
            <button className="new-chat-button" onClick={onNewChat}>
              <span className="new-chat-icon">+</span>
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="chat-history">
            <div className="chat-list">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`chat-item ${activeChat === chat.id ? "active" : ""}`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="chat-item-name">{chat.name}</div>
                  <div className="chat-item-meta">{chat.messageCount} messages</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeftPane;
